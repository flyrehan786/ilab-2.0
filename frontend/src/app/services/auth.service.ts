import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

    login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(tap(response => {
        if (response && response.token) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);

          // Decode token to get lab_id
          try {
            const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));
            if (tokenPayload.lab_id) {
              localStorage.setItem('lab_id', tokenPayload.lab_id);
            }
          } catch (e) {
            console.error('Error decoding token', e);
          }

          this.currentUserSubject.next(response);
        }
      }));
  }

  registerLab(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register-lab`, data);
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('lab_id');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getLabId(): string | null {
    return localStorage.getItem('lab_id');
  }
}
