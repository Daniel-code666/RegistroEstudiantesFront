import { TestBed } from '@angular/core/testing';
import { Pager } from './pager';

describe('Pager', () => {
  it('lets the user change page size and navigate to the last page', async () => {
    const fixture = TestBed.createComponent(Pager);
    fixture.componentRef.setInput('total', 63);
    fixture.componentRef.setInput('size', 25);
    fixture.componentRef.setInput('page', 2);
    const sizes: number[] = [];
    const pages: number[] = [];
    fixture.componentInstance.sizeChanged.subscribe((value) => sizes.push(value));
    fixture.componentInstance.changed.subscribe((value) => pages.push(value));
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('26–50 de 63');
    const select = element.querySelector('select')!;
    select.value = '50';
    select.dispatchEvent(new Event('change'));
    expect(sizes).toEqual([50]);
    (element.querySelector('[aria-label="Última página"]') as HTMLButtonElement).click();
    expect(pages).toEqual([3]);
  });

  it('shows an empty range and disables navigation for an empty list', async () => {
    const fixture = TestBed.createComponent(Pager);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('0–0 de 0');
    expect([...element.querySelectorAll('button')].every((button) => button.disabled)).toBe(true);
  });

  it('disables the selector and navigation while loading', async () => {
    const fixture = TestBed.createComponent(Pager);
    fixture.componentRef.setInput('total', 100);
    fixture.componentRef.setInput('page', 2);
    fixture.componentRef.setInput('busy', true);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('select')!.disabled).toBe(true);
    expect([...element.querySelectorAll('button')].every((button) => button.disabled)).toBe(true);
  });
});
