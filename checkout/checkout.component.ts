import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: false
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  cartTotal = 0;
  processing = false;
  currentUser: User | null = null;
  paymentMethods = [
    { id: 'credit_card', name: 'Kredi Kartı' },
    { id: 'debit_card', name: 'Banka Kartı' },
    { id: 'bank_transfer', name: 'Havale/EFT' }
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.checkoutForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      paymentMethod: ['credit_card', Validators.required],
      cardName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      cardExpiry: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/[0-9]{2}$')]],
      cardCvc: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      savePaymentInfo: [false]
    });
  }

  ngOnInit(): void {
    this.loadCartItems();
    this.loadUserProfile();
  }

  loadCartItems(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });

    this.cartService.getCartTotal().subscribe(total => {
      this.cartTotal = total;
    });
  }

  loadUserProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.checkoutForm.patchValue({
          fullName: `${user.name} ${user.surname}`,
          email: user.email,
          phone: user.phoneNumber || ''
        });
      }
    });
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      return;
    }

    this.processing = true;
    
    // Adres bilgisini formatla
    const formValues = this.checkoutForm.value;
    const shippingAddress = `${formValues.fullName}, ${formValues.address}, ${formValues.city}, ${formValues.postalCode}, Tel: ${formValues.phone}`;

    // Ödeme işlemi burada simüle edilebilir
    setTimeout(() => {
      this.cartService.checkout(shippingAddress)
        .pipe(
          finalize(() => {
            this.processing = false;
          })
        )
        .subscribe({
          next: (order) => {
            this.snackBar.open('Siparişiniz başarıyla oluşturuldu!', 'Tamam', {
              duration: 3000
            });
            this.router.navigate(['/order-success', order.id]);
          },
          error: (error) => {
            console.error('Checkout error:', error);
            this.snackBar.open('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.', 'Tamam', {
              duration: 5000
            });
          }
        });
    }, 1500); // Ödeme işlemini simüle etmek için gecikme
  }

  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  }

  // Tüm form alanlarını dokunulmuş olarak işaretle
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Ödeme yöntemi değiştiğinde form validasyonlarını güncelle
  onPaymentMethodChange(method: string): void {
    const cardControls = ['cardName', 'cardNumber', 'cardExpiry', 'cardCvc'];
    
    if (method === 'credit_card' || method === 'debit_card') {
      cardControls.forEach(control => {
        this.checkoutForm.get(control)?.setValidators([Validators.required]);
      });
    } else {
      cardControls.forEach(control => {
        this.checkoutForm.get(control)?.clearValidators();
        this.checkoutForm.get(control)?.updateValueAndValidity();
      });
    }
  }

  get f() { return this.checkoutForm.controls; }
} 