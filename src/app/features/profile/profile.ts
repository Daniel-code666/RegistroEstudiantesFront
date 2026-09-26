import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Api } from '../../core/api';
import { Session } from '../../core/session';
import { User, roleLabel } from '../../core/models';
import { Ui } from '../../shared/ui';
import { UserFields } from '../../shared/user-fields/user-fields';
import { FieldError } from '../../shared/field-error/field-error';
import { userFields } from '../../shared/form-fields';
@Component({
  selector: 'app-profile', imports: [ReactiveFormsModule, UserFields, FieldError],
  templateUrl: './profile.html'
})
export class Profile {
  readonly session = inject(Session); readonly ui = inject(Ui); readonly roleLabel = roleLabel;
  private readonly fb = inject(FormBuilder); private readonly api = inject(Api); readonly mismatch = signal(false);
  readonly form = this.fb.group(userFields(this.fb));
  readonly password = this.fb.nonNullable.group({ currentPassword: ['', [Validators.required, Validators.maxLength(128)]], newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]], confirmation: ['', Validators.required] });
  constructor() { if (this.session.user()) this.form.patchValue(this.session.user()!); }
  save(): void {
    this.form.markAllAsTouched(); if (this.form.invalid) return; const value = this.form.getRawValue();
    this.ui.confirm('Actualizar mi perfil', 'Se guardarán los cambios en tus datos personales.', async () => {
      const user = await this.api.put<User>('users/me', value); this.session.user.set(user); this.form.patchValue(user); this.form.markAsPristine(); this.ui.success();
    });
  }
  changePassword(): void {
    this.password.markAllAsTouched(); const { confirmation, ...value } = this.password.getRawValue();
    this.mismatch.set(confirmation !== value.newPassword); if (this.password.invalid || this.mismatch()) return;
    this.ui.confirm('Cambiar contraseña', 'Se actualizará tu contraseña y se cerrará esta sesión.', async () => {
      await this.api.put('users/me/password', value); this.password.reset(); this.ui.success('Contraseña actualizada. Ingresa con tu nueva contraseña.'); this.session.logout();
    });
  }
}
