import { Router } from '@angular/router';
import { GooglePlacesDirective } from './google-places.directive';
import { ApiService } from './../services/api.service';
import {
  Component,
  OnInit,
  NgZone,
  ViewChildren,
  QueryList,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query
} from '@angular/animations';
import { LoginmodalComponent } from '../loginmodal/loginmodal.component';
import { MzModalService, MzToastService } from 'ngx-materialize';

declare var M: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('races', [
      transition('* => *', [
        query(
          ':leave',
          [
            stagger(300, [
              animate(
                '0s ease-in-out',
                style({
                  transform: 'translateX(-10%)',
                  opacity: 0
                })
              )
            ])
          ],
          { optional: true }
        ),
        query(
          ':enter',
          [
            style({
              transform: 'translateX(-10%)',
              opacity: 0
            }),
            stagger(300, [
              animate(
                '1s ease-in-out',
                style({
                  transform: 'translateX(0)',
                  opacity: 1
                })
              )
            ])
          ],
          { optional: true }
        )
      ])
    ])
  ]
})
export class MainComponent implements OnInit {
  inputText: String;
  form: FormGroup;
  results: Array<any>;
  showTo = false;
  showFrom = false;
  loader = true;
  searchModel: String;
  exp = '';
  ratesBool = true;
  expand = 'expand_more';
  load = false;

  @ViewChildren('cards') cards: QueryList<any>;
  @ViewChildren('arrow') arrows: QueryList<any>;
  @ViewChild('box') box: ElementRef;
  @ViewChild('goBackElement') goBackElement: ElementRef;
  @ViewChildren('label') labels: QueryList<any>;

  units = {
    wei: '',
    dim: ''
  };

  carriersMargins;

  shipment = {
    from_country_code: '',
    from_postal_code: '',
    to_country_code: '',
    to_postal_code: '',
    weight: {
      value: 0,
      unit: ''
    },
    dimensions: {
      unit: '',
      length: 0,
      width: 0,
      height: 0
    },
    carrier_ids: []
  };

  ratesArray = [];
  ratesServerArray = [];

  public title = 'Places';
  public addrKeys: string[];
  public addr: object;

  carriers = [];

  constructor(
    private apiService: ApiService,
    private modalService: MzModalService,
    private router: Router,
    private toastService: MzToastService
  ) {}

  setAddressFrom(addr) {
    console.log(addr);
    if (addr.country === 'US') {
      this.shipment.from_country_code = addr.country;
      this.apiService.geocodeAddress(addr, 2);
      this.apiService.$postCodeObsFrom.subscribe(post => {
        localStorage.setItem('addFrom', post);
        const dataRet = JSON.parse(post);
        this.shipment.from_postal_code = dataRet.postalCode;
      });
    } else {
      this.toastService.show(
        'The shipment must be sent from the United States',
        4000,
        'red'
      );
      this.form.controls['shipFrom'].setValue('');
    }
  }

  goAnimate() {
    this.exp = 'goAnimate';
  }

  setAddressTo(addr) {
    if (addr.country === 'US') {
      this.shipment.to_country_code = addr.country;
      this.apiService.geocodeAddress(addr, 1);
      this.apiService.$postCodeObsTo.subscribe(post => {
        localStorage.setItem('addTo', post);
        const dataRet = JSON.parse(post);
        this.shipment.to_postal_code = dataRet.postalCode;
      });
    } else {
      this.toastService.show(
        'The shipment must be sent to the United States',
        4000,
        'red'
      );
      this.form.controls['shipTo'].setValue('');
    }
  }

  setUnit() {
    if (this.form.value.unit === 'lb') {
      this.units.dim = 'in';
      this.units.wei = 'lb';
      this.shipment.weight.unit = 'ounce';
      this.shipment.dimensions.unit = 'inch';
    } else {
      this.units.dim = 'cm';
      this.units.wei = 'kg';
      this.shipment.weight.unit = 'kilogram';
      this.shipment.dimensions.unit = 'centimeter';
    }
  }

