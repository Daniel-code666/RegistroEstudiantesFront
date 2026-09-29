import { Injectable, inject } from '@angular/core';
import { Api } from '../api';
import { Enrollment, Page, PersonName } from '../models';

@Injectable({ providedIn: 'root' })
export class EnrollmentsService {
  private readonly api = inject(Api);

  get(userId: string | null): Promise<Enrollment> {
    return this.api.get<Enrollment>(this.base(userId));
  }

  update(userId: string | null, request: unknown): Promise<void> {
    return this.api.put<void>(this.base(userId), request);
  }

  removeSubject(userId: string | null, subjectId: number): Promise<void> {
    return this.api.delete<void>(`${this.base(userId)}/${subjectId}`);
  }

  getClassmates(
    userId: string | null,
    subjectId: string | number,
    pageNumber: number,
    pageSize: number,
  ): Promise<Page<PersonName>> {
    return this.api.get<Page<PersonName>>(`${this.base(userId)}/${subjectId}/classmates`, {
      pageNumber,
      pageSize,
    });
  }

  private base(userId: string | null): string {
    return `enrollments/${userId ?? 'me'}`;
  }
}
