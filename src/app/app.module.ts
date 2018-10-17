import {HttpClientModule} from '@angular/common/http';
import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {Device} from '@ionic-native/device';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {ProfilePage} from '../pages/profile/profile.component';
import {SearchPage} from '../pages/search/search.component';
import {InsertPage} from '../pages/insert/insert.component';
import {SettingsPopover} from '../pages/settings/settings.component';
import {SafeHtmlPipe} from '../pipes/safe-html.pipe';
import {TranslatePipe} from '../pipes/translate.pipe';
import {ApiService} from '../services/api.service';
import {MyApp} from './app.component';
import {AwsUtil} from '../services/aws/aws-util.service';
import {CognitoUtil} from '../services/aws/cognito.service';
import {UserLoginService} from '../services/aws/user-login.service';
import {UserParametersService} from '../services/aws/user-parameters.service';
import {UserRegistrationService} from '../services/aws/user-registration.service';

@NgModule({
    declarations: [
        TranslatePipe,
        SafeHtmlPipe,
        MyApp,
        ProfilePage,
        SearchPage,
        SettingsPopover,
        InsertPage
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        ProfilePage,
        SearchPage,
        SettingsPopover,
        InsertPage
    ],
    providers: [
        AwsUtil,
        ApiService,
        CognitoUtil,
        UserLoginService,
        UserParametersService,
        UserRegistrationService,
        StatusBar,
        SplashScreen,
        Device,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {}
