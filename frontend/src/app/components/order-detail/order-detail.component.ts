import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

declare var bootstrap: any;

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: any = null;
  loading = false;
  paymentForm!: FormGroup;
  resultForm!: FormGroup;
  paymentModal: any;
  resultModal: any;
  selectedOrderItem: any = null;
  testResults: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.initForms();
    const id = this.route.snapshot.params['id'];
    this.loadOrder(id);
  }

  initForms() {
    this.paymentForm = this.formBuilder.group({
      order_id: [''],
      amount: ['', [Validators.required, Validators.min(1)]],
      payment_method: ['cash', Validators.required],
      transaction_id: [''],
      notes: ['']
    });

    this.resultForm = this.formBuilder.group({
      order_item_id: [''],
      result_value: [''],
      result_text: [''],
      normal_range: [''],
      unit: [''],
      status: ['normal'],
      remarks: ['']
    });
  }

  loadOrder(id: number) {
    this.loading = true;
    this.apiService.getOrder(id).subscribe({
      next: (data) => {
        this.order = data;
        this.loadResults(id);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.loading = false;
      }
    });
  }

  loadResults(orderId: number) {
    this.apiService.getResultsByOrder(orderId).subscribe({
      next: (data) => {
        this.testResults = data;
      },
      error: (error) => {
        console.error('Error loading results:', error);
      }
    });
  }

  updateStatus(status: string) {
    if (confirm(`Change status to ${status}?`)) {
      this.apiService.updateOrderStatus(this.order.id, status).subscribe({
        next: () => this.loadOrder(this.order.id),
        error: (error) => console.error('Error:', error)
      });
    }
  }

  openPaymentModal() {
    this.paymentForm.patchValue({
      order_id: this.order.id,
      amount: this.order.total_amount - this.order.discount - this.order.paid_amount
    });
    this.paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    this.paymentModal.show();
  }

  submitPayment() {
    if (this.paymentForm.invalid) return;
    this.apiService.addPayment(this.paymentForm.value).subscribe({
      next: () => {
        this.paymentModal.hide();
        this.loadOrder(this.order.id);
      },
      error: (error) => console.error('Error:', error)
    });
  }

  openResultModal(item: any) {
    this.selectedOrderItem = item;
    this.resultForm.patchValue({
      order_item_id: item.id,
      result_value: item.result_value || '',
      result_text: item.result_text || '',
      normal_range: item.normal_range || '',
      unit: item.unit || '',
      status: item.result_status || 'normal',
      remarks: item.remarks || ''
    });
    this.resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
    this.resultModal.show();
  }

  submitResult() {
    if (this.resultForm.invalid) return;
    const data = this.resultForm.value;
    
    if (this.selectedOrderItem.result_value) {
      // Update existing result
      this.apiService.updateResult(this.selectedOrderItem.id, data).subscribe({
        next: () => {
          this.resultModal.hide();
          this.loadOrder(this.order.id);
        },
        error: (error) => console.error('Error:', error)
      });
    } else {
      // Add new result
      this.apiService.addResult(data).subscribe({
        next: () => {
          this.resultModal.hide();
          this.loadOrder(this.order.id);
        },
        error: (error) => console.error('Error:', error)
      });
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

  getResultBadgeClass(status: string): string {
    const classes: any = {
      'normal': 'bg-success',
      'abnormal': 'bg-warning text-dark',
      'critical': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  printReport() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the report');
      return;
    }

    const reportHtml = this.generateReportHTML();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  generateReportHTML(): string {
    const currentDate = new Date().toLocaleString();
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lab Report - ${this.order.order_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0d6efd;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0d6efd;
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      gap: 20px;
    }
    .info-box {
      flex: 1;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #0d6efd;
    }
    .info-box h3 {
      color: #0d6efd;
      font-size: 14px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .info-box p {
      margin: 5px 0;
      font-size: 13px;
    }
    .info-box strong {
      display: inline-block;
      width: 120px;
      color: #666;
    }
    .results-section {
      margin-top: 30px;
    }
    .results-section h2 {
      color: #0d6efd;
      font-size: 20px;
      margin-bottom: 20px;
      border-bottom: 2px solid #dee2e6;
      padding-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #0d6efd;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
      font-size: 13px;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .status-normal { color: #198754; font-weight: bold; }
    .status-abnormal { color: #ffc107; font-weight: bold; }
    .status-critical { color: #dc3545; font-weight: bold; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #dee2e6;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
      padding: 0 50px;
    }
    .signature-box {
      text-align: center;
    }
    .signature-line {
      border-top: 2px solid #333;
      width: 200px;
      margin-top: 50px;
      margin-bottom: 5px;
    }
    .remarks {
      background: #fff3cd;
      padding: 10px;
      border-left: 4px solid #ffc107;
      margin-top: 10px;
      font-size: 12px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏥 iLab</h1>
    <p style="font-size: 16px; margin-top: 10px;"><strong>Laboratory Test Report</strong></p>
    <p>Report Generated: ${currentDate}</p>
  </div>

  <div class="info-section">
    <div class="info-box">
      <h3>Patient Information</h3>
      <p><strong>Name:</strong> ${this.order.patient_name}</p>
      <p><strong>Patient ID:</strong> ${this.order.patient_code}</p>
      <p><strong>Age/Gender:</strong> ${this.order.age} Years / ${this.order.gender}</p>
      <p><strong>Phone:</strong> ${this.order.phone}</p>
    </div>

    <div class="info-box">
      <h3>Order Information</h3>
      <p><strong>Order Number:</strong> ${this.order.order_number}</p>
      <p><strong>Order Date:</strong> ${new Date(this.order.created_at).toLocaleString()}</p>
      <p><strong>Status:</strong> ${this.order.status.toUpperCase()}</p>
      <p><strong>Priority:</strong> ${this.order.priority.toUpperCase()}</p>
    </div>

    <div class="info-box">
      <h3>Referring Doctor</h3>
      <p><strong>Name:</strong> ${this.order.doctor_name || 'N/A'}</p>
      <p><strong>Specialization:</strong> ${this.order.specialization || 'N/A'}</p>
    </div>
  </div>

  <div class="results-section">
    <h2>Test Results</h2>
    <table>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Result</th>
          <th>Unit</th>
          <th>Normal Range</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${this.order.items.map((item: any) => `
          <tr>
            <td><strong>${item.test_name}</strong></td>
            <td>${item.result_value || item.result_text || 'Pending'}</td>
            <td>${item.unit || '-'}</td>
            <td>${item.normal_range || '-'}</td>
            <td class="status-${item.result_status || 'normal'}">
              ${(item.result_status || 'PENDING').toUpperCase()}
            </td>
          </tr>
          ${item.remarks ? `
          <tr>
            <td colspan="5">
              <div class="remarks">
                <strong>Remarks:</strong> ${item.remarks}
              </div>
            </td>
          </tr>
          ` : ''}
        `).join('')}
      </tbody>
    </table>
  </div>

  ${this.order.notes ? `
  <div class="info-box">
    <h3>Additional Notes</h3>
    <p>${this.order.notes}</p>
  </div>
  ` : ''}

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <p><strong>Lab Technician</strong></p>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <p><strong>Verified By</strong></p>
    </div>
  </div>

  <div class="footer">
    <p><strong>iLab - Laboratory Management System</strong></p>
    <p>This is a computer-generated report. For any queries, please contact the laboratory.</p>
    <p>Report ID: ${this.order.order_number} | Generated: ${currentDate}</p>
  </div>
</body>
</html>
    `;
  }
}
