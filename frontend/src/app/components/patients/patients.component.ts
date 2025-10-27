import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

declare var bootstrap: any;

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];
  paginatedPatients: any[] = [];
  loading = false;
  searchTerm = '';
  genderFilter = '';
  bloodGroupFilter = '';
  dateFrom = '';
  dateTo = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  patientForm!: FormGroup;
  editMode = false;
  selectedPatientId: number | null = null;
  modal: any;

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder
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
    const params: any = {};
    
    if (this.dateFrom) {
      params.dateFrom = this.dateFrom;
    }
    if (this.dateTo) {
      params.dateTo = this.dateTo;
    }

    this.apiService.getPatients(params).subscribe({
      next: (response) => {
        this.patients = response.data;
        this.filteredPatients = response.data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.loading = false;
      }
    });
  }

  onSearch() {
    // If date filters are used, reload from backend
    if (this.dateFrom || this.dateTo) {
      this.loadPatients();
    } else {
      this.applyFilters();
    }
  }

  applyFilters() {
    let filtered = [...this.patients];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(term) ||
        patient.patient_code.toLowerCase().includes(term) ||
        patient.phone.includes(term) ||
        (patient.email && patient.email.toLowerCase().includes(term))
      );
    }

    // Filter by gender
    if (this.genderFilter) {
      filtered = filtered.filter(patient => patient.gender === this.genderFilter);
    }

    // Filter by blood group
    if (this.bloodGroupFilter) {
      filtered = filtered.filter(patient => patient.blood_group === this.bloodGroupFilter);
    }

    // Filter by date range
    if (this.dateFrom) {
      filtered = filtered.filter(patient => new Date(patient.created_at) >= new Date(this.dateFrom));
    }
    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(patient => new Date(patient.created_at) <= toDate);
    }

    this.filteredPatients = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredPatients.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPatients = this.filteredPatients.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  openModal(patient?: any) {
    this.editMode = !!patient;
    this.selectedPatientId = patient?.id || null;

    if (patient) {
      this.patientForm.patchValue(patient);
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
