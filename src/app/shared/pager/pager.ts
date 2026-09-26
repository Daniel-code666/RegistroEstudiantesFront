import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.html'
})
export class Pager {
  readonly total = input(0);
  readonly page = input(1);
  readonly size = input(10);
  readonly busy = input(false);
  readonly changed = output<number>();
  readonly sizeChanged = output<number>();
  readonly sizes = [10, 25, 50, 100];

  get pages(): number { return Math.max(1, Math.ceil(this.total() / this.size())); }
  get first(): number { return this.total() ? (this.page() - 1) * this.size() + 1 : 0; }
  get last(): number { return Math.min(this.page() * this.size(), this.total()); }

  changeSize(value: string): void {
    const size = Number(value);
    if (this.sizes.includes(size)) this.sizeChanged.emit(size);
  }
}