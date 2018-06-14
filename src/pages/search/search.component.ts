import {Component} from '@angular/core';
import {Platform, PopoverController, ToastController} from 'ionic-angular';
import {ApiService} from '../../services/api.service';
import {UnsubscribingComponent} from '../unsubscribing.component';

@Component({
    selector: 'page-search',
    templateUrl: './search.html'
})
export class SearchPage extends UnsubscribingComponent {
    query: string;
    tome: string;
    ab: Books = {
        books: {
            tomes: []
        }
    };
    results: Books = {
        books: {
            tomes: []
        }
    };

    displays = [10, 10, 10];

    constructor(public api: ApiService,
                public popCtrl: PopoverController,
                public platform: Platform,
                private toastCtrl: ToastController) {
        super(true, popCtrl, platform);

        this.api.getAvailableBooks({}).then(ab => this.ab = ab, err => {
            this.toastCtrl.create({
                message: this.api.transform(err),
                duration: 4000,
                position: 'bottom'
            }).present();
        });
    }

    searchTome() {

    }

    goTo(tomeId: string) {

    }

    doInfinite(i: number) {
        this.displays[i] += 10;
    }
}
