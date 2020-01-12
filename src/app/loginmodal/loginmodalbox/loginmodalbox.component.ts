import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MzBaseModal, MzToastService, MzModalComponent } from 'ngx-materialize';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loginmodalbox',
  templateUrl: './loginmodalbox.component.html',
  styleUrls: ['./loginmodalbox.component.scss']
})
export class LoginmodalboxComponent extends MzBaseModal implements OnInit {
  formRegister: FormGroup;
  formLogin: FormGroup;
  error: String;
  errorLog: String;

  @ViewChild('modal') modal: MzModalComponent;

  load = false;

  constructor(
    private authService: AuthService,
    private toastService: MzToastService
  ) {
    super();
  }

  onKeyDown(event, index) {
    if (index === 1) {
      this.login();
    } else {
      this.register();
    }
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
          'You Have Been Successfully Registered!',
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
        console.log(e);
        this.modal.closeModal();
        this.authService.logSuccess(false);
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

  ngOnInit(): void {
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
  }
}
