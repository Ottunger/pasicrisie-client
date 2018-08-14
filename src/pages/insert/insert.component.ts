import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {ApiService} from '../../services/api.service';
import {UnsubscribingComponent} from '../unsubscribing.component';

@Component({
    selector: 'page-insert',
    templateUrl: './insert.html'
})
export class InsertPage extends UnsubscribingComponent {
    constructor(public api: ApiService,
                public platform: Platform) {
        super(true, platform);
    }
}
