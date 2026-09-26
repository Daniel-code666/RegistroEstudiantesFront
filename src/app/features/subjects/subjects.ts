import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../../core/api';
import { Page, Subject, User } from '../../core/models';
import { Session } from '../../core/session';
import { Ui } from '../../shared/ui';
import { FieldError } from '../../shared/field-error/field-error';
import { requiredText } from '../../shared/form-fields';
import { Pager } from '../../shared/pager/pager';
import { ListState } from '../../shared/list-state';
import { LoadState } from '../../shared/load-state/load-state';
@Component({
  selector: 'app-subjects', imports: [ReactiveFormsModule, RouterLink, FieldError, Pager, LoadState],
  templateUrl: './subjects.html'
})
export class Subjects {
  private readonly api = inject(Api); private readonly fb = inject(FormBuilder); readonly ui = inject(Ui);
  readonly professor = inject(Session).user()?.role === 'Professor'; readonly available = signal(false); readonly list = new ListState<Subject>();
  readonly editing = signal(false); readonly selected = signal<Subject | null>(null); readonly professors = signal<User[]>([]); readonly lookupError = signal('');
  readonly filters = this.fb.nonNullable.group({ search: '', active: 'true' });
  readonly form = this.fb.group({ name: this.fb.nonNullable.control('', requiredText(100)), description: this.fb.nonNullable.control('', requiredText(500)), professorId: this.fb.control<number | null>(null) });
  get base(): string { return this.professor ? 'professors/me/subjects' : 'Subject'; }
  constructor() { void this.load(); if (!this.professor) void this.loadProfessors(); }
  async loadProfessors(): Promise<void> {
    this.lookupError.set('');
    try {
      const users: User[] = []; let page = 1; let total = 0;
      do { const result = await this.api.get<Page<User>>('users', { role: 'Professor', pageNumber: page++, pageSize: 100 }); users.push(...result.items); total = result.totalRecords; if (!result.items.length) break; } while (users.length < total);
      this.professors.set(users);
    } catch (error) { this.lookupError.set(errorMessage(error)); }
  }
  load(page = 1): Promise<void> { const filters = this.filters.getRawValue(); const path = this.base + (this.available() ? '/available' : ''); return this.list.load(p => this.api.get<Page<Subject>>(path, { ...filters, pageNumber: p, pageSize: this.list.pageSize() }), page); }
  changeView(available: boolean): void { this.available.set(available); this.editing.set(false); this.filters.reset({ search: '', active: 'true' }); void this.load(); }
  edit(subject: Subject | null): void { this.selected.set(subject); this.form.reset({ name: '', description: '', professorId: null }); if (subject) this.form.patchValue(subject); this.editing.set(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  save(): void {
    this.form.markAllAsTouched(); if (this.form.invalid) return; const subject = this.selected(); const value = { ...this.form.getRawValue(), credits: 3 };
    this.ui.confirm(subject ? 'Actualizar materia' : 'Crear materia', `Se guardará la materia «${value.name}» con 3 créditos.`, async () => {
      if (subject) await this.api.put(`${this.base}/${subject.id}`, value); else await this.api.post(this.base, value);
      this.editing.set(false); this.available.set(false); this.ui.success(); await this.load();
    });
  }
  toggle(subject: Subject): void {
    this.ui.confirm(subject.active ? 'Desactivar materia' : 'Activar materia', `${subject.active ? 'Se desactivará' : 'Se activará'} «${subject.name}». ${subject.active ? 'No debe tener estudiantes inscritos.' : 'Se validará la capacidad del profesor.'}`, async () => {
      if (subject.active) await this.api.delete(`${this.base}/${subject.id}`); else await this.api.patch(`${this.base}/${subject.id}/activate`); this.ui.success(); await this.load(this.list.data().pageNumber);
    }, subject.active);
  }
  assignment(subject: Subject, assign: boolean): void {
    this.ui.confirm(assign ? 'Asignarme materia' : 'Desasignarme materia', assign ? `Serás el profesor de «${subject.name}». Puedes tener hasta 2 materias activas.` : `Dejarás de ser profesor de «${subject.name}». No debe tener estudiantes inscritos y dejará de aparecer en tus materias.`, async () => {
      if (assign) await this.api.put(`${this.base}/${subject.id}/assignment`); else await this.api.delete(`${this.base}/${subject.id}/assignment`); this.ui.success(); await this.load(this.list.data().pageNumber);
    }, !assign);
  }
}
