import {HttpClient, HttpHeaders} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import * as AWS from 'aws-sdk';
import {AlertController, ToastController} from 'ionic-angular';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/timeout';
import {Application} from './application.service';
import {ENVS} from './configs';
import {AppConfig, AWSUser, BackendMessage, BackendMessagePolicy, Results, Tome, TomeSearchOptions} from './models';

@Injectable()
export class ApiService extends Application {
    private appVersion = '0.0.1';
    private mode: string;
    CONFIG: AppConfig;
    private jwtToken: string;
    userInfo: AWSUser;
    changeRoot$ = new EventEmitter();

    // Used for authentication towards the API server
    private get httpOptions() {
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: this.jwtToken
            })
        };
    }

    get getJwtToken() {
        return this.jwtToken;
    }

    constructor(private http: HttpClient,
                private alertCtrl: AlertController,
                private toastCtrl: ToastController) {
        super();
        this.getStoredItem('env').then(mode => this.mode = mode || 'prod', () => this.mode = 'prod')
            .then(this.buildEnv.bind(this));
        this.getStoredItem('token').then(token => this.jwtToken = token, () => undefined);
    }

    private buildEnv() {
        this.CONFIG = ENVS.find(env => env.name === this.mode);
        AWS.config.update({
            region: this.CONFIG.aws.region,
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: this.CONFIG.aws.identityPoolId
            })
        });
    }

    setEnv(envName: string) {
        this.mode = envName;
        this.storeItem('env', envName);
        this.buildEnv();
    }

    setJwtToken(token: string) {
        this.jwtToken = token;
        this.storeItem('token', token);
    }

    presentErr(err: string) {
        this.toastCtrl.create({
            message: this.transform(err),
            duration: 4000,
            position: 'bottom'
        }).present();
    }

    private processMessages(msgs: BackendMessage) {
        if(msgs.targetAppVesion
                && msgs.targetAppVesion.split('.')[0].localeCompare(this.appVersion.split('.')[0]) > 0) {
            window.location.reload(true);
            return;
        }
        if(msgs && msgs.messages)
            msgs.messages.forEach(msg => {
                if(msg.policy && msg.policy !== BackendMessagePolicy.IMMEDIATE) {
                    let lastRun = 0;
                    this.getStoredItem(msg.titleKey).then(lr => lastRun = lr, () => undefined).then(() => {
                        switch (msg.policy) {
                            case BackendMessagePolicy.DAY:
                                if (lastRun && new Date().toDateString() === new Date(lastRun).toDateString())
                                    return;
                                this.storeItem(msg.titleKey, new Date().getTime());
                                break;
                            default:
                                break;
                        }
                    });
                }
                this.alertCtrl.create({
                    title: this.transform(msg.titleKey),
                    message: this.transform(msg.messageKey),
                    buttons: [{
                        text: this.transform('done'),
                        role: 'cancel'
                    }]
                }).present();
            });
    }

    info(): Promise<AWSUser> {
        return new Promise((resolve, reject) => {
            this.http.get<Results<AWSUser>>(this.CONFIG.api.baseUri + 'me', this.httpOptions)
                    .timeout(20000).take(1).subscribe((res: Results<AWSUser>) => {
                this.processMessages(res);
                this.userInfo = res.result;
                resolve(res.result);
            }, reject.bind(undefined, 'external.down'));
        });
    }

    getTomeTypes(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.http.get<Results<string[]>>(this.CONFIG.api.baseUri + 'find-types', this.httpOptions)
                    .timeout(20000).take(1).subscribe((res: Results<string[]>) => {
                this.processMessages(res);
                resolve(res.result);
            }, reject.bind(undefined, 'search.noBooks'));
        });
    }

    getAvailableBooks(opts: TomeSearchOptions): Promise<Tome[]> {
        return new Promise((resolve, reject) => {
            this.http.get<Results<Tome[]>>(this.CONFIG.api.baseUri + 'find-books?dateMin=' + (opts.dateMin || '') + '&dateMax='
                + (opts.dateMax || '') + '&author=' + (opts.author || '') + '&desc=' + (opts.desc || '') + '&keywords='
                + (opts.keywords || '') + '&fulltext=' + (opts.fulltext || '') + '&kind=' + opts.kind,
                this.httpOptions)
                    .timeout(20000).take(1).subscribe((res: Results<Tome[]>) => {
                this.processMessages(res);
                resolve(res.result);
            }, reject.bind(undefined, 'search.noBooks'));
        });
    }

    getPdf(tome: Tome, blank: boolean) {
        const s3 = new AWS.S3();
        const newWindow: any = window.open('/', blank? '_blank' : '_self', undefined, true);
        s3.getObject({
            Bucket: 'pasicrisie-pdf',
            Key: tome.kind + '/' + tome._id + '.pdf'
        }, (err, data) => {
            if(err) {
                console.warn(err);
                this.presentErr('search.noItem');
                return;
            }
            newWindow.location = URL.createObjectURL(new Blob([data.Body], {type: 'application/pdf'}));
        });
    }
}
