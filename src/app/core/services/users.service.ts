import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { toHttpParams } from '../api';
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
  private readonly http = inject(HttpClient);
  private readonly url = '/api/users';

  getAll(filters: UserFilters): Promise<Page<User>> {
    return firstValueFrom(this.http.get<Page<User>>(this.url, { params: toHttpParams(filters) }));
  }

  getById(id: string | number): Promise<User> {
    return firstValueFrom(this.http.get<User>(`${this.url}/${id}`));
  }

  getCurrent(): Promise<User> {
    return firstValueFrom(this.http.get<User>(`${this.url}/me`));
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

  resetPassword(id: number, request: unknown): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.url}/${id}/password`, request));
  }

  register(request: unknown): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.url}/register`, request));
  }

  updateProfile(request: unknown): Promise<User> {
    return firstValueFrom(this.http.put<User>(`${this.url}/me`, request));
  }

  changePassword(request: unknown): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.url}/me/password`, request));
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
