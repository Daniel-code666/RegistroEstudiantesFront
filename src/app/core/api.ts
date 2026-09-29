import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  get<T>(
    path: string,
    query: Record<string, string | number | boolean | null | undefined> = {},
  ): Promise<T> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) params = params.set(key, String(value));
    }
    return firstValueFrom(this.http.get<T>(`/api/${path}`, { params }));
  }
  post<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(`/api/${path}`, body));
  }
  put<T>(path: string, body: unknown = {}): Promise<T> {
    return firstValueFrom(this.http.put<T>(`/api/${path}`, body));
  }
  patch<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.patch<T>(`/api/${path}`, {}));
  }
  delete<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`/api/${path}`));
  }
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
