import { Router } from '@angular/router';
import { MainComponent } from './../main/main.component';
import { MzToastModule, MzToastService } from 'ngx-materialize';
import { ApiService } from './../services/api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query
} from '@angular/animations';
import { stripe } from 'src/environments/environment.prod';
import { first, take } from 'rxjs/operators';

declare var paypal: any;
declare var Stripe: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
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
export class DashboardComponent implements OnInit {
  form: FormGroup;
  formFrom: FormGroup;

  stripe = Stripe(`${stripe.apiKey}`);
  stripeCard;

  loadPayPal = false;
  loadStripe = false;

  email = false;

  @ViewChildren('carrier') carriersQuery: QueryList<any>;
  @ViewChildren('cards') cards: QueryList<any>;
  @ViewChildren('arrow') arrows: QueryList<any>;
  @ViewChildren('label') labels: QueryList<any>;
  @ViewChild('getHeight') getHeight: ElementRef;
  @ViewChild('setHeight') setHeight: ElementRef;

  rates;

  savedAddresses;
  choosedAddress;

  options = true;
  confirm = false;
  confirmObj;

  label;

  carr;
  carriersMargins;
  actualPrice;

  dataUser;

  payPalInit = true;
  goBackBool = true;

  choosedCarr = [];

  carriersRatesList = [];

  margins = { margin_value: 0, margin_p: 0 };

  constructor(
    private apiService: ApiService,
    private toastService: MzToastService,
    private router: Router
  ) {}

  goBack() {
    if (!this.confirm) {
      this.router.navigateByUrl('/');
      this.apiService.progressSubject.next(-1);
      // localStorage.removeItem('dash');
    } else {
      this.confirm = false;
      const addTo = JSON.parse(localStorage.getItem('addTo'));
      const addFrom = JSON.parse(localStorage.getItem('addFrom'));
      this.form.controls['addTo'].setValue(addTo.formatedAddress);
      this.form.controls['stateTo'].setValue(addTo.state);
      this.form.controls['postalTo'].setValue(addTo.postalCode);
      this.form.controls['citiTo'].setValue(addTo.locality);
      this.formFrom.controls['addFrom'].setValue(addFrom.formatedAddress);
      this.formFrom.controls['stateFrom'].setValue(addFrom.state);
      this.formFrom.controls['postalFrom'].setValue(addFrom.postalCode);
      this.formFrom.controls['citiFrom'].setValue(addFrom.locality);

      this.form.controls['nameTo'].setValue(
        this.dataUser.shipment.ship_to.name
      );
      this.form.controls['compTo'].setValue(
        this.dataUser.shipment.ship_to.company_name
      );
      this.form.controls['phoneTo'].setValue(
        this.dataUser.shipment.ship_to.phone
      );

      this.formFrom.controls['phoneFrom'].setValue(
        this.dataUser.shipment.ship_from.phone
      );
      this.formFrom.controls['nameFrom'].setValue(
        this.dataUser.shipment.ship_from.name
      );
      this.formFrom.controls['compFrom'].setValue(
        this.dataUser.shipment.ship_from.company_name
      );
      setTimeout(() => {
        this.labels.forEach(data => {
          data.nativeElement.classList.add('active');
        });
        const height = this.getHeight.nativeElement.clientHeight;
        this.setHeight.nativeElement.style.minHeight = `${height}px`;
        this.apiService.progressSubject.next(2);
      }, 100);
      this.payPalInit = true;
    }
  }

