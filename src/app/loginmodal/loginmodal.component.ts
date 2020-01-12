import { ApiService } from './../services/api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MzToastService, MzModalService } from 'ngx-materialize';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loginmodal',
  templateUrl: './loginmodal.component.html',
  styleUrls: ['./loginmodal.component.scss']
})
export class LoginmodalComponent implements OnInit {
  formRegister: FormGroup;
  formLogin: FormGroup;
  error: String;
  errorLog: String;

  load = false;

  goBackBool = true;

  constructor(
    private authService: AuthService,
    private toastService: MzToastService,
    private apiService: ApiService,
    private router: Router
  ) {}

  onKeyDown(event, index) {
    if (index === 1) {
      this.login();
    } else {
      this.register();
    }
  }

  goBack() {
    this.router.navigateByUrl('/');
    this.apiService.progressSubject.next(-1);
    // localStorage.removeItem('dash');
  }

  register() {
    this.load = true;
    const pass = this.formRegister.value.pass;
    const repass = this.formRegister.value.repass;
    const email = this.formRegister.value.email;
    const username = this.formRegister.value.username;

    if (this.formRegister.status === 'INVALID') {
      this.load = false;
      return (this.error = 'Please fill out all required fields.');
    }

    if (pass !== repass) {
      this.load = false;
      return (this.error = 'Passwords do not match.');
    }

    this.error = '';

    const data = {
      fullname: username,
      email: email,
      password: pass
    };

    this.authService.register(data).subscribe((e: any) => {
      this.load = false;
      if (e.Message === 'Email Id already registered') {
        this.toastService.show(
          'This E-mail is already registered!',
          6000,
          'red'
        );
      }
      if (e.Message === 'Success') {
        this.toastService.show(
          'You Have Been Successfully Registered! Now please login.',
          6000,
          'green'
        );
      }
    });
  }

  login() {
    this.load = true;
    const email = this.formLogin.value.email;
    const pass = this.formLogin.value.pass;

    if (this.formLogin.status === 'INVALID') {
      this.load = false;
      return (this.errorLog = 'Please fill out all required fields.');
    }

    const data = {
      email: email,
      password: pass
    };

    this.errorLog = '';

    this.authService.login(data).subscribe((e: any) => {
      if (e.success) {
        this.toastService.show(
          'You Have Been Successfully Logged In!',
          6000,
          'green'
        );
        localStorage.setItem('userToken', e.token);
        localStorage.setItem('userId', e.currUser.user_id);
        localStorage.setItem('userEmail', e.currUser.email);
        this.authService.logSuccess(false);
        this.router.navigateByUrl('/dashboard');
        console.log(e);
      } else {
        this.load = false;
        this.toastService.show(
          'Something bad happened. Please try again',
          6000,
          'red'
        );
      }
    });
  }

  guest() {
    this.router.navigateByUrl('/dashboard');
  }

  ngOnInit() {
    this.apiService.progressSubject.next(1);
    this.formRegister = new FormGroup({
      username: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      pass: new FormControl(null, Validators.required),
      repass: new FormControl(null, Validators.required)
    });
    this.formLogin = new FormGroup({
      email: new FormControl(null, Validators.required),
      pass: new FormControl(null, Validators.required)
    });
    if (localStorage.getItem('userToken')) {
      this.router.navigateByUrl('/dashboard');
    }
  }
}
