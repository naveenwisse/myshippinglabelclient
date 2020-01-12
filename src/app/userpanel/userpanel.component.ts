import { Component, OnInit } from '@angular/core';
import { ApiService } from './../services/api.service';
import { MzCollapsibleModule } from 'ngx-materialize';

declare const $: any;

@Component({
  selector: 'app-userpanel',
  templateUrl: './userpanel.component.html',
  styleUrls: ['./userpanel.component.scss']
})
export class UserpanelComponent implements OnInit {
  userTransactions = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    let userdata;
    userdata = localStorage.getItem('userEmail');
    const data = {
      email: userdata
    };

    this.apiService.userTransactions(data).subscribe((transactions: any) => {
      this.userTransactions = transactions;
      $(document).ready(function() {
        $('.collapsible').collapsible();
      });
    });
    this.apiService.progressSubject.next(-1);
  }
}
