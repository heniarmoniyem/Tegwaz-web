import { subscribeOn } from 'rxjs/operators';
import { InitService } from './../services/init.service';
import { Auth } from './../services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  isVisible = false;
  form!: FormGroup;
  options: string[] = [];
  subscription: Subscription;
  isLoading = true;
  passwordVisible = false;

  onInput(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    if (!value || value.indexOf('@') >= 0) {
      this.options = [];
    } else {
      this.options = ['gmail.com', 'yahoo.com', 'lycos.com'].map(
        (domain) => `${value}@${domain}`
      );
    }
  }

  submitForm(): void {
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.valid) {
      this.isLoading = true;
      const email = this.form.value.email;
      const password = this.form.value.password;
      this.auth.login({ email, password }).subscribe(
        () => {},
        (error) => {
          this.isLoading = false;
          if (error.includes('email')) {
            this.form.patchValue({ email: null });
          } else {
            this.form.patchValue({ password: null });
          }
          this.message.create('error', error);
        }
      );
    }
  }

  private appInitialization() {
    this.isLoading = true;
    this.appInitService.tripsInitialization().then(() => {
      this.isLoading = false;
    });
  }

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private message: NzMessageService,
    private routes: Router,
    private appInitService: InitService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      remember: [true],
    });

    this.subscription = this.auth.user.subscribe((response) => {
      this.isLoading = false;
      if (response) {
        this.routes.navigate(['main']);
      }
    });

    this.appInitialization();
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  displayResetPasswordPage() {
    this.routes.navigate(['reset_password']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
