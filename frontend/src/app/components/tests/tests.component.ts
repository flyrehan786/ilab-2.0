import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

declare var bootstrap: any;

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit {
  tests: any[] = [];
  filteredTests: any[] = [];
  paginatedTests: any[] = [];
  categories: any[] = [];
  loading = false;
  searchTerm = '';
  categoryFilter = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  testForm!: FormGroup;
  editMode = false;
  selectedTestId: number | null = null;
  modal: any;

  constructor(private apiService: ApiService, private formBuilder: FormBuilder) { }

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
    this.apiService.getTests().subscribe({
      next: (data) => {
        this.tests = data;
        this.filteredTests = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.tests];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(term) ||
        test.test_code.toLowerCase().includes(term) ||
        (test.sample_type && test.sample_type.toLowerCase().includes(term))
      );
    }

    if (this.categoryFilter) {
      filtered = filtered.filter(test => test.category_id == this.categoryFilter);
    }

    this.filteredTests = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredTests.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTests = this.filteredTests.slice(startIndex, endIndex);
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

  loadCategories() {
    this.apiService.getTestCategories().subscribe({
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
