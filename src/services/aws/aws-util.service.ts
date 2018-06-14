import {Injectable} from '@angular/core';
import {Callback, CognitoUtil} from './cognito.service';
import * as AWS from 'aws-sdk/global';
declare const AMA: any;

@Injectable()
export class AwsUtil {
    static firstLogin: boolean = false;
    static runningInit: boolean = false;

    constructor(public cognitoUtil: CognitoUtil) {}

    //This is the method that needs to be called in order to init the aws global creds
    initAwsService(callback: Callback, isLoggedIn: boolean, idToken: string) {
        if (AwsUtil.runningInit) {
            // Need to make sure I don't get into an infinite loop here, so need to exit if this method is running already
            console.log('AwsUtil: Aborting running initAwsService()...it\'s running already.');
            // instead of aborting here, it's best to put a timer
            if (callback != undefined) {
                callback.callback();
                callback.callbackWithParam(undefined);
            }
            return;
        }
        AwsUtil.runningInit = true;
        // First check if the user is authenticated already
        if (isLoggedIn)
            this.setupAWS(isLoggedIn, callback, idToken);
    }

    setupAWS(isLoggedIn: boolean, callback: Callback, idToken: string): void {
        if (isLoggedIn) {
            const env = this.cognitoUtil.api.CONFIG.aws;
            if (env.analyticsAppId) {
                const mobileAnalyticsClient = new AMA.Manager({
                    appId: env.analyticsAppId,
                    appTitle: env.analyticsAppTitle
                });
                mobileAnalyticsClient.submitEvents();
            }
            this.addCognitoCredentials(idToken);
        }
        if (callback != undefined) {
            callback.callback();
            callback.callbackWithParam(undefined);
        }
        AwsUtil.runningInit = false;
    }

    addCognitoCredentials(idTokenJwt: string): void {
        const creds = this.cognitoUtil.buildCognitoCreds(idTokenJwt);
        AWS.config.credentials = creds;
        creds.get(err => {
            if (!err) {
                if (AwsUtil.firstLogin) {
                    AwsUtil.firstLogin = false;
                }
            }
        });
    }
}
