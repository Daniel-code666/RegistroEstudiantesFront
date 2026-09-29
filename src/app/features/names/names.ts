import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PersonName } from '../../core/models';
import { EnrollmentsService } from '../../core/services/enrollments.service';
import { SubjectsService } from '../../core/services/subjects.service';
import { Pager } from '../../shared/pager/pager';
import { ListState } from '../../shared/list-state';
import { LoadState } from '../../shared/load-state/load-state';
@Component({
  selector: 'app-names',
  imports: [RouterLink, Pager, LoadState],
  templateUrl: './names.html',
})
export class Names {
  private readonly enrollments = inject(EnrollmentsService);
  private readonly subjects = inject(SubjectsService);
  private readonly route = inject(ActivatedRoute);
  readonly professor = this.route.snapshot.data['professor'] === true;
  readonly subjectId = this.route.snapshot.paramMap.get('subjectId')!;
  readonly userId = this.route.snapshot.paramMap.get('userId');
  readonly subjectName = signal(`Materia #${this.subjectId}`);
  readonly list = new ListState<PersonName>();
  readonly back = this.professor
    ? '/profesor'
    : this.userId
      ? `/inscripciones/${this.userId}`
      : '/inscripcion';
  constructor() {
    void this.load();
  }
  load(page = 1): Promise<void> {
    return this.list.load(async (p) => {
      const names = this.professor
        ? await this.subjects.getProfessorStudents(this.subjectId, p, this.list.pageSize())
        : await this.enrollments.getClassmates(
            this.userId,
            this.subjectId,
            p,
            this.list.pageSize(),
          );
      const subject = await this.subjects.getById(this.subjectId);
      this.subjectName.set(subject.name);
      return names;
    }, page);
  }
}
