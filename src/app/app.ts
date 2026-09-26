import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Session } from './core/session';
import { roleLabel } from './core/models';
import { Ui } from './shared/ui';
import { ConfirmDialog } from './shared/confirm-dialog/confirm-dialog';
@Component({
  selector: 'app-root', imports: [RouterLink, RouterLinkActive, RouterOutlet, ConfirmDialog],
  templateUrl: './app.html'
})
export class App {
  readonly session = inject(Session); readonly ui = inject(Ui); readonly roleLabel = roleLabel;
  logout(): void { this.ui.confirm('Cerrar sesión', 'Se cerrará tu sesión en este navegador.', async () => { this.ui.notice.set(''); this.session.logout(); }); }
}
