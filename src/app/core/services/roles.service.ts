import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Role } from '../models';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/Role';

  getAll(): Promise<Role[]> {
    return firstValueFrom(this.http.get<Role[]>(this.url));
  }

  create(request: unknown): Promise<void> {
    return firstValueFrom(this.http.post<void>(this.url, request));
  }

  update(id: number, request: unknown): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.url}/${id}`, request));
  }

  setActive(id: number, active: boolean): Promise<void> {
    return active
      ? firstValueFrom(this.http.patch<void>(`${this.url}/${id}/activate`, {}))
      : firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }
}
