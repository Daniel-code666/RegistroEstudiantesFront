import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Api, errorMessage } from '../../core/api';
import { Role, roleLabel } from '../../core/models';
import { Ui } from '../../shared/ui';
import { FieldError } from '../../shared/field-error/field-error';
import { requiredText } from '../../shared/form-fields';
import { Pager } from '../../shared/pager/pager';
import { LoadState } from '../../shared/load-state/load-state';
@Component({
  selector: 'app-roles', imports: [ReactiveFormsModule, FieldError, Pager, LoadState],
  templateUrl: './roles.html'
})
export class Roles {
  private readonly api = inject(Api); readonly ui = inject(Ui); readonly roleLabel = roleLabel;
  readonly roles = signal<Role[]>([]); readonly loading = signal(false); readonly error = signal(''); readonly page = signal(1); readonly pageSize = signal(10);
  readonly visible = computed(() => this.roles().slice((this.page() - 1) * this.pageSize(), this.page() * this.pageSize()));
  readonly editing = signal(false); readonly selected = signal<Role | null>(null);
  readonly form = inject(FormBuilder).nonNullable.group({ name: ['', requiredText(50)], description: ['', requiredText(500)] });
  constructor() { void this.load(); }
  async load(): Promise<void> { this.loading.set(true); this.error.set(''); try { this.roles.set(await this.api.get<Role[]>('Role')); this.page.set(Math.max(1, Math.min(this.page(), Math.ceil(this.roles().length / this.pageSize())))); } catch (error) { this.error.set(errorMessage(error)); } finally { this.loading.set(false); } }
  systemRole(name: string): boolean { return ['Admin', 'Student', 'Professor'].includes(name); }
  edit(role: Role | null): void { this.selected.set(role); this.form.reset({ name: '', description: '' }); if (role) this.form.patchValue(role); this.editing.set(true); }
  save(): void {
    this.form.markAllAsTouched(); if (this.form.invalid) return; const role = this.selected(); const value = this.form.getRawValue();
    this.ui.confirm(role ? 'Actualizar rol' : 'Crear rol', `Se guardará el rol «${value.name}».`, async () => { if (role) await this.api.put(`Role/${role.id}`, value); else await this.api.post('Role', value); this.editing.set(false); this.ui.success(); await this.load(); });
  }
  toggle(role: Role): void { this.ui.confirm(role.active ? 'Desactivar rol' : 'Activar rol', `Se cambiará el estado de «${role.name}». Los roles asignados a usuarios no pueden desactivarse.`, async () => { if (role.active) await this.api.delete(`Role/${role.id}`); else await this.api.patch(`Role/${role.id}/activate`); this.ui.success(); await this.load(); }, role.active); }
}
