import {HttpClient, HttpHeaders} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import * as AWS from 'aws-sdk/global';
import {Client} from 'elasticsearch';
import {AlertController} from 'ionic-angular';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/timeout';
import {Application} from './application.service';
import {ENVS, ES_SERVICE} from './configs';
import {AppConfig, BackendMessage, BackendMessagePolicy, Books, Tome} from './models';

@Injectable()
export class ApiService extends Application {
    private appVersion = '0.0.1';
    private mode: string;
    CONFIG: AppConfig;
    jwtToken: string;
    changeRoot$ = new EventEmitter();
    esClient: Client;

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

    constructor(private http: HttpClient,
                private alertCtrl: AlertController) {
        super();
        this.getStoredItem('env').then(mode => this.mode = mode || 'prod', () => this.mode = 'prod')
            .then(this.buildEnv.bind(this));
    }

    private buildEnv() {
        console.log(this.mode);
        this.CONFIG = ENVS.find(env => env.name === this.mode);
        this.esClient = new Client({
            host: this.CONFIG.api.servicesUris[ES_SERVICE],
            log: 'warning'
        });
        AWS.config.region = this.CONFIG.aws.region;
    }

    public setEnv(envName: string) {
        this.mode = envName;
        this.storeItem('env', envName);
        this.buildEnv();
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

    getAvailableBooks(): Promise<Books> {
        return this.esClient.mget<Tome>({
            index: 'books',
            source: ['id', 'name', 'yearBegin', 'yearEnd']
        }).then(res => ({
            books: {
                tomes: res.docs.map(doc => doc._source)
            }
        }));
    }
}
