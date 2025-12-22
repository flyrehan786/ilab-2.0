import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit {
  tests: any[] = [];
  categories: any[] = [];
  loading = false;
  searchTerm = '';
  categoryFilter = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  testForm!: FormGroup;
  editMode = false;
  selectedTestId: number | null = null;
  modal: any;

  constructor(private apiService: ApiService, private formBuilder: FormBuilder, private authService: AuthService) { }

  ngOnInit() {
    this.initForm();
    this.loadTests();
    this.loadCategories();
  }

  initForm() {
    this.testForm = this.formBuilder.group({
      name: ['', Validators.required],
      category_id: [''],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      normal_range: [''],
      unit: [''],
      sample_type: [''],
      preparation_instructions: [''],
      turnaround_time: ['']
    });
    
    // Ensure form is enabled
    this.testForm.enable();
  }

  loadTests() {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm,
      category_id: this.categoryFilter
    };

    if (this.authService.isSuperAdmin()) {
      const selectedLabId = localStorage.getItem('selectedLabId');
      if (selectedLabId) {
        params.lab_id = selectedLabId;
      }
    }

    this.apiService.getTests(params).subscribe({
      next: (response) => {
        this.tests = response.data;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tests:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadTests();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTests();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTests();
    }
  }

  loadCategories() {
    const params: any = {};
    if (this.authService.isSuperAdmin()) {
      const selectedLabId = localStorage.getItem('selectedLabId');
      if (selectedLabId) {
        params.lab_id = selectedLabId;
      }
    }
    this.apiService.getTestCategoriesForDropdown(params).subscribe({
      next: (data) => this.categories = data,
      error: (error) => console.error('Error:', error)
    });
  }

  openModal(test?: any) {
    this.editMode = !!test;
    this.selectedTestId = test?.id || null;
    if (test) {
      this.testForm.patchValue(test);
    } else {
      this.testForm.reset();
    }
    this.modal = new bootstrap.Modal(document.getElementById('testModal'));
    this.modal.show();
  }

  onSubmit() {
    if (this.testForm.invalid) {
      alert('Please fill all required fields');
      return;
    }
    
    const data = this.testForm.value;
    this.loading = true;

    if (this.authService.isSuperAdmin() && !this.editMode) {
      const selectedLabId = localStorage.getItem('selectedLabId');
      if (!selectedLabId) {
        alert('Please select a lab from the filter before creating a test.');
        this.loading = false;
        return;
      }
      data.lab_id = selectedLabId;
    }
    
    if (this.editMode && this.selectedTestId) {
      this.apiService.updateTest(this.selectedTestId, data).subscribe({
        next: () => { 
          this.loading = false;
          this.modal.hide(); 
          alert('Test updated successfully!');
          this.loadTests(); 
        },
        error: (error) => {
          this.loading = false;
          console.error('Error:', error);
          alert('Error updating test: ' + (error.error?.error || 'Unknown error'));
        }
      });
    } else {
      this.apiService.createTest(data).subscribe({
        next: (response) => { 
          this.loading = false;
          this.modal.hide(); 
          alert('Test created successfully! Test Code: ' + response.test_code);
          this.loadTests(); 
        },
        error: (error) => {
          this.loading = false;
          console.error('Error:', error);
          alert('Error creating test: ' + (error.error?.error || 'Unknown error'));
        }
      });
    }
  }

  deleteTest(id: number) {
    if (confirm('Are you sure?')) {
      this.apiService.deleteTest(id).subscribe({
        next: () => this.loadTests(),
        error: (error) => console.error('Error:', error)
      });
    }
  }
}
