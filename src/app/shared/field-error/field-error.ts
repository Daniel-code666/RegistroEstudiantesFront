import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.html'
})
export class FieldError { readonly control = input<AbstractControl | null>(null); }
