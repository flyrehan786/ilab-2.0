import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = true;
  stats: any = {};
  recentOrders: any[] = [];
  filteredOrders: any[] = [];
  ordersByStatus: any[] = [];
  topTests: any[] = [];

  // Filter properties
  searchText: string = '';
  selectedStatus: string = '';
  selectedDate: string = '';

  // Bar Chart Configuration
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Number of Orders',
        backgroundColor: '#0d6efd',
        borderColor: '#0d6efd',
        borderWidth: 1
      }
    ]
  };
  public barChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Orders Bar Chart Configuration
  public ordersBarChartType: ChartType = 'bar';
  public ordersBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Orders',
        backgroundColor: ['#198754', '#ffc107'],
        borderColor: ['#198754', '#ffc107'],
        borderWidth: 1
      }
    ]
  };
  public ordersBarChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Payments Bar Chart Configuration
  public paymentsBarChartType: ChartType = 'bar';
  public paymentsBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Payments',
        backgroundColor: ['#198754', '#dc3545'],
        borderColor: ['#198754', '#dc3545'],
        borderWidth: 1
      }
    ]
  };
  public paymentsBarChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value;
          }
        }
      }
    }
  };

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.apiService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.recentOrders = data.recentOrders;
        this.filteredOrders = data.recentOrders;
        this.ordersByStatus = data.ordersByStatus;
        this.topTests = data.topTests;
        this.updateChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.loading = false;
      }
    });
  }

  updateChartData() {
    // Update Top Tests Bar Chart
    if (this.topTests && this.topTests.length > 0) {
      this.barChartData.labels = this.topTests.map(test => test.name);
      this.barChartData.datasets[0].data = this.topTests.map(test => test.count);
    }

    // Update Orders Bar Chart
    if (this.stats) {
      this.ordersBarChartData.labels = ['Today\'s Orders', 'Pending Orders'];
      this.ordersBarChartData.datasets[0].data = [
        this.stats.todayOrders || 0,
        this.stats.pendingOrders || 0
      ];
    }

    // Update Payments Bar Chart
    if (this.stats) {
      this.paymentsBarChartData.labels = ['Received Payments', 'Unpaid Payments'];
      this.paymentsBarChartData.datasets[0].data = [
        this.stats.totalReceivedPayments || 0,
        this.stats.totalUnpaidPayments || 0
      ];
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

  getStatusLabel(status: string): string {
    return status.replace('_', ' ').toUpperCase();
  }

  applyFilters() {
    this.filteredOrders = this.recentOrders.filter(order => {
      // Search filter (order number or patient name)
      const searchMatch = !this.searchText || 
        order.order_number.toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.patient_name.toLowerCase().includes(this.searchText.toLowerCase());

      // Status filter
      const statusMatch = !this.selectedStatus || order.status === this.selectedStatus;

      // Date filter
      let dateMatch = true;
      if (this.selectedDate) {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        dateMatch = orderDate === this.selectedDate;
      }

      return searchMatch && statusMatch && dateMatch;
    });
  }

  clearFilters() {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedDate = '';
    this.filteredOrders = this.recentOrders;
  }
}
