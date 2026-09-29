import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { toHttpParams } from '../api';
import { Enrollment, Page, PersonName } from '../models';

@Injectable({ providedIn: 'root' })
export class EnrollmentsService {
  private readonly http = inject(HttpClient);

  get(userId: string | null): Promise<Enrollment> {
    return firstValueFrom(this.http.get<Enrollment>(this.base(userId)));
  }

  update(userId: string | null, request: unknown): Promise<void> {
    return firstValueFrom(this.http.put<void>(this.base(userId), request));
  }

  removeSubject(userId: string | null, subjectId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base(userId)}/${subjectId}`));
  }

  getClassmates(
    userId: string | null,
    subjectId: string | number,
    pageNumber: number,
    pageSize: number,
  ): Promise<Page<PersonName>> {
    return firstValueFrom(
      this.http.get<Page<PersonName>>(`${this.base(userId)}/${subjectId}/classmates`, {
        params: toHttpParams({ pageNumber, pageSize }),
      }),
    );
  }

  private base(userId: string | null): string {
    return `/api/enrollments/${userId ?? 'me'}`;
  }
}
