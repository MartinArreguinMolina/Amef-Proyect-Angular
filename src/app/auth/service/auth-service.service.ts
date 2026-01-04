import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environments } from '@env/environmets';
import { Login, Register, Roles, UserReponse } from '@interfaces/interfaces';
import { catchError, delay, map, Observable, of } from 'rxjs';
import { Departament } from 'src/app/dashboard/interfaces/interfaces';

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


  singUpError = signal<string | null>(null);
  token = computed(() => this._token());
  user = computed(() => this._user());
  authStatus = computed(() => {

    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) return 'authenticated'

    return 'not-authenticated'
  })

  rol = computed(() => (this._user()?.roles.includes('usuario') || this._user()?.roles.includes('administrador')) ?? false)

  isSuperAdmin = computed(() => this._user()?.roles.includes('administrador') ?? false)


  checkStatusResource = rxResource({
    stream: () => this.checkAuthStatus(),
  })

  singUp(registerUser: Register) {
    return this.http.post<UserReponse>(`${this.baseUrl}/auth/register`, registerUser).pipe(
      catchError((error) => this.handleSingUpError(error))
    )
  }

  handleSingUpError(error: any){
    this.singUpError.set(error.error.message);
    return of(false)
  }


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

  getUserTerm(term: string) {
    return this.http.get<UserReponse[]>(`${this.baseUrl}/auth/users/${term}`).pipe(
      delay(300)
    )
  }


  // Obtener roles
  getRoles(): Observable<Roles[]> {
    return this.http.get<Roles[]>(`${this.baseUrl}/auth/roles`);
  }

  // Obtener departaments
  getDepartaments() {
    return this.http.get<Departament[]>(`${this.baseUrl}/departments`);
  }


}
