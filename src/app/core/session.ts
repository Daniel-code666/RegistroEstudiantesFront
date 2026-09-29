import { Injectable, inject, signal } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router, CanActivateFn } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { User } from './models';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly auth = inject(AuthService);
  private readonly users = inject(UsersService);
  private readonly router = inject(Router);
  readonly user = signal<User | null>(null);
  private expiryTimer?: ReturnType<typeof setTimeout>;
  get token(): string | null {
    const expires = Number(sessionStorage.getItem('session.expires'));
    return expires > Date.now() ? sessionStorage.getItem('session.token') : null;
  }
  async login(email: string, password: string): Promise<void> {
    const result = await this.auth.login(email, password);
    sessionStorage.setItem('session.token', result.accessToken);
    sessionStorage.setItem('session.expires', String(Date.parse(result.expiresAtUtc)));
    this.user.set(result.user);
    this.scheduleExpiry();
  }
  async loadUser(): Promise<void> {
    this.user.set(await this.users.getCurrent());
    this.scheduleExpiry();
  }
  logout(expired = false): void {
    clearTimeout(this.expiryTimer);
    sessionStorage.removeItem('session.token');
    sessionStorage.removeItem('session.expires');
    this.user.set(null);
    void this.router.navigate(['/login'], { queryParams: expired ? { expired: '1' } : {} });
  }
  home(): string {
    return this.user()?.role === 'Admin'
      ? '/usuarios'
      : this.user()?.role === 'Professor'
        ? '/profesor'
        : this.user()?.role === 'Student'
          ? '/inscripcion'
          : '/perfil';
  }
  private scheduleExpiry(): void {
    clearTimeout(this.expiryTimer);
    this.expiryTimer = setTimeout(
      () => this.logout(true),
      Math.max(0, Number(sessionStorage.getItem('session.expires')) - Date.now()),
    );
  }
}

export const sessionInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(Session);
  const isApi = request.url.startsWith('/api/');
  const token = session.token;
  const authenticated =
    isApi &&
    token &&
    !request.url.endsWith('/auth/login') &&
    !request.url.endsWith('/users/register');
  return next(
    authenticated ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request,
  ).pipe(
    catchError((error) => {
      if (authenticated && error.status === 401) session.logout(true);
      return throwError(() => error);
    }),
  );
};

export const accessGuard: CanActivateFn = async (route) => {
  const session = inject(Session);
  const router = inject(Router);
  if (!session.token) return router.createUrlTree(['/login']);
  try {
    await session.loadUser();
  } catch {
    return router.createUrlTree(['/login']);
  }
  const roles = route.data['roles'] as string[] | undefined;
  return !roles || roles.includes(session.user()!.role)
    ? true
    : router.createUrlTree([session.home()]);
};