  goBack() {
    this.ratesBool = true;
    this.apiService.progressSubject.next(-1);
    const fromAdd = JSON.parse(localStorage.getItem('addFrom'));
    const toAdd = JSON.parse(localStorage.getItem('addTo'));
    const dimens = JSON.parse(localStorage.getItem('weight'));
    if (fromAdd) {
      this.load = false;
      this.carriers = [];
      setTimeout(() => {
        this.box.nativeElement.classList.add('slide-in');
        this.form.controls['shipFrom'].setValue(
          fromAdd.formatedAddress +
            ', ' +
            fromAdd.locality +
            ', ' +
            fromAdd.state +
            ', USA'
        );
        this.form.controls['shipTo'].setValue(
          toAdd.formatedAddress +
            ', ' +
            toAdd.locality +
            ', ' +
            toAdd.state +
            ', USA'
        );
        this.form.controls['weight'].setValue(dimens.weight);
        this.form.controls['height'].setValue(dimens.dimensions.height);
        this.form.controls['width'].setValue(dimens.dimensions.width);
        this.form.controls['length'].setValue(dimens.dimensions.length);
        this.form.controls['unit'].setValue(this.unitsGen(dimens.unit));
        setTimeout(() => {
          this.labels.forEach(data => {
            data.nativeElement.classList.add('active');
            const addr = { country: 'US' };

            this.shipment.from_postal_code = fromAdd.postalCode;
            this.shipment.to_postal_code = toAdd.postalCode;
            this.shipment.from_country_code = 'US';
            this.shipment.to_country_code = 'US';
            this.shipment.dimensions.unit = dimens.dimensions.unit;
            this.shipment.weight.unit = dimens.unit;

            // this.setAddressFrom(addr);
            // this.setAddressTo(addr);
          });
        }, 200);
      }, 100);
    }
  }

  getRates() {
    this.load = true;
    console.log(this.shipment);
    if (this.form.status !== 'VALID') {
      // this.shipment.from_postal_code = '71745';
      // this.shipment.to_postal_code = '85705';
      // this.shipment.weight.unit = 'kilogram';
      // this.shipment.dimensions.unit = 'centimeter';
      // this.units.dim = 'cm';
      // this.units.wei = 'kg';
      // this.shipment.from_country_code = 'US';
      // this.shipment.to_country_code = 'US';
      this.shipment.dimensions.height = this.form.value.height;
      this.shipment.dimensions.length = this.form.value.length;
      this.shipment.dimensions.width = this.form.value.width;
      this.shipment.weight.value = this.form.value.weight;

      this.apiService
        .shipEngineGetRates(this.shipment)
        .subscribe((data: any) => {
          if (data.error) {
            this.toastService.show('Enter correct address', 4000, 'red');
            this.load = false;
            return;
          }
          for (let i = 0; data.length > i; i++) {
            if (data[i].error_messages) {
              for (let x = 0; data[i].error_messages.length > x; x++) {
                this.toastService.show(data[i].error_messages[x], 4000, 'red');
                this.load = false;
                return;
              }
            }
          }
          const dimensions = {
            dimensions: {
              height: this.shipment.dimensions.height,
              width: this.shipment.dimensions.width,
              length: this.shipment.dimensions.length,
              unit: this.shipment.dimensions.unit
            },
            weight: this.shipment.weight.value,
            unit: this.shipment.weight.unit
          };
          localStorage.setItem('weight', JSON.stringify(dimensions));
          window.scrollTo(0, 0);
          this.box.nativeElement.classList.remove('slide-in');
          this.apiService.progressSubject.next(0);
          setTimeout(() => {
            this.ratesArray = data;
            for (let i = 0; data.length > i; i++) {
              for (let x = 0; this.carriersMargins.length > x; x++) {
                if (
                  this.ratesArray[i].carrier_id ===
                  this.carriersMargins[x].carrier_id
                ) {
                  const priceMargin =
                    (1 + 0.01 * this.carriersMargins[x].margin_p) *
                      data[i].shipping_amount.amount +
                    this.carriersMargins[x].margin_value;
                  const fixedPrice = parseFloat(priceMargin).toFixed(2);

                  this.ratesArray[i].shipping_amount.amount = fixedPrice;
                }
              }
            }
            this.getNewObject();

            this.ratesBool = false;
            setTimeout(() => {
              this.goBackElement.nativeElement.classList.add('go-active');
            }, 100);
          }, 1000);
        });
    } else {
      this.load = false;
    }
  }

