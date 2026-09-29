import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { toHttpParams } from '../api';
import { Page, PersonName, Subject } from '../models';

export interface SubjectFilters {
  search?: string;
  active?: string | boolean;
  pageNumber: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  private readonly http = inject(HttpClient);

  getAll(filters: SubjectFilters, professor = false, available = false): Promise<Page<Subject>> {
    const path = this.base(professor) + (available ? '/available' : '');
    return firstValueFrom(this.http.get<Page<Subject>>(path, { params: toHttpParams(filters) }));
  }

  getById(id: string | number): Promise<Subject> {
    return firstValueFrom(this.http.get<Subject>(`/api/Subject/${id}`));
  }

  create(request: unknown, professor = false): Promise<void> {
    return firstValueFrom(this.http.post<void>(this.base(professor), request));
  }

  update(id: number, request: unknown, professor = false): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.base(professor)}/${id}`, request));
  }

  setActive(id: number, active: boolean, professor = false): Promise<void> {
    const path = `${this.base(professor)}/${id}`;
    return active
      ? firstValueFrom(this.http.patch<void>(`${path}/activate`, {}))
      : firstValueFrom(this.http.delete<void>(path));
  }

  setAssignment(id: number, assigned: boolean): Promise<void> {
    const path = `${this.base(true)}/${id}/assignment`;
    return assigned
      ? firstValueFrom(this.http.put<void>(path, {}))
      : firstValueFrom(this.http.delete<void>(path));
  }

  getProfessorStudents(
    subjectId: string | number,
    pageNumber: number,
    pageSize: number,
  ): Promise<Page<PersonName>> {
    return firstValueFrom(
      this.http.get<Page<PersonName>>(`/api/professors/me/subjects/${subjectId}/students`, {
        params: toHttpParams({ pageNumber, pageSize }),
      }),
    );
  }

  private base(professor: boolean): string {
    return professor ? '/api/professors/me/subjects' : '/api/Subject';
  }
}
