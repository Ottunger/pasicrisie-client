import {Injectable} from '@angular/core';
import {CognitoCallback, CognitoUtil, LoggedInCallback} from './cognito.service';
import {AuthenticationDetails, CognitoUser, CognitoUserSession} from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk/global';
import * as STS from 'aws-sdk/clients/sts';

@Injectable()
export class UserLoginService {
    static PASSWORD_CHANGE_REQUIRED = 'password_change_required';
    static MISSING_FIELDS = 'missing_fields';

    private onLoginSuccess = (callback: CognitoCallback, session: CognitoUserSession) => {
        this.cognitoUtil.api.setJwtToken(session.getIdToken().getJwtToken());
        AWS.config.credentials = this.cognitoUtil.buildCognitoCreds(this.cognitoUtil.api.getJwtToken);

        // So, when CognitoIdentity authenticates a user, it doesn't actually hand us the IdentityID,
        // used by many of our other handlers. This is handled by some sly underhanded calls to AWS Cognito
        // API's by the SDK itself, automatically when the first AWS SDK request is made that requires our
        // security credentials. The identity is then injected directly into the credentials object.
        // If the first SDK call we make wants to use our IdentityID, we have a
        // chicken and egg problem on our hands. We resolve this problem by "priming" the AWS SDK by calling a
        // very innocuous API call that forces this behavior.
        const clientParams: any = {};
        const env = this.cognitoUtil.api.CONFIG.aws;
        if (env) {
            clientParams.endpoint = env.sts_endpoint;
        }
        if(/Safari/.test(navigator.userAgent)) {
            if(callback) callback.cognitoCallback(undefined, session);
        } else {
            const sts = new STS(clientParams);
            sts.getCallerIdentity((err: any, data: any) => callback && callback.cognitoCallback(undefined, session));
        }
    }

    private onLoginError = (callback: CognitoCallback, err: any) => {
        callback.cognitoCallback(err.message, undefined);
    }

    constructor(public cognitoUtil: CognitoUtil) {}

    authenticate(username: string, password: string, callback: CognitoCallback) {
        const authenticationData = {
            Username: username,
            Password: password
        };
        const authenticationDetails = new AuthenticationDetails(authenticationData);
        const userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };

        const cognitoUser = new CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            newPasswordRequired: (userAttributes, requiredAttributes) =>
                callback.cognitoCallback(UserLoginService.PASSWORD_CHANGE_REQUIRED, undefined),
            onSuccess: result => this.onLoginSuccess(callback, result),
            onFailure: err => this.onLoginError(callback, err),
            mfaRequired: (challengeName, challengeParameters) => {
                callback.handleMFAStep(challengeName, challengeParameters, (confirmationCode: string) => {
                    cognitoUser.sendMFACode(confirmationCode, {
                        onSuccess: result => this.onLoginSuccess(callback, result),
                        onFailure: err => this.onLoginError(callback, err)
                    }, undefined);
                });
            }
        });
    }

    forgotPassword(username: string, callback: CognitoCallback) {
        const userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.forgotPassword({
            onSuccess: () => undefined,
            onFailure: err => callback.cognitoCallback(err.message, undefined),
            inputVerificationCode: () => callback.cognitoCallback(undefined, undefined)
        });
    }

    confirmNewPassword(email: string, verificationCode: string, password: string, callback: CognitoCallback) {
        const userData = {
            Username: email,
            Pool: this.cognitoUtil.getUserPool()
        };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.confirmPassword(verificationCode, password, {
            onSuccess: callback.cognitoCallback.bind(callback),
            onFailure: err => callback.cognitoCallback(err.message, undefined)
        });
    }

    isAuthenticated(callback: LoggedInCallback) {
        if (callback === undefined)
            throw('UserLoginService: Callback in isAuthenticated() cannot be undefined');
        const cognitoUser = this.cognitoUtil.getCurrentUser();
        if (cognitoUser !== null) {
            cognitoUser.getSession((err: string, session: CognitoUserSession) => {
                if (err) {
                    callback.isLoggedIn(err, false);
                } else {
                    if(session.isValid()) {
                        this.onLoginSuccess(undefined, session);
                    }
                    callback.isLoggedIn(err, session.isValid());
                }
            });
        } else {
            callback.isLoggedIn('Can\'t retrieve the CurrentUser', false);
        }
    }
}