  shipNow(estData) {
    localStorage.setItem('dash', 'true');
    localStorage.setItem('estData', JSON.stringify(estData));
    this.apiService.progressSubject.next(1);
    this.router.navigateByUrl('/login');
  }

  getNewObject() {
    for (let g = 0; this.carriersMargins.length > g; g++) {
      const carrier = {
        carrier_id: '',
        prices: [],
        carrier_name: '',
        prices_string: '',
        shipment: [],
        img: ''
      };
      for (let i = 0; this.ratesArray.length > i; i++) {
        if (this.ratesArray[i].error_messages.length >= 1) {
          continue;
        }
        if (
          this.ratesArray[i].carrier_id === this.carriersMargins[g].carrier_id
        ) {
          carrier.carrier_id = this.ratesArray[i].carrier_id;
          carrier.carrier_name = this.ratesArray[i].carrier_friendly_name;
          if (
            this.ratesArray[i].carrier_id === this.carriersMargins[g].carrier_id
          ) {
            carrier.prices.push(this.ratesArray[i].shipping_amount.amount);
          }
          carrier.img = this.carriersMargins[g].img_url;
          carrier.shipment.push(this.ratesArray[i]);
        }
      }
      carrier.prices_string = this.returnPriceRange(carrier.prices);
      if (carrier.carrier_id === this.carriersMargins[g].carrier_id) {
        this.carriers.push(carrier);
      }
    }
  }

  deliveryDays(days) {
    switch (true) {
      case days === '1-2':
        return 'One or two days';
      case days === '1':
        return 'Tomorrow';
      case days === '2':
        return 'Two days';
      case days === '3':
        return 'Three days';
      case days === '4':
        return 'Four days';
      case days === '5':
        return 'Five days';
      case days === '6':
        return 'Six days';
      case days === '7':
        return 'One week';
      case parseInt(days, 10) > 7:
        return 'More than one week';
    }

    if (days === '1') {
      return 'Tomorrow';
    } else {
      return days;
    }
  }

  returnPriceRange(array) {
    let lowest;
    let higher;
    lowest = Math.min.apply(null, array);
    higher = Math.max.apply(null, array);
    if (array.length === 1) {
      return `${lowest}$`;
    }
    return `${lowest}$ - ${higher}$`;
  }

  open(index) {
    if (
      this.cards.toArray()[index].nativeElement.classList.contains('activeCard')
    ) {
      this.cards.toArray()[index].nativeElement.classList.remove('activeCard');
      this.arrows.toArray()[index].nativeElement.innerHTML = 'expand_more';
      this.cards.toArray()[index].nativeElement.style.maxHeight = `0px`;
    } else {
      const clientHight = this.cards.toArray()[index].nativeElement.firstChild
        .clientHeight;

      this.cards.toArray()[
        index
      ].nativeElement.style.maxHeight = `${clientHight + 100}px`;

      this.cards.toArray()[index].nativeElement.classList.add('activeCard');
      this.arrows.toArray()[index].nativeElement.innerHTML = 'expand_less';
    }
  }

