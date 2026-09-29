import { Component, inject } from '@angular/core';
import { StudentRecord } from '../../core/models';
import { StudentsService } from '../../core/services/students.service';
import { Pager } from '../../shared/pager/pager';
import { ListState } from '../../shared/list-state';
import { LoadState } from '../../shared/load-state/load-state';
@Component({
  selector: 'app-students',
  imports: [Pager, LoadState],
  templateUrl: './students.html',
})
export class Students {
  private readonly students = inject(StudentsService);
  readonly list = new ListState<StudentRecord>();
  constructor() {
    void this.load();
  }
  load(page = 1): Promise<void> {
    return this.list.load((p) => this.students.getAll(p, this.list.pageSize()), page);
  }
  credits(student: StudentRecord): number {
    return student.subjects.reduce((total, subject) => total + subject.credits, 0);
  }
}
