import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api';
import { Role, User, roleLabel } from '../../core/models';
import { Session } from '../../core/session';
import { RolesService } from '../../core/services/roles.service';
import { UsersService } from '../../core/services/users.service';
import { Ui } from '../../shared/ui';
import { UserFields } from '../../shared/user-fields/user-fields';
import { FieldError } from '../../shared/field-error/field-error';
import { userFields } from '../../shared/form-fields';
import { Pager } from '../../shared/pager/pager';
import { ListState } from '../../shared/list-state';
import { LoadState } from '../../shared/load-state/load-state';
@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, RouterLink, UserFields, FieldError, Pager, LoadState],
  templateUrl: './users.html',
})
export class Users {
  private readonly users = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly fb = inject(FormBuilder);
  private readonly session = inject(Session);
  readonly ui = inject(Ui);
  readonly roleLabel = roleLabel;
  readonly list = new ListState<User>();
  readonly roles = signal<Role[]>([]);
  readonly lookupError = signal('');
  readonly editing = signal(false);
  readonly selected = signal<User | null>(null);
  readonly resetUser = signal<User | null>(null);
  readonly filters = this.fb.nonNullable.group({ search: '', role: '', active: '' });
  readonly form = this.fb.group({
    ...userFields(this.fb),
    role: this.fb.nonNullable.control('Student', Validators.required),
    password: this.fb.nonNullable.control(''),
  });
  readonly resetForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
  });
  constructor() {
    void this.load();
    void this.loadRoles();
  }
  async loadRoles(): Promise<void> {
    this.lookupError.set('');
    try {
      this.roles.set(await this.rolesService.getAll());
    } catch (error) {
      this.lookupError.set(errorMessage(error));
    }
  }
  load(page = 1): Promise<void> {
    const value = this.filters.getRawValue();
    return this.list.load(
      (p) => this.users.getAll({ ...value, pageNumber: p, pageSize: this.list.pageSize() }),
      page,
    );
  }
  edit(user: User | null): void {
    this.closeReset();
    this.selected.set(user);
    this.form.reset({
      name: '',
      lastName: '',
      email: '',
      identificationType: 'CedulaCiudadania',
      identificationNumber: '',
      role: 'Student',
      password: '',
    });
    this.form.controls.password.setValidators(
      user ? [] : [Validators.required, Validators.minLength(8), Validators.maxLength(128)],
    );
    this.form.controls.password.updateValueAndValidity();
    if (user) this.form.patchValue(user);
    this.editing.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { password, ...value } = this.form.getRawValue();
    const user = this.selected();
    this.ui.confirm(
      user ? 'Actualizar usuario' : 'Crear usuario',
      `Se guardarán los datos de ${value.name} ${value.lastName} con rol ${roleLabel(value.role)}.`,
      async () => {
        if (user) await this.users.update(user.id, value);
        else await this.users.create({ ...value, password });
        this.editing.set(false);
        this.form.reset();
        this.ui.success();
        if (user?.id === this.session.user()?.id && user?.role !== value.role)
          this.session.logout();
        else await this.load(this.list.data().pageNumber);
      },
    );
  }
  toggle(user: User): void {
    this.ui.confirm(
      user.active ? 'Desactivar usuario' : 'Activar usuario',
      `${user.active ? 'Se desactivará' : 'Se activará'} la cuenta de ${user.name} ${user.lastName}.`,
      async () => {
        await this.users.setActive(user.id, !user.active);
        this.ui.success();
        if (user.id === this.session.user()?.id) this.session.logout();
        else await this.load(this.list.data().pageNumber);
      },
      user.active,
    );
  }
  openReset(user: User): void {
    this.editing.set(false);
    this.resetForm.reset();
    this.resetUser.set(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  closeReset(): void {
    this.resetForm.reset();
    this.resetUser.set(null);
  }
  resetPassword(): void {
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid) return;
    const user = this.resetUser()!;
    const value = this.resetForm.getRawValue();
    this.ui.confirm(
      'Restablecer contraseña',
      `Se cambiará la contraseña de ${user.name} ${user.lastName} y se invalidarán sus sesiones anteriores.`,
      async () => {
        await this.users.resetPassword(user.id, value);
        this.closeReset();
        this.ui.success('Contraseña restablecida.');
        if (user.id === this.session.user()?.id) this.session.logout();
      },
      true,
    );
  }
}
