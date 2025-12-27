import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  statusFilter = '';
  paymentFilter = '';
  searchTerm = '';
  dateFrom = '';
  dateTo = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(private apiService: ApiService, private authService: AuthService) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm,
      status: this.statusFilter,
      payment_status: this.paymentFilter,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };


    this.apiService.getOrders(params).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadOrders();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  getStatusBadgeClass(status: string): string {
    const classes: any = {
      'pending': 'bg-warning text-dark',
      'sample_collected': 'bg-info text-dark',
      'in_progress': 'bg-primary',
      'completed': 'bg-success',
      'cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getPaymentBadgeClass(status: string): string {
    const classes: any = {
      'unpaid': 'bg-danger',
      'partial': 'bg-warning text-dark',
      'paid': 'bg-success'
    };
    return classes[status] || 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    return status.replace('_', ' ').toUpperCase();
  }
}
