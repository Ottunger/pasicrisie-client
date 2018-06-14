import {Component} from '@angular/core';
import {Platform, PopoverController, ToastController} from 'ionic-angular';
import {ApiService} from '../../services/api.service';
import {UnsubscribingComponent} from '../unsubscribing.component';

@Component({
    selector: 'page-insert',
    templateUrl: './insert.html'
})
export class InsertPage extends UnsubscribingComponent {
    constructor(public api: ApiService,
                public popCtrl: PopoverController,
                public platform: Platform,
                private toastCtrl: ToastController) {
        super(true, popCtrl, platform);
    }
}
