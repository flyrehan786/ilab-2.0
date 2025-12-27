import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];
  loading = false;
  searchTerm = '';
  dateFrom = '';
  dateTo = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  patientForm!: FormGroup;
  editMode = false;
  selectedPatientId: number | null = null;
  modal: any;

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadPatients();
  }

  initForm() {
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
    
    // Ensure form is enabled
    this.patientForm.enable();
  }

  loadPatients() {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };


    this.apiService.getPatients(params).subscribe({
      next: (response) => {
        this.patients = response.data;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadPatients();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPatients();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPatients();
    }
  }

  openModal(patient?: any) {
    this.editMode = !!patient;
    this.selectedPatientId = patient?.id || null;

    if (patient) {
      const patientData = { ...patient };
      if (patientData.date_of_birth) {
        // Format the date to YYYY-MM-DD for the date input field
        patientData.date_of_birth = new Date(patientData.date_of_birth).toISOString().split('T')[0];
      }
      this.patientForm.patchValue(patientData);
    } else {
      this.patientForm.reset();
    }

    this.modal = new bootstrap.Modal(document.getElementById('patientModal'));
    this.modal.show();
  }

  onSubmit() {
    if (this.patientForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    const data = this.patientForm.value;
    this.loading = true;


    if (this.editMode && this.selectedPatientId) {
      this.apiService.updatePatient(this.selectedPatientId, data).subscribe({
        next: (response) => {
          this.loading = false;
          this.modal.hide();
          alert('Patient updated successfully!');
          this.loadPatients();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating patient:', error);
          alert('Error updating patient: ' + (error.error?.error || 'Unknown error'));
        }
      });
    } else {
      this.apiService.createPatient(data).subscribe({
        next: (response) => {
          this.loading = false;
          this.modal.hide();
          alert('Patient created successfully! Patient Code: ' + response.patient_code);
          this.loadPatients();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating patient:', error);
          alert('Error creating patient: ' + (error.error?.error || 'Unknown error'));
        }
      });
    }
  }

  deletePatient(id: number) {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.apiService.deletePatient(id).subscribe({
        next: () => this.loadPatients(),
        error: (error) => console.error('Error deleting patient:', error)
      });
    }
  }
}
