import { Injectable, inject } from '@angular/core';
import { Api } from '../api';
import { Role } from '../models';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly api = inject(Api);

  getAll(): Promise<Role[]> {
    return this.api.get<Role[]>('Role');
  }

  create(request: unknown): Promise<void> {
    return this.api.post<void>('Role', request);
  }

  update(id: number, request: unknown): Promise<void> {
    return this.api.put<void>(`Role/${id}`, request);
  }

  setActive(id: number, active: boolean): Promise<void> {
    return active
      ? this.api.patch<void>(`Role/${id}/activate`)
      : this.api.delete<void>(`Role/${id}`);
  }
}
