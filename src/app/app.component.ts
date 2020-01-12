import { AuthService } from './services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  login = true;

  ngOnInit(): void {
    this.authService.$loginSuccess.subscribe((data: any) => {
      this.login = data;
    });
    if (localStorage.getItem('userToken')) {
      this.login = false;
    } else {
      this.login = true;
    }
  }
}
