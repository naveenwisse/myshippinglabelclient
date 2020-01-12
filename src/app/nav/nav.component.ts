import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MzModalService } from 'ngx-materialize';
import { LoginmodalboxComponent } from '../loginmodal/loginmodalbox/loginmodalbox.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

declare var M: any;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  @ViewChild('nav') nav: ElementRef;

  constructor(
    private modalService: MzModalService,
    private router: Router,
    private logSucc: AuthService,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  login = false;
  instanceMSideNav;

  openLoginModal() {
    this.modalService.open(LoginmodalboxComponent);
  }

  logout() {
    const liElements = document.querySelectorAll('.sidenav>li');
    localStorage.clear();
    this.router.navigateByUrl('/');
    this.apiService.progressSubject.next(-1);
    this.authService.logSuccess(true);
    this.login = false;
    const elems = document.querySelector('.sidenav');
    const inst = M.Sidenav.getInstance(elems);
    liElements.forEach(li => {
      li.addEventListener('click', () => {
        inst.close();
      });
    });
    this.ngOnInit();
  }

  closeSidebar() {}

  ngOnInit() {
    console.log('lol');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        this.nav.nativeElement.classList.add('show');
      } else {
        this.nav.nativeElement.classList.remove('show');
      }
    });

    this.authService.$loginSuccess.subscribe(data => {
      if (!data) {
        this.login = true;
      } else {
        this.login = false;
      }
    });

    if (localStorage.getItem('userToken')) {
      this.login = true;
    } else {
      this.login = false;
    }

    document.addEventListener('DOMContentLoaded', function() {
      const elems = document.querySelector('.sidenav');
      const that = this;
      const instances = M.Sidenav.init(elems);
      const inst = M.Sidenav.getInstance(elems);
      const liElements = document.querySelectorAll('.sidenav>li');
      liElements.forEach(li => {
        li.addEventListener('click', () => {
          inst.close();
        });
      });
    });
  }
}
