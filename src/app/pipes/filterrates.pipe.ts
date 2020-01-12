import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterrates',
  pure: false
})
export class FilterRatesPipe implements PipeTransform {
  transform(items: any[], filter: any): any {
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(
      item => item.carrier_id.indexOf(filter.carrier_id) !== -1
    );
  }
}
