import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class DoctorsComponent implements OnInit {
  doctors: any[] = [];
  loading = false;
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  doctorForm!: FormGroup;
  editMode = false;
  selectedDoctorId: number | null = null;
  modal: any;

  constructor(private apiService: ApiService, private formBuilder: FormBuilder, private authService: AuthService) { }

  ngOnInit() {
    this.initForm();
    this.loadDoctors();
  }

  initForm() {
    this.doctorForm = this.formBuilder.group({
      name: ['', Validators.required],
      specialization: [''],
      phone: ['', Validators.required],
      email: ['', [Validators.email]],
      address: [''],
      license_number: ['']
    });
    
    // Ensure form is enabled
    this.doctorForm.enable();
  }

  loadDoctors() {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm
    };


    this.apiService.getDoctors(params).subscribe({
      next: (response) => {
        this.doctors = response.data;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadDoctors();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadDoctors();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDoctors();
    }
  }

  openModal(doctor?: any) {
    this.editMode = !!doctor;
    this.selectedDoctorId = doctor?.id || null;
    if (doctor) {
      this.doctorForm.patchValue(doctor);
    } else {
      this.doctorForm.reset();
    }
    this.modal = new bootstrap.Modal(document.getElementById('doctorModal'));
    this.modal.show();
  }

  onSubmit() {
    if (this.doctorForm.invalid) {
      alert('Please fill all required fields');
      return;
    }
    
    const data = this.doctorForm.value;
    this.loading = true;

    
    if (this.editMode && this.selectedDoctorId) {
      this.apiService.updateDoctor(this.selectedDoctorId, data).subscribe({
        next: () => { 
          this.loading = false;
          this.modal.hide(); 
          alert('Doctor updated successfully!');
          this.loadDoctors(); 
        },
        error: (error) => {
          this.loading = false;
          console.error('Error:', error);
          alert('Error updating doctor: ' + (error.error?.error || 'Unknown error'));
        }
      });
    } else {
      this.apiService.createDoctor(data).subscribe({
        next: () => { 
          this.loading = false;
          this.modal.hide(); 
          alert('Doctor created successfully!');
          this.loadDoctors(); 
        },
        error: (error) => {
          this.loading = false;
          console.error('Error:', error);
          alert('Error creating doctor: ' + (error.error?.error || 'Unknown error'));
        }
      });
    }
  }

  deleteDoctor(id: number) {
    if (confirm('Are you sure?')) {
      this.apiService.deleteDoctor(id).subscribe({
        next: () => this.loadDoctors(),
        error: (error) => console.error('Error:', error)
      });
    }
  }
}