  getPackageName(data) {
    switch (true) {
      case data === 'package':
        return 'Package';
      case data === 'flat_rate_envelope':
        return 'Flat Rate Envelope';
      case data === 'flat_rate_padded_envelope':
        return 'Flat Rate Padded Envelope';
      case data === 'flat_rate_legal_envelope':
        return 'Flat Rate Legal Envelope';
      case data === 'medium_flat_rate_box':
        return 'Medium Flat Rate Box';
      case data === 'small_flat_rate_box':
        return 'Small Flat Rate Box';
      case data === 'large_flat_rate_box':
        return 'Large Flat Rate Box';
      case data === 'letter':
        return 'Letter';
      case data === null:
        return 'Standard';
      case data === 'large_envelope_or_flat':
        return 'Large Envelope or Flat';
      case data === 'regional_rate_box_a':
        return 'Regional Rate Box A';
      case data === 'regional_rate_box_b':
        return 'Regional Rate Box B';
    }
  }

  shipEvent() {
    this.apiService.onShipClick.emit();
  }

  unitsGen(data) {
    if (data === 'centimeter') {
      return 'cm';
    } else if (data === 'kilogram') {
      return 'kg';
    } else if (data === 'ounce') {
      return 'lb';
    } else if (data === 'inch') {
      return 'in';
    }
  }

  ngOnInit() {
    document.addEventListener('DOMContentLoaded', function() {
      const elems = document.querySelector('#modal1');
      const instances = M.Modal.init(elems);
      const instance = M.Modal.getInstance(elems);
      instance.open();
    });
    this.form = new FormGroup({
      shipFrom: new FormControl(null, Validators.required),
      shipTo: new FormControl(null, Validators.required),
      postalCodeFrom: new FormControl(null, Validators.required),
      postalCodeTo: new FormControl(null, Validators.required),
      weight: new FormControl(null, Validators.required),
      height: new FormControl(null, Validators.required),
      length: new FormControl(null, Validators.required),
      width: new FormControl(null, Validators.required),
      unit: new FormControl(null, Validators.required)
    });
    setTimeout(() => {
      this.box.nativeElement.classList.add('slide-in');
    }, 100);

    setTimeout(() => {
      this.labels.forEach(data => {
        data.nativeElement.classList.add('active');
      });
    });

    this.apiService.getCarriers().subscribe((data: any) => {
      for (let i = 0; data.length > i; i++) {
        this.shipment.carrier_ids.push(data[i].carrier_id);
      }
      this.carriersMargins = data;
      // this.getRates();
    });
    const fromAdd = JSON.parse(localStorage.getItem('addFrom'));
    const toAdd = JSON.parse(localStorage.getItem('addTo'));
    const dimens = JSON.parse(localStorage.getItem('weight'));
    if (fromAdd) {
      this.load = false;
      this.carriers = [];
      setTimeout(() => {
        this.box.nativeElement.classList.add('slide-in');
        this.form.controls['shipFrom'].setValue(
          fromAdd.formatedAddress +
            ', ' +
            fromAdd.locality +
            ', ' +
            fromAdd.state +
            ', USA'
        );
        this.form.controls['shipTo'].setValue(
          toAdd.formatedAddress +
            ', ' +
            toAdd.locality +
            ', ' +
            toAdd.state +
            ', USA'
        );
        this.form.controls['weight'].setValue(dimens.weight);
        this.form.controls['height'].setValue(dimens.dimensions.height);
        this.form.controls['width'].setValue(dimens.dimensions.width);
        this.form.controls['length'].setValue(dimens.dimensions.length);
        this.form.controls['unit'].setValue(this.unitsGen(dimens.unit));

        setTimeout(() => {
          this.labels.forEach(data => {
            data.nativeElement.classList.add('active');
            const addr = { country: 'US' };

            this.shipment.from_postal_code = fromAdd.postalCode;
            this.shipment.to_postal_code = toAdd.postalCode;
            this.shipment.from_country_code = 'US';
            this.shipment.to_country_code = 'US';
            this.shipment.dimensions.unit = dimens.dimensions.unit;
            this.shipment.weight.unit = dimens.unit;

            // this.setAddressFrom(addr);
            // this.setAddressTo(addr);
          });
        }, 200);
      }, 100);
      this.apiService.progressSubject.next(-1);
    }
  }
}
