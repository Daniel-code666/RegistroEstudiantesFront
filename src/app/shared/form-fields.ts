import { Validators, FormBuilder } from '@angular/forms';
export const requiredText = (max: number) => [
  Validators.required,
  Validators.pattern(/.*\S.*/),
  Validators.maxLength(max),
];
export function userFields(fb: FormBuilder) {
  return {
    name: fb.nonNullable.control('', requiredText(100)),
    lastName: fb.nonNullable.control('', requiredText(100)),
    email: fb.nonNullable.control('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(254),
    ]),
    identificationType: fb.nonNullable.control('CedulaCiudadania', Validators.required),
    identificationNumber: fb.nonNullable.control('', requiredText(30)),
  };
}
