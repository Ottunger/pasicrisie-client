import {Component} from '@angular/core';
import {AlertController, Platform, PopoverController, ToastController} from 'ionic-angular';
import {SearchPage} from '../search/search.component';
import {ApiService} from '../../services/api.service';
import {UnsubscribingComponent} from '../unsubscribing.component';
import {UserLoginService} from '../../services/aws/user-login.service';
import {ChallengeParameters} from '../../services/aws/cognito.service';
import {UserRegistrationService} from '../../services/aws/user-registration.service';

@Component({
    selector: 'page-profile',
    templateUrl: './profile.html'
})
export class ProfilePage extends UnsubscribingComponent {
    username: string;
    password: string;
    password2: string;
    code: string;

    phone: string;
    name: string;
    address: string;
    birthdate: string;
    family_name: string;
    gender: string;

    loggedIn = false;
    mfaStep = false;
    mfaData = {
        destination: '',
        callback: (): void => undefined
    };
    pwdStep = false;
    pwdData = {
        callback: (): void => undefined
    };
    changeStep = false;
    changeData = {
        callback: (): void => undefined
    };
    signUpStep = false;

    constructor(public api: ApiService,
                public loginService: UserLoginService,
                public registrationService: UserRegistrationService,
                public popCtrl: PopoverController,
                public platform: Platform,
                private alertCtrl: AlertController,
                private toastCtrl: ToastController) {
        super(true, popCtrl, platform);

        this.loginService.isAuthenticated(this);
    }

    fillDetails() {
        this.alertCtrl.create({
            title: this.api.transform('login.fillDetails'),
            message: this.api.transform('login.fillDetailsLong'),
            inputs: [{
                name: 'name',
                type: 'string',
                placeholder: this.api.transform('login.name'),
                value: this.name
            }, {
                name: 'family_name',
                type: 'string',
                placeholder: this.api.transform('login.family_name'),
                value: this.family_name
            }, {
                name: 'address',
                type: 'string',
                placeholder: this.api.transform('login.address'),
                value: this.address
            }, {
                name: 'birthdate',
                type: 'string',
                placeholder: this.api.transform('login.birthdate'),
                value: this.birthdate
            }, {
                name: 'gender',
                type: 'string',
                placeholder: this.api.transform('login.gender'),
                value: this.gender
            }],
            buttons: [{
                text: this.api.transform('cancel'),
                role: 'cancel'
            }, {
                text: this.api.transform('done'),
                handler: data => Object.getOwnPropertyNames(data).forEach(key => (<any>this)[key] = data[key])
            }]
        }).present();
    }

    login() {
        this.loginService.authenticate(this.username, this.password, this);
    }

    isLoggedIn(message: string, loggedIn: boolean) {
        this.loggedIn = loggedIn;
        if(loggedIn && location.search.indexOf('=') > -1) {
            const tome = decodeURIComponent(location.search.split('=')[1]).split('/');
            this.api.getPdf({
                _id: tome[1],
                kind: tome[0],
                author: undefined,
                desc: undefined,
                keywords: undefined,
                issue: undefined
            }, false);
        }
    }

    cognitoCallback(message: string, result: any) {
        if (message) {
            if(message === UserLoginService.PASSWORD_CHANGE_REQUIRED) {
                this.changeStep = true;
                this.changeData.callback = () => {
                    this.registrationService.newPassword({
                        username: this.username,
                        existingPassword: this.password,
                        password: this.password2
                    }, this);
                };
            } else if(message === UserLoginService.MISSING_FIELDS) {
                const map: any = {};
                result.forEach((field: string) => {
                    let value = '';
                    switch(field) {
                        case 'address':
                            value = this.address;
                            break;
                        case 'birthdate':
                            value = this.birthdate;
                            break;
                        case 'family_name':
                            value = this.family_name;
                            break;
                        case 'gender':
                            value = this.gender;
                            break;
                        case 'name':
                            value = this.name;
                            break;
                        case 'phone_number':
                        default:
                            value = this.phone;
                            break;
                    }
                    map[field] = value;
                });
                return map;
            } else {
                this.toastCtrl.create({
                    message: this.api.transform(message),
                    duration: 4000,
                    position: 'bottom'
                }).present();
            }
        } else {
            this.leaveToSearch();
        }
    }

