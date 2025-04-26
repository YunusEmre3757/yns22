import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
  standalone: false
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error = false;
  
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const orderId = Number(params.get('id'));
      if (orderId) {
        this.loadOrderDetails(orderId);
      } else {
        this.error = true;
        this.loading = false;
      }
    });
  }

  loadOrderDetails(orderId: number): void {
    this.loading = true;
    this.orderService.getOrderDetails(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching order details:', error);
        this.error = true;
        this.loading = false;
        this.snackBar.open('Sipariş detayları yüklenirken bir hata oluştu.', 'Tamam', {
          duration: 3000
        });
      }
    });
  }

  formatDate(date: string | Date): string {
    const orderDate = new Date(date);
    return `${orderDate.toLocaleDateString('tr-TR')}`;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'tamamlandı':
        return 'status-completed';
      case 'beklemede':
        return 'status-pending';
      case 'kargoya verildi':
        return 'status-shipped';
      case 'iptal edildi':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'tamamlandı':
        return 'check_circle';
      case 'beklemede':
        return 'hourglass_empty';
      case 'kargoya verildi':
        return 'local_shipping';
      case 'iptal edildi':
        return 'cancel';
      default:
        return 'info';
    }
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  cancelOrder(orderId: number): void {
    if (confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          if (this.order) {
            this.order.status = 'İptal Edildi';
          }
          this.snackBar.open('Sipariş başarıyla iptal edildi.', 'Tamam', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          this.snackBar.open('Sipariş iptal edilirken bir hata oluştu.', 'Tamam', {
            duration: 3000
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
} 