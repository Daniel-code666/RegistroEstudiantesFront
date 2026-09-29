import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { toHttpParams } from '../api';
import { Page, StudentRecord } from '../models';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/students';

  getAll(pageNumber: number, pageSize: number): Promise<Page<StudentRecord>> {
    return firstValueFrom(
      this.http.get<Page<StudentRecord>>(this.url, {
        params: toHttpParams({ pageNumber, pageSize }),
      }),
    );
  }
}
