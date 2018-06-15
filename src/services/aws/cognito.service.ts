import {Injectable} from '@angular/core';
import {CognitoUserPool, CognitoUserSession} from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk/global';
import * as awsservice from 'aws-sdk/lib/service';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
import {ApiService} from '../api.service';

export interface CognitoCallback {
    cognitoCallback(message: string, result: any): void;
    handleMFAStep?(challengeName: string, challengeParameters: ChallengeParameters, callback: (confirmationCode: string) => any): void;
}

export interface LoggedInCallback {
    isLoggedIn(message: string, loggedIn: boolean): void;
}

export interface ChallengeParameters {
    CODE_DELIVERY_DELIVERY_MEDIUM: string;
    CODE_DELIVERY_DESTINATION: string;
}

export interface Callback {
    callback(): void;
    callbackWithParam(result: any): void;
}

@Injectable()
export class CognitoUtil {
    _POOL_DATA: any = {};

    constructor(public api: ApiService) {}

    cognitoCreds: AWS.CognitoIdentityCredentials;

    logout() {
        const user = this.getCurrentUser();
        if(user) user.signOut();
    }

    getUserPool() {
        this._POOL_DATA.UserPoolId = this.api.CONFIG.aws.userPoolId;
        this._POOL_DATA.ClientId = this.api.CONFIG.aws.clientId;
        if (this.api.CONFIG.aws.cognito_idp_endpoint) {
            this._POOL_DATA.endpoint = this.api.CONFIG.aws.cognito_idp_endpoint;
        }
        return new CognitoUserPool(this._POOL_DATA);
    }

    getCurrentUser() {
        return this.getUserPool().getCurrentUser();
    }

    // AWS Stores Credentials in many ways, and with TypeScript this means that
    // getting the base credentials we authenticated with from the AWS globals gets really murky,
    // having to get around both class extension and unions. Therefore, we're going to give
    // developers direct access to the raw, unadulterated CognitoIdentityCredentials
    // object at all times.
    setCognitoCreds(creds: AWS.CognitoIdentityCredentials) {
        this.cognitoCreds = creds;
    }

    getCognitoCreds() {
        return this.cognitoCreds;
    }

    // This method takes in a raw jwtToken and uses the global AWS config options to build a
    // CognitoIdentityCredentials object and store it for us. It also returns the object to the caller
    // to avoid unnecessary calls to setCognitoCreds.
    buildCognitoCreds(idTokenJwt: string) {
        let url = 'cognito-idp.' + this.api.CONFIG.aws.region + '.amazonaws.com/' + this.api.CONFIG.aws.userPoolId;
        if (this.api.CONFIG.aws.cognito_idp_endpoint) {
            url = this.api.CONFIG.aws.cognito_idp_endpoint + '/' + this.api.CONFIG.aws.userPoolId;
        }
        const logins: CognitoIdentity.LoginsMap = {};
        logins[url] = idTokenJwt;
        const params = {
            IdentityPoolId: this.api.CONFIG.aws.identityPoolId, /* required */
            Logins: logins
        };
        const serviceConfigs = <awsservice.ServiceConfigurationOptions>{};
        if (this.api.CONFIG.aws.cognito_identity_endpoint) {
            serviceConfigs.endpoint = this.api.CONFIG.aws.cognito_identity_endpoint;
        }
        const creds = new AWS.CognitoIdentityCredentials(params, serviceConfigs);
        this.setCognitoCreds(creds);
        return creds;
    }

    getCognitoIdentity(): string {
        return this.cognitoCreds.identityId;
    }

    getAccessToken(callback: Callback): void {
        if (callback === undefined) {
            throw('CognitoUtil: callback in getAccessToken is undefined...returning');
        }
        const cognitoUser = this.getCurrentUser();
        if (cognitoUser !== null) {
            cognitoUser.getSession((err: string, session: CognitoUserSession) => {
                if (err) {
                    console.log('CognitoUtil: Can\'t set the credentials:' + err);
                    callback.callbackWithParam(undefined);
                } else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getAccessToken().getJwtToken());
                    }
                }
            });
        } else {
            callback.callbackWithParam(undefined);
        }
    }

    getIdToken(callback: Callback): void {
        if (callback === undefined) {
            throw('CognitoUtil: callback in getIdToken is undefined...returning');
        }
        const cognitoUser = this.getCurrentUser();
        if (cognitoUser !== null)
            cognitoUser.getSession((err: string, session: CognitoUserSession) => {
                if (err) {
                    console.log('CognitoUtil: Can\'t set the credentials:' + err);
                    callback.callbackWithParam(undefined);
                } else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getIdToken().getJwtToken());
                    } else {
                        console.log('CognitoUtil: Got the id token, but the session isn\'t valid');
                    }
                }
            });
        else
            callback.callbackWithParam(undefined);
    }

    getRefreshToken(callback: Callback): void {
        if (callback === undefined) {
            throw('CognitoUtil: callback in getRefreshToken is undefined...returning');
        }
        const cognitoUser = this.getCurrentUser();
        if (cognitoUser !== null)
            cognitoUser.getSession((err: string, session: CognitoUserSession) => {
                if (err) {
                    console.log('CognitoUtil: Can\'t set the credentials:' + err);
                    callback.callbackWithParam(undefined);
                } else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getRefreshToken());
                    }
                }
            });
        else
            callback.callbackWithParam(undefined);
    }

    refresh(): void {
        this.getCurrentUser().getSession((err: string, session: CognitoUserSession) => {
            if (err) {
                console.log('CognitoUtil: Can\'t set the credentials:' + err);
            } else {
                if (session.isValid()) {
                    console.log('CognitoUtil: refreshed successfully');
                } else {
                    console.log('CognitoUtil: refreshed but session is still not valid');
                }
            }
        });
    }
}
