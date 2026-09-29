import { HttpErrorResponse, HttpParams } from '@angular/common/http';

export function toHttpParams(parameters: object): HttpParams {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null) {
      params = params.set(key, String(value));
    }
  }

  return params;
}

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No se pudo conectar con el servidor. Intenta nuevamente.';
    const errors = error.error?.errors;
    if (errors && typeof errors === 'object') return Object.values(errors).flat().join(' ');
    if (typeof error.error?.detail === 'string') return error.error.detail;
    if (error.status === 401)
      return 'La sesión no es válida o ha vencido. Inicia sesión nuevamente.';
    if (error.status === 403) return 'No tienes permiso para realizar esta acción.';
    if (error.status === 404) return 'El registro solicitado no está disponible.';
  }
  return 'No se pudo completar la operación. Intenta nuevamente.';
}
