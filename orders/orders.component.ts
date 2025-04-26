import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order.model';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  standalone: false
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  expandedOrderId: number | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.loading = false;
        this.snackBar.open('Siparişleriniz yüklenirken bir hata oluştu.', 'Tamam', {
          duration: 3000
        });
      }
    });
  }

  toggleOrderDetails(orderId: number): void {
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;
    } else {
      this.expandedOrderId = orderId;
    }
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

  navigateToOrderDetail(orderId: number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/orders', orderId]);
  }

  cancelOrder(orderId: number, event: MouseEvent): void {
    event.stopPropagation();
    
    if (confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          const orderIndex = this.orders.findIndex(order => order.id === orderId);
          if (orderIndex !== -1) {
            this.orders[orderIndex].status = 'İptal Edildi';
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
} 