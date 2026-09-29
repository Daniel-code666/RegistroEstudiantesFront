import { Injectable, inject } from '@angular/core';
import { Api } from '../api';
import { Page, User } from '../models';

export interface UserFilters {
  search?: string;
  role?: string;
  active?: string | boolean;
  pageNumber: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(Api);

  getAll(filters: UserFilters): Promise<Page<User>> {
    return this.api.get<Page<User>>('users', { ...filters });
  }

  getById(id: string | number): Promise<User> {
    return this.api.get<User>(`users/${id}`);
  }

  getCurrent(): Promise<User> {
    return this.api.get<User>('users/me');
  }

  create(request: unknown): Promise<void> {
    return this.api.post<void>('users', request);
  }

  update(id: number, request: unknown): Promise<void> {
    return this.api.put<void>(`users/${id}`, request);
  }

  setActive(id: number, active: boolean): Promise<void> {
    return active
      ? this.api.patch<void>(`users/${id}/activate`)
      : this.api.delete<void>(`users/${id}`);
  }

  resetPassword(id: number, request: unknown): Promise<void> {
    return this.api.put<void>(`users/${id}/password`, request);
  }

  register(request: unknown): Promise<void> {
    return this.api.post<void>('users/register', request);
  }

  updateProfile(request: unknown): Promise<User> {
    return this.api.put<User>('users/me', request);
  }

  changePassword(request: unknown): Promise<void> {
    return this.api.put<void>('users/me/password', request);
  }

  async getProfessors(): Promise<User[]> {
    const users: User[] = [];
    let pageNumber = 1;
    let totalRecords = 0;
    do {
      const page = await this.getAll({
        role: 'Professor',
        pageNumber: pageNumber++,
        pageSize: 100,
      });
      users.push(...page.items);
      totalRecords = page.totalRecords;
      if (!page.items.length) break;
    } while (users.length < totalRecords);
    return users;
  }
}
