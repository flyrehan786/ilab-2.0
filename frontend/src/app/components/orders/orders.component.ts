import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  paginatedOrders: any[] = [];
  loading = false;
  statusFilter = '';
  paymentFilter = '';
  searchTerm = '';
  dateFrom = '';
  dateTo = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    const params: any = {};
    
    if (this.dateFrom) {
      params.dateFrom = this.dateFrom;
    }
    if (this.dateTo) {
      params.dateTo = this.dateTo;
    }

    this.apiService.getOrders(params).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.filteredOrders = response.data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    // If date filters changed, reload from backend
    if (event && (event.target as HTMLInputElement).type === 'date') {
      this.loadOrders();
    } else {
      this.applyFilters();
    }
  }

  applyFilters() {
    let filtered = [...this.orders];

    // Filter by status
    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Filter by payment status
    if (this.paymentFilter) {
      filtered = filtered.filter(order => order.payment_status === this.paymentFilter);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(term) ||
        order.patient_name.toLowerCase().includes(term) ||
        order.patient_code.toLowerCase().includes(term) ||
        (order.doctor_name && order.doctor_name.toLowerCase().includes(term))
      );
    }

    // Filter by date range
    if (this.dateFrom) {
      filtered = filtered.filter(order => new Date(order.created_at) >= new Date(this.dateFrom));
    }
    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => new Date(order.created_at) <= toDate);
    }

    this.filteredOrders = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);
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
