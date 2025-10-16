import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
  orderForm!: FormGroup;
  patients: any[] = [];
  doctors: any[] = [];
  tests: any[] = [];
  selectedTests: any[] = [];
  loading = false;
  searchPatient = '';
  searchTest = '';

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadPatients();
    this.loadDoctors();
    this.loadTests();
  }

  initForm() {
    this.orderForm = this.formBuilder.group({
      patient_id: ['', Validators.required],
      doctor_id: [''],
      priority: ['normal'],
      notes: [''],
      discount: [0]
    });
  }

  loadPatients() {
    this.apiService.getPatients({ search: this.searchPatient }).subscribe({
      next: (response) => this.patients = response.data,
      error: (error) => console.error('Error:', error)
    });
  }

  loadDoctors() {
    this.apiService.getDoctors().subscribe({
      next: (data) => this.doctors = data,
      error: (error) => console.error('Error:', error)
    });
  }

  loadTests() {
    this.apiService.getTests({ search: this.searchTest }).subscribe({
      next: (data) => this.tests = data,
      error: (error) => console.error('Error:', error)
    });
  }

  addTest(test: any) {
    if (!this.selectedTests.find(t => t.id === test.id)) {
      this.selectedTests.push({ ...test });
    }
  }

  removeTest(index: number) {
    this.selectedTests.splice(index, 1);
  }

  getTotalAmount(): number {
    return this.selectedTests.reduce((sum, test) => sum + parseFloat(test.price), 0);
  }

  getFinalAmount(): number {
    return this.getTotalAmount() - (this.orderForm.value.discount || 0);
  }

  onSubmit() {
    if (this.orderForm.invalid || this.selectedTests.length === 0) {
      alert('Please select patient and at least one test');
      return;
    }

    this.loading = true;
    const orderData = {
      ...this.orderForm.value,
      tests: this.selectedTests
    };

    this.apiService.createOrder(orderData).subscribe({
      next: (response) => {
        alert('Order created successfully!');
        this.router.navigate(['/orders', response.id]);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        alert('Error creating order');
        this.loading = false;
      }
    });
  }
}
