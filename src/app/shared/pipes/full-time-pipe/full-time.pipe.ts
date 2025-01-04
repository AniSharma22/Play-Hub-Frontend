import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fullTimePipe',
})
export class FullTimePipe implements PipeTransform {
  transform(value: Date | string | null): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;

    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }) +" " + date.toLocaleTimeString().split(" ")[1];
  }
}
