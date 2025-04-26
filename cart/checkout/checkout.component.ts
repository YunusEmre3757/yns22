import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: false
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cartTotal: number = 0;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  createForm(): void {
    this.checkoutForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      paymentMethod: ['creditCard', Validators.required],
      cardNumber: [''],
      cardExpiry: [''],
      cardCvv: ['']
    });

    // Ödeme yöntemi değiştiğinde kart bilgilerini kontrol et
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      const cardNumber = this.checkoutForm.get('cardNumber');
      const cardExpiry = this.checkoutForm.get('cardExpiry');
      const cardCvv = this.checkoutForm.get('cardCvv');

      if (method === 'creditCard') {
        cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
        cardExpiry?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
        cardCvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      } else {
        cardNumber?.clearValidators();
        cardExpiry?.clearValidators();
        cardCvv?.clearValidators();
      }

      cardNumber?.updateValueAndValidity();
      cardExpiry?.updateValueAndValidity();
      cardCvv?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.cartService.getCartTotal().subscribe(total => {
      this.cartTotal = total;
    });
    
    // Başlangıçta kredi kartı seçili ise validasyonları uygula
    if (this.checkoutForm.get('paymentMethod')?.value === 'creditCard') {
      const cardNumber = this.checkoutForm.get('cardNumber');
      const cardExpiry = this.checkoutForm.get('cardExpiry');
      const cardCvv = this.checkoutForm.get('cardCvv');
      
      cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
      cardExpiry?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
      cardCvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      
      cardNumber?.updateValueAndValidity();
      cardExpiry?.updateValueAndValidity();
      cardCvv?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      this.loading = true;
      
      // Normalde bir servis çağrısı yapılır
      // Şimdilik başarılı bir siparişi simüle edelim
      setTimeout(() => {
        this.cartService.clearCart();
        this.snackBar.open('Siparişiniz başarıyla alındı!', 'Tamam', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loading = false;
        this.router.navigate(['/home']);
      }, 2000);
    } else {
      this.checkoutForm.markAllAsTouched();
      this.snackBar.open('Lütfen tüm gerekli alanları doldurun', 'Tamam', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  backToCart(): void {
    this.router.navigate(['/cart']);
  }
} 