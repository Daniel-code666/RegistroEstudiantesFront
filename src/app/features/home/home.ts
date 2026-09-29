import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '../../core/session';
@Component({ selector: 'app-home', template: '<p role="status">Abriendo tu espacio…</p>' })
export class Home {
  constructor() {
    void inject(Router).navigateByUrl(inject(Session).home(), { replaceUrl: true });
  }
}
