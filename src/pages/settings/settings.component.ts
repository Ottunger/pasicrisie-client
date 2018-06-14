import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';
import {ApiService} from '../../services/api.service';

@Component({
    selector: 'page-settings',
    templateUrl: './settings.html'
})
export class SettingsPopover {
    constructor(public api: ApiService, public viewCtrl: ViewController) {}

    get lang() {
        return this.api.getLang();
    }

    set lang(value: string) {
        this.api.setLang(value);
    }

    close() {
        this.viewCtrl.dismiss();
    }
}
