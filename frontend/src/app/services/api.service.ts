import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  // Dashboard
  getDashboardStats(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${environment.apiUrl}/dashboard/stats`, { params: httpParams });
  }

  // Patients
  getPatients(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${environment.apiUrl}/patients`, { params: httpParams });
  }

  getPatient(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/patients/${id}`);
  }

  createPatient(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/patients`, data);
  }

  updatePatient(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/patients/${id}`, data);
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/patients/${id}`);
  }

  // Doctors
  getDoctors(search?: string): Observable<any> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get(`${environment.apiUrl}/doctors`, { params });
  }

  getDoctor(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/doctors/${id}`);
  }

  createDoctor(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/doctors`, data);
  }

  updateDoctor(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/doctors/${id}`, data);
  }

  deleteDoctor(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/doctors/${id}`);
  }

  // Tests
  getTests(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${environment.apiUrl}/tests`, { params: httpParams });
  }

  getTest(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tests/${id}`);
  }

  getTestCategories(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/test-categories`);
  }

  createTest(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/tests`, data);
  }

  updateTest(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/tests/${id}`, data);
  }

  deleteTest(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/tests/${id}`);
  }

  // Orders
  getOrders(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${environment.apiUrl}/orders`, { params: httpParams });
  }

  getOrder(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/orders/${id}`);
  }

  createOrder(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/orders`, data);
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/orders/${id}/status`, { status });
  }

  addPayment(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/payments`, data);
  }

  // Results
  addResult(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/results`, data);
  }

  updateResult(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/results/${id}`, data);
  }

  verifyResult(id: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/results/${id}/verify`, {});
  }

  getResultsByOrder(orderId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/results/order/${orderId}`);
  }

  // User Management
  getUsers(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${environment.apiUrl}/users`, { params: httpParams });
  }

  getUser(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/${id}`);
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users`, data);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/users/${id}`);
  }

  toggleUserStatus(id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/users/${id}/toggle-status`, {});
  }

  changePassword(id: number, data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users/${id}/change-password`, data);
  }
}
