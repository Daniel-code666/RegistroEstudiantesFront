import { Component, input, output } from '@angular/core';
@Component({
  selector: 'app-load-state',
  templateUrl: './load-state.html'
})
export class LoadState { readonly loading = input(false); readonly error = input(''); readonly retry = output<void>(); }
