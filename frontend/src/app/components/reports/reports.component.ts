import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  completedOrders: any[] = [];
  filteredOrders: any[] = [];
  paginatedOrders: any[] = [];
  loading = false;
  dateFrom: string = '';
  dateTo: string = '';
  searchTerm = '';
  paymentFilter = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
    
    this.loadCompletedOrders();
  }

  loadCompletedOrders() {
    this.loading = true;
    const params: any = { status: 'completed' };
    
    if (this.dateFrom) {
      params.dateFrom = this.dateFrom;
    }
    if (this.dateTo) {
      params.dateTo = this.dateTo;
    }

    this.apiService.getOrders(params).subscribe({
      next: (response) => {
        this.completedOrders = response.data;
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

  filterByDate() {
    this.loadCompletedOrders();
  }

  applyFilters() {
    let filtered = [...this.completedOrders];

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

    // Filter by payment status
    if (this.paymentFilter) {
      filtered = filtered.filter(order => order.payment_status === this.paymentFilter);
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

  printReport(order: any) {
    // Navigate to order detail and trigger print
    window.open(`/orders/${order.id}`, '_blank');
  }

  exportToCSV() {
    if (this.completedOrders.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Order Number', 'Patient Name', 'Patient Code', 'Doctor', 'Date', 'Total Amount', 'Payment Status'];
    const csvData = this.completedOrders.map(order => [
      order.order_number,
      order.patient_name,
      order.patient_code,
      order.doctor_name || 'N/A',
      new Date(order.created_at).toLocaleDateString(),
      order.total_amount - order.discount,
      order.payment_status
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
