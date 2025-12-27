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
    
    // Ensure forms are enabled
    this.paymentForm.enable();
    this.resultForm.enable();
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
      normal_range: item.normal_range || item.master_normal_range || '',
      unit: item.unit || item.master_unit || '',
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
    const currentDate = new Date().toLocaleDateString('en-GB');
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
    
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Lab Report - ${this.order.order_number}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      margin: 0;
      padding: 8mm;
      background: rgb(255, 255, 255);
      color: #000;
      font-size: 8pt;
      line-height: 1.0;
    }
    .header {
      display: flex;
      align-items: flex-start;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .logo {
      width: 50px;
      height: 50px;
      background: #e74c3c;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .patient-info {
      margin: 8px 0;
      font-size: 8pt;
    }
    .patient-header {
      background: #f0f0f0;
      padding: 4px 10px;
      font-weight: bold;
    }
    .patient-left, .patient-right {
    }
    .detail-row {
      margin: 2px 0;
      display: flex;
    }
    .detail-label {
      width: 150px;
      font-weight: bold;
      flex-shrink: 0;
    }
    .detail-value {
      flex: 1;
    }
    .section-header {
      font-weight: bold;
      font-size: 8pt;
      margin: 8px 0 4px 0;
    }
    .specimen-info {
      margin: 6px 0;
      font-size: 8pt;
    }
    .results-section {
      margin: 10px 0;
      font-size: 8pt;
    }
    .results-table {
      width: 30%;
      margin: 5px 0;
    }
    .results-table {
    }
    .results-table th {
      background: #f0f0f0;
      font-weight: bold;
      text-align: left;
    }
    .test-name-col {
      text-align: left !important;
      font-weight: bold;
    }
    .test-value-col {
      font-weight: bold;
    }
    .abnormal {
      color: #e74c3c;
      font-weight: bold;
    }
    .abnormal {
      color: #000;
      font-weight: bold;
    }
    .comments-section {
      margin: 12px 0;
      font-size: 8pt;
    }
    .footer {
      margin-top: 15px;
      font-size: 8pt;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="patient-info">
    <div class="">
      <div class="patient-left">
        <div class="detail-row">
          <span class="detail-label">Medical Record #:</span>
          <span class="detail-value">${this.order.order_number}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Patient Name:</span>
          <span class="detail-value">${this.order.patient_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Specimen ID:</span>
          <span class="detail-value">${this.order.patient_code}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Clinical Information:</span>
          <span class="detail-value">${this.order.notes || 'None'}</span>
        </div>
      </div>
      <div class="patient-right">
        <div class="detail-row">
          <span class="detail-label">Age / Gender:</span>
          <span class="detail-value">${this.order.age} / ${this.order.gender}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Location:</span>
          <span class="detail-value">OP</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Requesting Physician:</span>
          <span class="detail-value">${this.order.doctor_name || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Received:</span>
          <span class="detail-value">${new Date(this.order.created_at).toLocaleDateString('en-GB')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Collected on:</span>
          <span class="detail-value">${new Date(this.order.created_at).toLocaleDateString('en-GB')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Reported on:</span>
          <span class="detail-value">${currentDate}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="specimen-info">
    <div class="section-header">SOURCE: ${this.order.items.map((item: any) => item.sample_type || 'BLOOD').join(', ').toUpperCase()}</div>
  </div>

  <div class="results-section">
    <div class="section-header"><strong>RESULTS</strong></div>
    <table class="results-table">
      <thead>
        <tr>
          <th style="width: 40%;">Test</th>
          <th style="width: 20%;">Result</th>
          <th style="width: 15%;">Unit</th>
          <th style="width: 25%;">Ref.Range</th>
        </tr>
      </thead>
      <tbody>
        ${this.order.items.map((item: any) => `
          <tr>
            <td class="test-name-col">${item.test_name.toUpperCase()}</td>
            <td class="test-value-col ${item.result_status === 'abnormal' ? 'abnormal' : ''}">
              ${item.result_value || item.result_text || 'NIL'}
            </td>
            <td>${item.unit || item.master_unit || ''}</td>
            <td>${item.normal_range || item.master_normal_range || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    ${this.order.items.filter((item: any) => item.remarks).map((item: any) => `
      <div style="margin: 5px 0; font-size: 8pt;">
        <strong>REMARKS</strong> ${item.remarks}
      </div>
    `).join('')}
  </div>

  ${this.order.notes ? `
  <div class="comments-section">
    <div class="section-header">COMMENTS:</div>
    <div>${this.order.notes}</div>
  </div>
  ` : ''}

  <div class="footer">
    <div><strong>This is a computer generated report therefore does not require any signature.</strong></div>
    <div>Printed only: ${currentDate} ${currentTime} / MediQ System</div>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }
}
