import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
declare var bootstrap: any;

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
  patientForm!: FormGroup;
  doctorForm!: FormGroup;
  patientModal: any;
  doctorModal: any;
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
    this.initPatientForm();
    this.initDoctorForm();
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
    
    // Ensure form is enabled
    this.orderForm.enable();
  }

  loadPatients() {
    this.apiService.getPatientsForDropdown().subscribe({
      next: (data) => this.patients = data,
      error: (error) => console.error('Error:', error)
    });
  }

  loadDoctors() {
    this.apiService.getDoctorsForDropdown().subscribe({
      next: (data) => {
        console.log('Doctors data received:', data);
        this.doctors = data;
      },
      error: (error) => console.error('Error:', error)
    });
  }

  loadTests() {
    this.apiService.getTests({ search: this.searchTest }).subscribe({
      next: (response) => this.tests = response.data,
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

  initPatientForm() {
    this.patientForm = this.formBuilder.group({
      name: ['', Validators.required],
      date_of_birth: [''],
      age: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''],
      address: [''],
      blood_group: [''],
      emergency_contact: [''],
      medical_history: ['']
    });
  }

  initDoctorForm() {
    this.doctorForm = this.formBuilder.group({
      name: ['', Validators.required],
      specialization: [''],
      phone: ['', Validators.required],
      email: ['', [Validators.email]],
      address: [''],
      license_number: ['']
    });
  }

  openPatientModal() {
    this.patientForm.reset();
    this.patientModal = new bootstrap.Modal(document.getElementById('patientModal'));
    this.patientModal.show();
  }

  openDoctorModal() {
    this.doctorForm.reset();
    this.doctorModal = new bootstrap.Modal(document.getElementById('doctorModal'));
    this.doctorModal.show();
  }

  onPatientSubmit() {
    if (this.patientForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    this.loading = true;
    this.apiService.createPatient(this.patientForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.patientModal.hide();
        alert('Patient created successfully! Patient Code: ' + response.patient_code);
        this.loadPatients();
        this.orderForm.patchValue({ patient_id: response.id });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating patient:', error);
        alert('Error creating patient: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }

  onDoctorSubmit() {
    if (this.doctorForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    this.loading = true;
    this.apiService.createDoctor(this.doctorForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.doctorModal.hide();
        alert('Doctor created successfully!');
        this.loadDoctors();
        this.orderForm.patchValue({ doctor_id: response.data.id });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating doctor:', error);
        alert('Error creating doctor: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }
}
