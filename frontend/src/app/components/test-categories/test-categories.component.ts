import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

declare var bootstrap: any;

@Component({
  selector: 'app-test-categories',
  templateUrl: './test-categories.component.html',
  styleUrls: ['./test-categories.component.css']
})
export class TestCategoriesComponent implements OnInit {
  categories: any[] = [];
  loading = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  categoryForm!: FormGroup;
  editMode = false;
  selectedCategoryId: number | null = null;
  modal: any;

  constructor(private apiService: ApiService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.initForm();
    this.loadCategories();
  }

  initForm() {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  loadCategories() {
    this.loading = true;
    const params = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm
    };
    this.apiService.getTestCategories(params).subscribe({
      next: (response) => {
        console.log('Categories data received:', response);
        this.categories = response.data;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadCategories();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCategories();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCategories();
    }
  }

  openModal(category?: any) {
    this.editMode = !!category;
    this.selectedCategoryId = category?.id || null;
    if (category) {
      this.categoryForm.patchValue(category);
    } else {
      this.categoryForm.reset();
    }
    this.modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    this.modal.show();
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }
    const data = this.categoryForm.value;
    if (this.editMode && this.selectedCategoryId) {
      this.apiService.updateTestCategory(this.selectedCategoryId, data).subscribe(() => {
        this.modal.hide();
        this.loadCategories();
      });
    } else {
      this.apiService.createTestCategory(data).subscribe(() => {
        this.modal.hide();
        this.loadCategories();
      });
    }
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure?')) {
      this.apiService.deleteTestCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }
}
