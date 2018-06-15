import {Component} from '@angular/core';
import {Platform, PopoverController} from 'ionic-angular';
import {ApiService} from '../../services/api.service';
import {Tome} from '../../services/models';
import {UnsubscribingComponent} from '../unsubscribing.component';

@Component({
    selector: 'page-search',
    templateUrl: './search.html'
})
export class SearchPage extends UnsubscribingComponent {
    author: string;
    name: string;
    keywords: string;
    type: string;
    availableTypes: string[] = [];
    availableBooks: Tome[] = [];
    results: Tome[] = [];
    displays = 10;

    constructor(public api: ApiService,
                public popCtrl: PopoverController,
                public platform: Platform) {
        super(true, popCtrl, platform);
        this.api.getTomeTypes().then(availableTypes => this.availableTypes = availableTypes,
            this.api.presentErr.bind(this.api));
    }

    searchTome() {
        this.api.getAvailableBooks({
            type: this.type,
            author: this.author,
            name: this.name,
            keywords: this.keywords
        }).then(availableBooks => this.availableBooks = availableBooks,
            this.api.presentErr.bind(this.api));
    }

    goTo(tome: Tome) {
        window.open(this.api.CONFIG.aws.s3 + 'pasicrisie-pdf/' + tome.type + '/' + tome._id + '.pdf', '_blank');
    }

    doInfinite() {
        this.displays += 10;
    }
}
