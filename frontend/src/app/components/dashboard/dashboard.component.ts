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
  ordersByStatus: any[] = [];
  topTests: any[] = [];

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
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
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
    if (this.topTests && this.topTests.length > 0) {
      this.barChartData.labels = this.topTests.map(test => test.test_name);
      this.barChartData.datasets[0].data = this.topTests.map(test => test.order_count);
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
}
