import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../../core/api';
import { Enrollment as EnrollmentData, Page, Subject, User } from '../../core/models';
import { Ui } from '../../shared/ui';
import { Pager } from '../../shared/pager/pager';
import { ListState } from '../../shared/list-state';
import { LoadState } from '../../shared/load-state/load-state';
@Component({
  selector: 'app-enrollment', imports: [ReactiveFormsModule, RouterLink, Pager, LoadState],
  templateUrl: './enrollment.html'
})
export class Enrollment {
  private readonly api = inject(Api); private readonly fb = inject(FormBuilder); readonly ui = inject(Ui);
  readonly userId = inject(ActivatedRoute).snapshot.paramMap.get('userId');
  readonly base = `enrollments/${this.userId ?? 'me'}`;
  readonly studentName = signal(''); readonly active = signal(true); readonly loading = signal(false); readonly error = signal(''); readonly selectionError = signal('');
  readonly current = signal<Subject[]>([]); readonly selected = signal<Subject[]>([]); readonly list = new ListState<Subject>();
  readonly filters = this.fb.nonNullable.group({ search: '' }); readonly form = this.fb.nonNullable.group({ subjectIds: this.fb.nonNullable.control<number[]>([]) });
  get credits(): number { return this.selected().reduce((total, subject) => total + subject.credits, 0); }
  constructor() { void this.loadEnrollment(); void this.loadSubjects(); }
  async loadEnrollment(): Promise<void> {
    this.loading.set(true); this.error.set('');
    try {
      if (this.userId) { const user = await this.api.get<User>(`users/${this.userId}`); this.studentName.set(`${user.name} ${user.lastName}`); this.active.set(user.active); }
      const enrollment = await this.api.get<EnrollmentData>(this.base); this.current.set(enrollment.subjects); this.selected.set([...enrollment.subjects]); this.form.reset({ subjectIds: enrollment.subjects.map(s => s.id) }); this.selectionError.set('');
    } catch (error) { this.error.set(errorMessage(error)); } finally { this.loading.set(false); }
  }
  loadSubjects(page = 1): Promise<void> { return this.list.load(p => this.api.get<Page<Subject>>('Subject', { search: this.filters.controls.search.value, active: true, pageNumber: p, pageSize: this.list.pageSize() }), page); }
  isSelected(id: number): boolean { return this.selected().some(s => s.id === id); }
  reason(subject: Subject): string {
    if (!subject.professorId) return 'Sin profesor asignado.';
    if (this.selected().length >= 3) return 'Ya seleccionaste 3 materias.';
    if (this.selected().some(s => s.professorId === subject.professorId)) return 'Ya seleccionaste otra materia del mismo profesor.';
    return '';
  }
  choose(subject: Subject): void {
    if (!this.active()) return;
    if (!this.isSelected(subject.id) && this.reason(subject)) { this.selectionError.set(this.reason(subject)); return; }
    this.selected.update(items => this.isSelected(subject.id) ? items.filter(s => s.id !== subject.id) : [...items, subject]);
    this.form.controls.subjectIds.setValue(this.selected().map(s => s.id)); this.form.markAsDirty(); this.selectionError.set('');
  }
  save(): void {
    const value = this.form.getRawValue(); const subjects = this.selected().map(s => s.name).join(', ');
    this.ui.confirm('Guardar inscripción', value.subjectIds.length ? `Se inscribirán ${subjects}. Total: ${this.credits} créditos. Esta selección reemplaza la inscripción anterior.` : 'Se retirarán todas las materias de esta inscripción.', async () => {
      await this.api.put(this.base, value); this.ui.success('Inscripción actualizada.'); await this.loadEnrollment();
    }, !value.subjectIds.length);
  }
  remove(subject: Subject): void { this.ui.confirm('Retirar materia', `Se retirará «${subject.name}» de la inscripción. La selección pendiente se recargará con las materias guardadas.`, async () => { await this.api.delete(`${this.base}/${subject.id}`); this.ui.success('Materia retirada.'); await this.loadEnrollment(); }, true); }
  classmatesLink(subjectId: number): string[] { return this.userId ? ['/inscripciones', this.userId, 'materias', String(subjectId), 'companeros'] : ['/inscripcion/materias', String(subjectId), 'companeros']; }
}
