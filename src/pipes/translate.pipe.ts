import {Pipe, PipeTransform} from '@angular/core';
import {ApiService} from '../services/api.service';

@Pipe({name: 'translate', pure: false})
export class TranslatePipe implements PipeTransform {
    constructor(private api: ApiService) {}

    transform(value: string): string {
        return this.api.transform(value);
    }
}
