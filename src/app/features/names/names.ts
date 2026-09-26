import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { Page, PersonName, Subject } from '../../core/models';
import { Pager } from '../../shared/pager/pager';
import { ListState } from '../../shared/list-state';
import { LoadState } from '../../shared/load-state/load-state';
@Component({
  selector: 'app-names', imports: [RouterLink, Pager, LoadState],
  templateUrl: './names.html'
})
export class Names {
  private readonly api = inject(Api); private readonly route = inject(ActivatedRoute);
  readonly professor = this.route.snapshot.data['professor'] === true;
  readonly subjectId = this.route.snapshot.paramMap.get('subjectId')!; readonly userId = this.route.snapshot.paramMap.get('userId');
  readonly subjectName = signal(`Materia #${this.subjectId}`); readonly list = new ListState<PersonName>();
  readonly back = this.professor ? '/profesor' : this.userId ? `/inscripciones/${this.userId}` : '/inscripcion';
  readonly path = this.professor ? `professors/me/subjects/${this.subjectId}/students` : `enrollments/${this.userId ?? 'me'}/${this.subjectId}/classmates`;
  constructor() { void this.load(); }
  load(page = 1): Promise<void> {
    return this.list.load(async p => {
      const names = await this.api.get<Page<PersonName>>(this.path, { pageNumber: p, pageSize: this.list.pageSize() });
      const subject = await this.api.get<Subject>(`Subject/${this.subjectId}`); this.subjectName.set(subject.name); return names;
    }, page);
  }
}
