import { Router } from '@angular/router';
import { AccountService } from './../services/account.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  validateForm!: FormGroup;
  email: string = null!;
  errorMessage = null;
  isLoading = false;

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    this.email = null!;
    this.errorMessage = null!;
    if (this.validateForm.valid) {
      this.isLoading = true;
      this.accountService
        .resetPassword(this.validateForm.value.email)
        .subscribe(
          (response) => {
            this.email = response.email;
            this.isLoading = false;
            this.validateForm.reset();
          },
          (error) => {
            this.validateForm.patchValue({ email: null });
            this.errorMessage = error;
            this.isLoading = false;
          }
        );
    }
  }

  backToLogin() {
    this.routes.navigate(['login']);
  }

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private routes: Router
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
    });
  }
}
