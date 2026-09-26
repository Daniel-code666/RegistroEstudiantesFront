import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { Ui } from '../../shared/ui';
import { FieldError } from '../../shared/field-error/field-error';
import { UserFields } from '../../shared/user-fields/user-fields';
import { userFields } from '../../shared/form-fields';
@Component({
  selector: 'app-register', imports: [ReactiveFormsModule, RouterLink, UserFields, FieldError],
  templateUrl: './register.html'
})
export class Register {
  private readonly fb = inject(FormBuilder); private readonly api = inject(Api); private readonly router = inject(Router);
  readonly ui = inject(Ui); readonly mismatch = signal(false);
  readonly form = this.fb.group({ ...userFields(this.fb), password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]), confirmation: this.fb.nonNullable.control('', Validators.required) });
  save(): void {
    this.form.markAllAsTouched(); const { confirmation, ...value } = this.form.getRawValue();
    this.mismatch.set(confirmation !== value.password); if (this.form.invalid || this.mismatch()) return;
    this.ui.confirm('Crear cuenta', `Se creará una cuenta de estudiante para ${value.name} ${value.lastName}.`, async () => {
      await this.api.post('users/register', value); this.form.reset(); this.ui.success('Cuenta creada. Ya puedes iniciar sesión.'); await this.router.navigateByUrl('/login');
    });
  }
}