  saveAddress() {
    if (this.formFrom.status === 'VALID') {
      const data = {
        fullname: this.formFrom.value.nameFrom,
        phone: this.formFrom.value.phoneFrom,
        company: this.formFrom.value.compFrom,
        state: this.formFrom.value.stateFrom,
        zip: this.formFrom.value.postalFrom,
        city: this.formFrom.value.citiFrom,
        address: this.formFrom.value.addFrom,
        user_id: localStorage.getItem('userId')
      };
      this.apiService.saveUserData(data).subscribe((e: any) => {
        if (e.error === false) {
          this.toastService.show('The address has been saved.', 6000, 'green');
        } else {
          this.toastService.show(
            'Something bad happened. Please try again',
            6000,
            'red'
          );
        }
      });
    } else {
      alert('Fill the fields');
    }
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

      for (let i = 0; this.rates.length > i; i++) {
        if (this.rates[i].error_messages.length >= 1) {
          continue;
        }
        if (this.rates[i].carrier_id === this.carriersMargins[g].carrId) {
          carrier.carrier_id = this.rates[i].carrier_id;
          carrier.carrier_name = this.rates[i].carrier_friendly_name;

          if (this.rates[i].carrier_id === this.carriersMargins[g].carrId) {
            carrier.prices.push(this.rates[i].shipping_amount.amount);
          }
          carrier.img = this.carriersMargins[g].img;
          carrier.shipment.push(this.rates[i]);
        }
      }
      carrier.prices_string = this.returnPriceRange(carrier.prices);
      if (carrier.carrier_id === this.carriersMargins[g].carrId) {
        this.carriersRatesList.push(carrier);
      }
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

  getRates() {
    const estData = JSON.parse(localStorage.getItem('estData'));
    const weight = JSON.parse(localStorage.getItem('weight'));

    if (this.form.status === 'VALID') {
      if (this.formFrom.value.email !== this.formFrom.value.repEmail) {
        this.toastService.show(
          'The email addresses do not match.',
          4000,
          'red'
        );
        return;
      }
      this.apiService.getCarriers().subscribe((carriers: any) => {
        for (let i = 0; carriers.length > i; i++) {
          if (estData.carrier_id === carriers[i].carrier_id) {
            this.margins.margin_p = carriers[i].margin_p;
            this.margins.margin_value = carriers[i].margin_value;
          }
        }

        let alcohol = '';
        let adult = '';
        if (this.form.value.alcohol === null) {
          alcohol = 'false';
        } else {
          alcohol = 'true';
        }

        if (this.form.value.alcohol === null) {
          adult = 'none';
        } else {
          adult = 'adult_signature';
        }
        const data = {
          shipment: {
            validate_address: 'validate_and_clean',
            ship_to: {
              name: this.form.value.nameTo,
              phone: this.form.value.phoneTo,
              company_name: this.form.value.compTo,
              address_line1: this.form.value.addTo,
              state_province: this.form.value.stateTo,
              postal_code: this.form.value.postalTo,
              city_locality: this.form.value.citiTo,
              country_code: 'US'
            },
            ship_from: {
              name: this.formFrom.value.nameFrom,
              phone: this.formFrom.value.phoneFrom,
              company_name: this.formFrom.value.compFrom,
              address_line1: this.formFrom.value.addFrom,
              city_locality: this.formFrom.value.citiFrom,
              state_province: this.formFrom.value.stateFrom,
              postal_code: this.formFrom.value.postalFrom,
              country_code: 'US'
            },
            packages: [
              {
                weight: {
                  value: weight.weight,
                  unit: weight.unit
                }
              }
            ]
          },
          rate_options: {
            carrier_ids: [estData.carrier_id]
          },
          service_code: estData.service_code,
          package_type: estData.package_type,
          confirmation: adult,
          advanced_options: {
            contains_alcohol: alcohol
          }
        };

        this.dataUser = data;
        this.apiService.getShipmentRate(data).subscribe((rates: any) => {
          console.log(rates);
          if (rates.error && rates.error !== null) {
            this.toastService.show(rates.message[0].message, 4000, 'red');
            return;
          }

          this.confirm = true;
          this.actualPrice = rates.shipping_amount.amount;
          setTimeout(() => {
            if (this.payPalInit) {
              this.payPal(this.actualPrice);
            }
            this.stripeInit(this.actualPrice);
          }, 100);

          this.confirmObj = rates;
          this.apiService.progressSubject.next(3);
          // localStorage.clear();
        });
      });
    } else {
      this.toastService.show('Fill all fields', 4000, 'red');
    }
  }

  carrierChoosed(carrId, index) {
    this.carriersQuery.toArray()[index].nativeElement.style.fontWeight = 'bold';
    this.choosedCarr.push(carrId);
  }

  chooseAddress(data) {
    this.choosedAddress = [];
    this.choosedAddress = data;
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

  payPal(price) {
    const that = this;

    paypal
      .Buttons({
        // Set up the transaction
        createOrder: function(data, actions) {
          that.loadPayPal = true;
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: price
                }
              }
            ]
          });
        },
        onError: function(err) {
          that.toastService.show('Error with payment processing', 4000, 'red');
          console.log(err);
          return;
        },
        onCancel: function(data) {
          console.log(data);
          that.toastService.show(
            'The transaction was interrupted',
            4000,
            'red'
          );
          return;
        },
        // Finalize the transaction
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            // Show a success message to the buyer
            const price = JSON.parse(localStorage.getItem('estData'));
            const dimensions = JSON.parse(localStorage.getItem('weight'));
            that.apiService
              .getLabel(that.confirmObj.rate_id)
              .subscribe((dataLabel: any) => {
                that.toastService.show('Payment Successfull', 4000, 'green');
                that.goBackBool = false;
                that.loadPayPal = false;
                if (dataLabel.error) {
                  alert(dataLabel.message);
                  return;
                }
                let alcohol = true;
                let signature = true;
                if (that.form.value.alcohol === null) {
                  alcohol = false;
                }
                if (that.form.value.signature === null) {
                  signature = false;
                }
                that.apiService.progressSubject.next(4);
                that.label = dataLabel;
                let email;
                if (localStorage.getItem('userEmail')) {
                  email = localStorage.getItem('userEmail');
                } else {
                  email = that.formFrom.value.email;
                }

                const shipData = {
                  shipFrom: {
                    fullName: that.formFrom.value.nameFrom,
                    phone: that.formFrom.value.phoneFrom,
                    company: that.formFrom.value.compFrom,
                    address: that.formFrom.value.addFrom,
                    zipCode: that.formFrom.value.postalFrom,
                    city: that.formFrom.value.citiFrom
                  },
                  shipTo: {
                    fullName: that.form.value.nameTo,
                    phone: that.form.value.phoneTo,
                    company: that.form.value.compTo,
                    address: that.form.value.addTo,
                    zipCode: that.form.value.postalTo,
                    city: that.form.value.citiTo
                  },
                  details: {
                    weight: dimensions.weight,
                    length: dimensions.dimensions.length,
                    width: dimensions.dimensions.width,
                    height: dimensions.dimensions.height,
                    unit: dimensions.dimensions.unit,
                    adultSignature: signature,
                    alcohol: alcohol
                  },
                  payment: {
                    paid_by: details.payer.email_address,
                    email: email,
                    method: 'PayPal',
                    label: that.label.label_download.href,
                    tracking: that.label.tracking_number,
                    carrier: that.label.carrier_id,
                    orderId: details.id,
                    price: price.shipping_amount.amount
                  }
                };
                console.log(shipData);
                that.apiService.postOrderSuccess(shipData).subscribe(data => {
                  console.log(data);
                });
              });
          });
        }
      })
      .render('#paypal-button-container');
    this.payPalInit = false;
  }

  clearStorage() {
    const userToken = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    localStorage.clear();
    localStorage.setItem('userToken', userToken),
      localStorage.setItem('userId', userId),
      localStorage.setItem('userEmail', userEmail);
  }

  stripeInit(price) {
    // Create an instance of Elements.
    const elements = this.stripe.elements();

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    // Create an instance of the card Element.
    const card = elements.create('card', { style: style });
    this.stripeCard = card;

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    card.addEventListener('change', function(event) {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
  }

  stripeSubmit() {
    // Handle form submission.
    this.loadStripe = true;
    const that = this;
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      that.stripe.createToken(that.stripeCard).then(function(result) {
        if (result.error) {
          // Inform the user if there was an error.
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          const price = JSON.parse(localStorage.getItem('estData'));
          const shipData = {
            payment: {
              emailUser: that.formFrom.value.email,
              method: 'Stripe',
              price: price.shipping_amount.amount
            },
            token: result.token.id
          };

          // Send the token to your server.
          that.apiService.stripePost(shipData).subscribe((res: any) => {
            if (res.success) {
              const dimensions = JSON.parse(localStorage.getItem('weight'));
              that.apiService
                .getLabel(that.confirmObj.rate_id)
                .subscribe((dataLabel: any) => {
                  console.log(res);
                  that.toastService.show('Payment Successfull', 4000, 'green');
                  that.loadStripe = false;
                  if (dataLabel.error) {
                    alert(dataLabel.message);
                    return;
                  }
                  that.goBackBool = false;
                  let alcohol = true;
                  let signature = true;
                  if (that.form.value.alcohol === null) {
                    alcohol = false;
                  }
                  if (that.form.value.signature === null) {
                    signature = false;
                  }
                  that.apiService.progressSubject.next(4);
                  that.label = dataLabel;
                  const shipDataDet = {
                    shipFrom: {
                      fullName: that.formFrom.value.nameFrom,
                      phone: that.formFrom.value.phoneFrom,
                      company: that.formFrom.value.compFrom,
                      address: that.formFrom.value.addFrom,
                      zipCode: that.formFrom.value.postalFrom,
                      city: that.formFrom.value.citiFrom
                    },
                    shipTo: {
                      fullName: that.form.value.nameTo,
                      phone: that.form.value.phoneTo,
                      company: that.form.value.compTo,
                      address: that.form.value.addTo,
                      zipCode: that.form.value.postalTo,
                      city: that.form.value.citiTo
                    },
                    details: {
                      weight: dimensions.weight,
                      length: dimensions.dimensions.length,
                      width: dimensions.dimensions.width,
                      height: dimensions.dimensions.height,
                      unit: dimensions.dimensions.unit,
                      adultSignature: signature,
                      alcohol: alcohol
                    },
                    payment: {
                      paid_by: that.formFrom.value.email,
                      email: that.formFrom.value.email,
                      method: 'Stripe',
                      label: that.label.label_download.href,
                      tracking: that.label.tracking_number,
                      carrier: that.label.carrier_id,
                      orderId: res.charge_id,
                      price: price.shipping_amount.amount
                    }
                  };
                  that.apiService
                    .postOrderSuccess(shipDataDet)
                    .subscribe(data => {
                      console.log(data);
                    });
                });
            }
          });
        }
      });
    });
  }

  // Submit the form with the token ID.
  stripeSuccess(token) {
    // Insert the token ID into the form so it gets submitted to the server
    const form = document.getElementById('payment-form');
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeToken');
    hiddenInput.setAttribute('value', token.id);
    form.appendChild(hiddenInput);

    // Submit the form
    // form.submit();
  }

  ngOnInit() {
    this.apiService.getCarriers().subscribe((data: any) => {
      this.carriersMargins = data;
      // this.getRates();
    });

    this.form = new FormGroup({
      nameTo: new FormControl(null, Validators.required),
      phoneTo: new FormControl(null, Validators.required),
      compTo: new FormControl(null),
      addTo: new FormControl(null, Validators.required),
      stateTo: new FormControl(null, Validators.required),
      postalTo: new FormControl(null, Validators.required),
      citiTo: new FormControl(null, Validators.required),
      alcohol: new FormControl(null),
      signature: new FormControl(null)
    });
    this.formFrom = new FormGroup({
      nameFrom: new FormControl(null, Validators.required),
      phoneFrom: new FormControl(null, Validators.required),
      compFrom: new FormControl(null),
      addFrom: new FormControl(null, Validators.required),
      stateFrom: new FormControl(null, Validators.required),
      postalFrom: new FormControl(null, Validators.required),
      citiFrom: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      repEmail: new FormControl(null, Validators.required)
    });
    this.apiService.getUserAddresses().subscribe((data: any) => {
      this.savedAddresses = data;
      this.choosedAddress = data[data.length - 1];
    });
    const addTo = JSON.parse(localStorage.getItem('addTo'));
    const addFrom = JSON.parse(localStorage.getItem('addFrom'));
    this.form.controls['addTo'].setValue(addTo.formatedAddress);
    this.form.controls['stateTo'].setValue(addTo.state);
    this.form.controls['postalTo'].setValue(addTo.postalCode);
    this.form.controls['citiTo'].setValue(addTo.locality);

    this.formFrom.controls['addFrom'].setValue(addFrom.formatedAddress);
    this.formFrom.controls['stateFrom'].setValue(addFrom.state);
    this.formFrom.controls['postalFrom'].setValue(addFrom.postalCode);
    this.formFrom.controls['citiFrom'].setValue(addFrom.locality);
    setTimeout(() => {
      this.labels.forEach(data => {
        data.nativeElement.classList.add('active');
      });
      const height = this.getHeight.nativeElement.clientHeight;
      this.setHeight.nativeElement.style.minHeight = `${height}px`;
      this.apiService.progressSubject.next(2);
    }, 100);

    if (localStorage.getItem('userToken')) {
      this.email = false;
    } else {
      this.email = true;
    }
  }
}
