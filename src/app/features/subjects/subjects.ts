import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api';
import { Subject, User } from '../../core/models';
import { Session } from '../../core/session';
import { SubjectsService } from '../../core/services/subjects.service';
import { UsersService } from '../../core/services/users.service';
import { Ui } from '../../shared/ui';
import { FieldError } from '../../shared/field-error/field-error';
import { requiredText } from '../../shared/form-fields';
import { Pager } from '../../shared/pager/pager';
import { ListState } from '../../shared/list-state';
import { LoadState } from '../../shared/load-state/load-state';
@Component({
  selector: 'app-subjects',
  imports: [ReactiveFormsModule, RouterLink, FieldError, Pager, LoadState],
  templateUrl: './subjects.html',
})
export class Subjects {
  private readonly subjects = inject(SubjectsService);
  private readonly users = inject(UsersService);
  private readonly fb = inject(FormBuilder);
  readonly ui = inject(Ui);
  readonly professor = inject(Session).user()?.role === 'Professor';
  readonly available = signal(false);
  readonly list = new ListState<Subject>();
  readonly editing = signal(false);
  readonly selected = signal<Subject | null>(null);
  readonly professors = signal<User[]>([]);
  readonly lookupError = signal('');
  readonly filters = this.fb.nonNullable.group({ search: '', active: 'true' });
  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', requiredText(100)),
    description: this.fb.nonNullable.control('', requiredText(500)),
    professorId: this.fb.control<number | null>(null),
  });
  constructor() {
    void this.load();
    if (!this.professor) void this.loadProfessors();
  }
  async loadProfessors(): Promise<void> {
    this.lookupError.set('');
    try {
      this.professors.set(await this.users.getProfessors());
    } catch (error) {
      this.lookupError.set(errorMessage(error));
    }
  }
  load(page = 1): Promise<void> {
    const filters = this.filters.getRawValue();
    return this.list.load(
      (p) =>
        this.subjects.getAll(
          { ...filters, pageNumber: p, pageSize: this.list.pageSize() },
          this.professor,
          this.available(),
        ),
      page,
    );
  }
  changeView(available: boolean): void {
    this.available.set(available);
    this.editing.set(false);
    this.filters.reset({ search: '', active: 'true' });
    void this.load();
  }
  edit(subject: Subject | null): void {
    this.selected.set(subject);
    this.form.reset({ name: '', description: '', professorId: null });
    if (subject) this.form.patchValue(subject);
    this.editing.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const subject = this.selected();
    const value = { ...this.form.getRawValue(), credits: 3 };
    this.ui.confirm(
      subject ? 'Actualizar materia' : 'Crear materia',
      `Se guardará la materia «${value.name}» con 3 créditos.`,
      async () => {
        if (subject) await this.subjects.update(subject.id, value, this.professor);
        else await this.subjects.create(value, this.professor);
        this.editing.set(false);
        this.available.set(false);
        this.ui.success();
        await this.load();
      },
    );
  }
  toggle(subject: Subject): void {
    this.ui.confirm(
      subject.active ? 'Desactivar materia' : 'Activar materia',
      `${subject.active ? 'Se desactivará' : 'Se activará'} «${subject.name}». ${subject.active ? 'No debe tener estudiantes inscritos.' : 'Se validará la capacidad del profesor.'}`,
      async () => {
        await this.subjects.setActive(subject.id, !subject.active, this.professor);
        this.ui.success();
        await this.load(this.list.data().pageNumber);
      },
      subject.active,
    );
  }
  assignment(subject: Subject, assign: boolean): void {
    this.ui.confirm(
      assign ? 'Asignarme materia' : 'Desasignarme materia',
      assign
        ? `Serás el profesor de «${subject.name}». Puedes tener hasta 2 materias activas.`
        : `Dejarás de ser profesor de «${subject.name}». No debe tener estudiantes inscritos y dejará de aparecer en tus materias.`,
      async () => {
        await this.subjects.setAssignment(subject.id, assign);
        this.ui.success();
        await this.load(this.list.data().pageNumber);
      },
      !assign,
    );
  }
}
