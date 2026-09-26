import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Session } from '../../core/session';
import { errorMessage } from '../../core/api';
import { FieldError } from '../../shared/field-error/field-error';
@Component({
  selector: 'app-login', imports: [ReactiveFormsModule, RouterLink, FieldError],
  templateUrl: './login.html'
})
export class Login {
  private readonly session = inject(Session); private readonly router = inject(Router);
  readonly expired = inject(ActivatedRoute).snapshot.queryParamMap.has('expired');
  readonly busy = signal(false); readonly error = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  async login(): Promise<void> {
    this.form.markAllAsTouched(); if (this.form.invalid || this.busy()) return;
    this.busy.set(true); this.error.set('');
    try { const value = this.form.getRawValue(); await this.session.login(value.email.trim(), value.password); await this.router.navigateByUrl(this.session.home()); }
    catch (error) { this.error.set(errorMessage(error)); }
    finally { this.busy.set(false); }
  }
}

