/// <reference types="@types/googlemaps" />
import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[google-places]'
})
export class GooglePlacesDirective {
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  private element: HTMLInputElement;
  that = this;
  postalCode;

  constructor(private elRef: ElementRef) {
    this.element = elRef.nativeElement;
  }

  getFormattedAddress(place) {
    // @params: place - Google Autocomplete place object
    // @returns: location_obj - An address object in human readable format
    const location_obj = {};
    const that = this;

    // tslint:disable-next-line:forin
    for (const i in place.address_components) {
      location_obj['postal_code'] = that.postalCode;
      const item = place.address_components[i];
      location_obj['formatted_address'] = place.formatted_address;
      if (item['types'].indexOf('locality') > -1) {
        location_obj['locality'] = item['long_name'];
      } else if (item['types'].indexOf('administrative_area_level_1') > -1) {
        location_obj['admin_area_l1'] = item['short_name'];
      } else if (item['types'].indexOf('street_number') > -1) {
        location_obj['street_number'] = item['short_name'];
      } else if (item['types'].indexOf('route') > -1) {
        location_obj['route'] = item['long_name'];
      } else if (item['types'].indexOf('country') > -1) {
        location_obj['country'] = item['short_name'];
      } else if (item['types'].indexOf('geometry') > -1) {
        location_obj['geometry'] = item['geometry'];
      }
    }
    return location_obj;
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    const autocomplete = new google.maps.places.Autocomplete(this.element);
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      // Emit the new address object for the updated place
      this.onSelect.emit(this.getFormattedAddress(autocomplete.getPlace()));
    });
  }
}
