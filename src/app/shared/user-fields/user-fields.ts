import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldError } from '../field-error/field-error';
@Component({
  selector: 'app-user-fields', imports: [ReactiveFormsModule, FieldError],
  templateUrl: './user-fields.html'
})
export class UserFields { readonly form = input.required<FormGroup>(); }
