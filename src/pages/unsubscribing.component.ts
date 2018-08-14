import {Component, OnDestroy} from '@angular/core';
import {Platform} from 'ionic-angular';
import {Subscription} from 'rxjs/Subscription';

export abstract class UnsubscribingComponent implements OnDestroy {
    private subs: Subscription[] = [];
    private twice = false;
    private unRegisterer: Function;

    constructor(private doChange: boolean,
                public platform?: Platform) {}

    ngOnDestroy() {
        this.subs.forEach(sub => {
            sub.unsubscribe();
        });
    }

    addSub(sub: Subscription) {
        this.subs.push(sub);
    }

    ionViewDidEnter() {
        if(!this.doChange)
            return;
        this.unRegisterer = this.platform.registerBackButtonAction(() => {
            if(this.twice) {
                this.platform.exitApp();
            } else {
                this.twice = true;
                setTimeout(() => this.twice = false, 2000);
            }
        });
    }

    ionViewWillLeave() {
        if(!this.doChange)
            return;
        this.unRegisterer && this.unRegisterer();
    }

    createModal(cpt: Component, data: any = {}) {
        this.ionViewWillLeave();
        data.backRegisterer = data.backRegisterer || this.ionViewDidEnter.bind(this);
    }

    presentLangPopover($event: any) {
        // TODO: allow popup to change language
        // this.popCtrl.create(SettingsPopover).present({ev: $event});
    }
}
