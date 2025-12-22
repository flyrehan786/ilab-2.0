import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  completedOrders: any[] = [];
  loading = false;
  dateFrom: string = '';
  dateTo: string = '';
  searchTerm = '';
  paymentFilter = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
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
    const params: any = {
      status: 'completed',
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm,
      payment_status: this.paymentFilter,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };

    this.apiService.getOrders(params).subscribe({
      next: (response) => {
        this.completedOrders = response.data;
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
    this.loadCompletedOrders();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCompletedOrders();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCompletedOrders();
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
