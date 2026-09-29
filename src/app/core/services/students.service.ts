import { Injectable, inject } from '@angular/core';
import { Api } from '../api';
import { Page, StudentRecord } from '../models';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly api = inject(Api);

  getAll(pageNumber: number, pageSize: number): Promise<Page<StudentRecord>> {
    return this.api.get<Page<StudentRecord>>('students', { pageNumber, pageSize });
  }
}
