import { ApiService } from './../services/api.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  trigger,
  transition,
  stagger,
  animate,
  style,
  query
} from '@angular/animations';
// import { query } from '@angular/core/src/render3/query';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({
          transform: 'translateX(-10%)',
          opacity: 0
        }),
        animate(
          '1000ms ease-in-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        )
      ])
    ])
  ]
})
export class ProgressComponent implements OnInit {
  @ViewChild('fir') first: ElementRef;
  @ViewChild('sec') second: ElementRef;
  @ViewChild('thi') third: ElementRef;
  @ViewChild('fou') fourth: ElementRef;
  @ViewChild('fiv') five: ElementRef;

  constructor(private apiService: ApiService) {}

  show = false;

  ngOnInit() {
    this.apiService.$progressSubject.subscribe(data => {
      if (data === 0) {
        this.show = true;
      }

      if (data === -1) {
        this.show = false;
      }
      // setTimeout(() => {
      //   console.log(this.second);
      // }, 100);

      if (data === 1) {
        this.show = true;
        setTimeout(() => {
          this.first.nativeElement.classList.remove('active');
          this.second.nativeElement.classList.add('active');
          this.third.nativeElement.classList.remove('active');
        }, 100);
      }
      if (data === 2) {
        this.show = true;
        setTimeout(() => {
          this.first.nativeElement.classList.remove('active');
          this.second.nativeElement.classList.remove('active');
          this.third.nativeElement.classList.add('active');
          this.fourth.nativeElement.classList.remove('active');
        }, 100);
      }
      if (data === 3) {
        this.second.nativeElement.classList.remove('active');
        this.third.nativeElement.classList.remove('active');
        this.fourth.nativeElement.classList.add('active');
        this.five.nativeElement.classList.remove('active');
      }

      if (data === 4) {
        this.fourth.nativeElement.classList.remove('active');
        this.five.nativeElement.classList.add('active');
      }
    });
  }
}
