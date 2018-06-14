import {Injectable} from '@angular/core';
import {Callback, CognitoUtil} from './cognito.service';
import {CognitoUserSession} from 'amazon-cognito-identity-js';

@Injectable()
export class UserParametersService {
    constructor(public cognitoUtil: CognitoUtil) {}

    getParameters(callback: Callback) {
        const cognitoUser = this.cognitoUtil.getCurrentUser();
        if (cognitoUser !== null) {
            cognitoUser.getSession((err: string, session: CognitoUserSession) => {
                if (err)
                    console.warn('UserParametersService: Couldn\'t retrieve the user');
                else {
                    cognitoUser.getUserAttributes((err2, result) => {
                        if (err) {
                            console.warn('UserParametersService: in getParameters: ' + err);
                        } else {
                            callback.callbackWithParam(result);
                        }
                    });
                }
            });
        } else {
            callback.callbackWithParam(undefined);
        }
    }
}
