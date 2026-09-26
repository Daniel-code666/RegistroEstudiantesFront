import { signal } from '@angular/core';
import { Page, emptyPage } from '../core/models';
import { errorMessage } from '../core/api';
export class ListState<T> {
  readonly data = signal<Page<T>>(emptyPage<T>()); readonly loading = signal(false); readonly error = signal('');
  readonly pageSize = signal(10);
  private version = 0;
  async load(request: (page: number) => Promise<Page<T>>, page = 1): Promise<void> {
    const version = ++this.version; this.loading.set(true); this.error.set('');
    try {
      let result = await request(page);
      if (page > 1 && !result.items.length) result = await request(Math.max(1, Math.ceil(result.totalRecords / result.pageSize)));
      if (version === this.version) this.data.set(result);
    } catch (error) { if (version === this.version) { this.error.set(errorMessage(error)); this.data.set(emptyPage<T>()); } }
    finally { if (version === this.version) this.loading.set(false); }
  }
}
