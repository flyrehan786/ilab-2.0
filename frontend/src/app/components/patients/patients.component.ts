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
  loading = false;
  searchTerm = '';
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
  }

  loadPatients() {
    this.loading = true;
    this.apiService.getPatients({ search: this.searchTerm }).subscribe({
      next: (response) => {
        this.patients = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.loadPatients();
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
