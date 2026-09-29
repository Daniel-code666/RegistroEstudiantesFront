import { Injectable, signal } from '@angular/core';
import { errorMessage } from '../core/api';

export interface Confirmation {
  title: string;
  message: string;
  action: () => Promise<void>;
  dangerous: boolean;
}
@Injectable({ providedIn: 'root' })
export class Ui {
  readonly confirmation = signal<Confirmation | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  confirm(title: string, message: string, action: () => Promise<void>, dangerous = false): void {
    if (this.confirmation()) return;
    this.error.set('');
    this.confirmation.set({ title, message, action, dangerous });
  }
  cancel(): void {
    if (!this.busy()) this.confirmation.set(null);
  }
  async accept(): Promise<void> {
    if (this.busy() || !this.confirmation()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.confirmation()!.action();
      this.confirmation.set(null);
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }
  success(message = 'Los cambios se guardaron correctamente.'): void {
    this.notice.set(message);
  }
}
