import { Injectable, inject } from '@angular/core';
import { Api } from '../api';
import { LoginResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);

  login(email: string, password: string): Promise<LoginResponse> {
    return this.api.post<LoginResponse>('auth/login', { email, password });
  }
}
