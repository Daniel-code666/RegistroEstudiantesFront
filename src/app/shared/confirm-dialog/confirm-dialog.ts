import { Component, effect, inject, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Ui } from '../ui';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html'
})
export class ConfirmDialog implements OnDestroy {
  readonly ui = inject(Ui);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private previousFocus: HTMLElement | null = null;
  constructor() {
    effect(() => {
      if (this.ui.confirmation()) {
        this.previousFocus = document.activeElement as HTMLElement;
        document.body.classList.add('modal-open');
        document.querySelector('main')?.setAttribute('inert', '');
        document.querySelector('header')?.setAttribute('inert', '');
        setTimeout(() => this.element.nativeElement.querySelector<HTMLButtonElement>('.cancel-confirm')?.focus());
      } else { this.restore(); }
    });
  }
  backdrop(event: MouseEvent): void { if (event.target === event.currentTarget) this.ui.cancel(); }
  @HostListener('document:keydown', ['$event'])
  keydown(event: KeyboardEvent): void {
    if (!this.ui.confirmation()) return;
    if (event.key === 'Escape') { event.preventDefault(); this.ui.cancel(); }
    if (event.key !== 'Tab') return;
    const buttons = Array.from(this.element.nativeElement.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    const first = buttons[0], last = buttons.at(-1);
    if (!first || !last) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  private restore(): void {
    document.body.classList.remove('modal-open');
    document.querySelector('main')?.removeAttribute('inert');
    document.querySelector('header')?.removeAttribute('inert');
    this.previousFocus?.focus();
    this.previousFocus = null;
  }
  ngOnDestroy(): void { this.restore(); }
}
