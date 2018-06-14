import {Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {Nav, Platform} from 'ionic-angular';
import {ApiService} from '../services/api.service';
import {ProfilePage} from '../pages/profile/profile.component';
import {SearchPage} from '../pages/search/search.component';
import {InsertPage} from '../pages/insert/insert.component';

@Component({
    templateUrl: 'app.html',
    encapsulation: ViewEncapsulation.None
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any = ProfilePage;
    pages: {title: string, component: any}[];

    constructor(public platform: Platform, public statusBar: StatusBar,
                public splashScreen: SplashScreen, public api: ApiService) {
        this.initializeApp();

        this.pages = [
            {title: 'profile', component: ProfilePage},
            {title: 'search', component: SearchPage},
            {title: 'insert', component: InsertPage}
        ];
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.statusBar.overlaysWebView(false);
            this.splashScreen.hide();
            this.api.changeRoot$.subscribe((component: Component) => {
                this.nav.setRoot(component || ProfilePage);
            });
        });
    }

    openPage(page: {title: string, component: any}) {
        this.nav.setRoot(page.component);
    }
}
