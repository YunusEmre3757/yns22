import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CheckoutComponent } from './checkout.component';
import { authGuard } from '../guards/auth.guard';

const routes: Routes = [
  { path: '', component: CheckoutComponent, canActivate: [authGuard] }
];

@NgModule({
  declarations: [
    CheckoutComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class CheckoutModule { } 