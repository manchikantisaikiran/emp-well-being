import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginApiSuccessResponse } from '@interface';
import { ToastService } from 'angular-toastify';
import { BehaviorSubject, takeWhile } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  alive = true;
  isFormSubmitted = false;

  loading$ = new BehaviorSubject(false);

  constructor(private api: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private utils: UtilsService,
    private toaster: ToastService) {
    this.form = this.fb.group({
      Username: ['', [Validators.required, Validators.pattern(/(?=.*\d)(?=.*[a-z])/)]],
      Password: ['', [Validators.required, Validators.pattern(/(?=.*\d)(?=.*[a-z])/)]]
    })
  }

  ngOnInit(): void {
  }

  login() {
    this.isFormSubmitted = true;
    if (!this.form.valid) {
      return
    }
    this.loading$.next(true);
    this.api.login(this.form.value).pipe(takeWhile(_ => this.alive)).subscribe({
      next: (res: Partial<LoginApiSuccessResponse>) => {
        console.log(res);
        this.loading$.next(false);
        this.utils.setLocalStorage('currentUser',res);
        this.utils.getCurrentUser();
        this.router.navigate(['dashboard'])
        console.log('came heree');
      },
      error: ({ error }) => {
        console.log(error);
        this.loading$.next(false);
        this.toaster.error(error.message);
      }
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }

}
