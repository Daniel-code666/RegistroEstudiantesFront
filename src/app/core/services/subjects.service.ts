import { Injectable, inject } from '@angular/core';
import { Api } from '../api';
import { Page, PersonName, Subject } from '../models';

export interface SubjectFilters {
  search?: string;
  active?: string | boolean;
  pageNumber: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  private readonly api = inject(Api);

  getAll(filters: SubjectFilters, professor = false, available = false): Promise<Page<Subject>> {
    const path = this.base(professor) + (available ? '/available' : '');
    return this.api.get<Page<Subject>>(path, { ...filters });
  }

  getById(id: string | number): Promise<Subject> {
    return this.api.get<Subject>(`Subject/${id}`);
  }

  create(request: unknown, professor = false): Promise<void> {
    return this.api.post<void>(this.base(professor), request);
  }

  update(id: number, request: unknown, professor = false): Promise<void> {
    return this.api.put<void>(`${this.base(professor)}/${id}`, request);
  }

  setActive(id: number, active: boolean, professor = false): Promise<void> {
    const path = `${this.base(professor)}/${id}`;
    return active ? this.api.patch<void>(`${path}/activate`) : this.api.delete<void>(path);
  }

  setAssignment(id: number, assigned: boolean): Promise<void> {
    const path = `${this.base(true)}/${id}/assignment`;
    return assigned ? this.api.put<void>(path) : this.api.delete<void>(path);
  }

  getProfessorStudents(
    subjectId: string | number,
    pageNumber: number,
    pageSize: number,
  ): Promise<Page<PersonName>> {
    return this.api.get<Page<PersonName>>(`professors/me/subjects/${subjectId}/students`, {
      pageNumber,
      pageSize,
    });
  }

  private base(professor: boolean): string {
    return professor ? 'professors/me/subjects' : 'Subject';
  }
}
