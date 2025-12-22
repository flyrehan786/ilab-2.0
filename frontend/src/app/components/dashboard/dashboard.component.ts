import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
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
  ordersByStatus: any[] = [];
  topTests: any[] = [];

  // Filter properties
  searchText: string = '';
  selectedStatus: string = '';
  selectedDate: string = '';

  // Top Tests Date Range Filter
  testDateRange: string = '30';
  showCustomDateRange: boolean = false;
  testStartDate: string = '';
  testEndDate: string = '';

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
            return value;
          }
        }
      }
    }
  };

  constructor(private apiService: ApiService, private authService: AuthService) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    const params: any = {
      dateRange: this.testDateRange,
      search: this.searchText,
      status: this.selectedStatus,
      date: this.selectedDate
    };

    if (this.authService.isSuperAdmin()) {
      const selectedLabId = localStorage.getItem('selectedLabId');
      if (selectedLabId) {
        params.lab_id = selectedLabId;
      }
    }

    if (this.testDateRange === 'custom' && this.testStartDate && this.testEndDate) {
      params.startDate = this.testStartDate;
      params.endDate = this.testEndDate;
    }

    this.apiService.getDashboardStats(params).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.recentOrders = data.recentOrders;
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
      this.barChartData = {
        labels: this.topTests.map(test => test.name),
        datasets: [
          {
            data: this.topTests.map(test => test.count),
            label: 'Number of Orders',
            backgroundColor: '#0d6efd',
            borderColor: '#0d6efd',
            borderWidth: 1
          }
        ]
      };
    } else {
      this.barChartData = {
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
    }

    // Update Orders Bar Chart
    if (this.stats) {
      this.ordersBarChartData = {
        labels: ['Today\'s Orders', 'Pending Orders'],
        datasets: [
          {
            data: [
              this.stats.todayOrders || 0,
              this.stats.pendingOrders || 0
            ],
            label: 'Orders',
            backgroundColor: ['#198754', '#ffc107'],
            borderColor: ['#198754', '#ffc107'],
            borderWidth: 1
          }
        ]
      };
    }

    // Update Payments Bar Chart
    if (this.stats) {
      this.paymentsBarChartData = {
        labels: ['Received Payments', 'Unpaid Payments'],
        datasets: [
          {
            data: [
              this.stats.totalReceivedPayments || 0,
              this.stats.totalUnpaidPayments || 0
            ],
            label: 'Payments',
            backgroundColor: ['#198754', '#dc3545'],
            borderColor: ['#198754', '#dc3545'],
            borderWidth: 1
          }
        ]
      };
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
    this.loadDashboardData();
  }

  clearFilters() {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedDate = '';
    this.loadDashboardData();
  }

  setTestDateRange(range: string) {
    this.testDateRange = range;
    this.showCustomDateRange = false;
    this.loadDashboardData();
  }

  toggleCustomDateRange() {
    this.testDateRange = 'custom';
    this.showCustomDateRange = !this.showCustomDateRange;
    if (!this.showCustomDateRange) {
      this.testStartDate = '';
      this.testEndDate = '';
    }
  }

  applyCustomDateRange() {
    if (this.testStartDate && this.testEndDate) {
      this.loadDashboardData();
    }
  }
}
