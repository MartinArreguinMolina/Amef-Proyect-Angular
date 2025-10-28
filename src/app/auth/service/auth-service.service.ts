import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environments } from '@env/environmets';
import { Login, UserReponse } from '@interfaces/interfaces';
import { catchError, delay, map, of } from 'rxjs';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);
  private baseUrl = environments.baseUlr;

  private _user = signal<UserReponse | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));
  private _authStatus = signal<AuthStatus>('checking');

  token = computed(() => this._token());
  user = computed(() => this._user());
  authStatus = computed(() => {

    if(this._authStatus() === 'checking') return 'checking';

    if(this._user()) return 'authenticated'

    return 'not-authenticated'
  })

  rol = computed(() => (this._user()?.roles.includes('admin') || this._user()?.roles.includes('super-admin')) ?? false)

  isSuperAdmin = computed(() => this._user()?.roles.includes('super-admin') ?? false)


  checkStatusResource = rxResource({
    stream: () => this.checkAuthStatus(),
  })

  login(login: Login) {
    return this.http.post<UserReponse>(`${this.baseUrl}/auth/login`, login)
      .pipe(
        map((response) => this.handleAuthSuccess(response)),
        catchError((error) => this.handleAuthError(error))
      )
  }

  checkAuthStatus() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.logout()
      return of(false)
    }
    return this.http.get<UserReponse>(`${this.baseUrl}/auth/check-auth`, {})
      .pipe(
        map(r => this.handleAuthSuccess(r)),
        catchError((error) => this.handleAuthError(error))
      )
  }

  private handleAuthError(error: any) {
    this.logout()
    return of(false)
  }

  logout() {
    this._token.set(null)
    this._authStatus.set('not-authenticated');
    this._user.set(null);
    localStorage.removeItem('token')
  }

  handleAuthSuccess(userResponse: UserReponse) {
    const { token } = userResponse;
    this._user.set(userResponse);
    this._token.set(token);
    this._authStatus.set('authenticated')

    localStorage.setItem('token', token)

    return true;
  }


  getUserTerm(term: string){
    return this.http.get<UserReponse[]>(`${this.baseUrl}/auth/users/${term}`).pipe(
      delay(300)
    )
  }
}