    signUp() {
        this.signUpStep = true;
    }

    create() {
        if (this.password !== this.password2) {
            this.toastCtrl.create({
                message: this.api.transform('login.passMiss'),
                duration: 4000,
                position: 'bottom'
            }).present();
            return;
        }
        this.registrationService.register({
            name: this.name,
            email: this.username,
            password: this.password,
            phone_number: this.phone,
            address: this.address,
            gender: this.gender,
            birthdate: this.birthdate,
            family_name: this.family_name
        }, {
            cognitoCallback: (message, result) => {
                if (message) {
                    this.toastCtrl.create({
                        message: this.api.transform(message),
                        duration: 4000,
                        position: 'bottom'
                    }).present();
                } else {
                    this.mfaStep = true;
                    this.mfaData.destination = this.phone;
                    this.mfaData.callback = () => {
                        this.registrationService.confirmRegistration(this.username, this.code, {
                            cognitoCallback: (message2, result2) => {
                                if (message2) {
                                    this.toastCtrl.create({
                                        message: this.api.transform(message2),
                                        duration: 4000,
                                        position: 'bottom'
                                    }).present();
                                } else {
                                    this.leaveToSearch();
                                }
                            }
                        });
                    };
                }
            }
        });
    }

    handleMFAStep(challengeName: string, challengeParameters: ChallengeParameters, callback: (confirmationCode: string) => any) {
        this.mfaStep = true;
        this.mfaData.destination = challengeParameters.CODE_DELIVERY_DESTINATION;
        this.mfaData.callback = () => {
            callback(this.code);
        };
    }

    resendCode() {
        this.registrationService.resendCode(this.username, {
            cognitoCallback: (message, result) => {
                if (message) {
                    this.toastCtrl.create({
                        message: this.api.transform(message),
                        duration: 4000,
                        position: 'bottom'
                    }).present();
                }
            }
        });
    }

    forgot1() {
        this.loginService.forgotPassword(this.username, {
            cognitoCallback: (message, result) => {
                if (message) {
                    this.toastCtrl.create({
                        message: this.api.transform(message),
                        duration: 4000,
                        position: 'bottom'
                    }).present();
                } else {
                    this.pwdStep = true;
                    this.pwdData.callback = () => {
                        if (this.password !== this.password2) {
                            this.toastCtrl.create({
                                message: this.api.transform('login.passMiss'),
                                duration: 4000,
                                position: 'bottom'
                            }).present();
                            return;
                        }
                        this.loginService.confirmNewPassword(this.username, this.code, this.password, {
                            cognitoCallback: (message2, result2) => {
                                if(message2) {
                                    this.toastCtrl.create({
                                        message: this.api.transform(message),
                                        duration: 4000,
                                        position: 'bottom'
                                    }).present();
                                } else {
                                    this.pwdStep = false;
                                }
                            }
                        });
                    };
                }
            }
        });
    }

    cancel(): boolean {
        this.mfaStep = false;
        this.pwdStep = false;
        this.changeStep = false;
        this.signUpStep = false;
        return false;
    }

    private leaveToSearch() {
        this.api.info().then(() => {
            if(location.search.indexOf('=') > -1) {
                const tome = decodeURIComponent(location.search.split('=')[1]).split('/');
                this.api.getPdf({
                    _id: tome[1],
                    kind: tome[0],
                    author: undefined,
                    desc: undefined,
                    keywords: undefined,
                    issue: undefined
                }, false);
            } else {
                this.api.changeRoot$.emit(SearchPage);
            }
        }, () => this.loginService.cognitoUtil.logout());
    }
}
