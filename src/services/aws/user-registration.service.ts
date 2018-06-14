import {Injectable} from '@angular/core';
import {CognitoCallback, CognitoUtil} from './cognito.service';
import {AuthenticationDetails, CognitoUser, CognitoUserAttribute} from 'amazon-cognito-identity-js';
import {AWSPasswordCommand, AWSUser} from '../models';
import {UserLoginService} from './user-login.service';

@Injectable()
export class UserRegistrationService {
    constructor(public cognitoUtil: CognitoUtil) {}

    register(user: AWSUser, callback: CognitoCallback): void {
        this.cognitoUtil.getUserPool().signUp(user.email, user.password, [
            new CognitoUserAttribute({
                Name: 'email',
                Value: user.email
            }),
            new CognitoUserAttribute({
                Name: 'name',
                Value: user.name
            }),
            new CognitoUserAttribute({
                Name: 'phone_number',
                Value: user.phone_number
            }),
            new CognitoUserAttribute({
                Name: 'family_name',
                Value: user.family_name
            }),
            new CognitoUserAttribute({
                Name: 'gender',
                Value: user.gender
            }),
            new CognitoUserAttribute({
                Name: 'birthdate',
                Value: user.birthdate
            })
        ], undefined, (err, result) => {
            if (err) {
                callback.cognitoCallback(err.message, undefined);
            } else {
                callback.cognitoCallback(undefined, result);
            }
        });
    }

    confirmRegistration(username: string, confirmationCode: string, callback: CognitoCallback): void {
        const userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
            if (err) {
                callback.cognitoCallback(err.message, undefined);
            } else {
                callback.cognitoCallback(undefined, result);
            }
        });
    }

    resendCode(username: string, callback: CognitoCallback): void {
        const userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.resendConfirmationCode((err, result) => {
            if (err) {
                callback.cognitoCallback(err.message, undefined);
            } else {
                callback.cognitoCallback(undefined, result);
            }
        });
    }

    newPassword(newPasswordUser: AWSPasswordCommand, callback: CognitoCallback): void {
        const authenticationData = {
            Username: newPasswordUser.username,
            Password: newPasswordUser.existingPassword
        };
        const authenticationDetails = new AuthenticationDetails(authenticationData);
        const userData = {
            Username: newPasswordUser.username,
            Pool: this.cognitoUtil.getUserPool()
        };

        const cognitoUser = new CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                // User was signed up by an admin and must provide new
                // password and required attributes, if any, to complete
                // authentication.

                if(requiredAttributes.length) {
                    requiredAttributes = callback.cognitoCallback(UserLoginService.MISSING_FIELDS, requiredAttributes);
                }
                // the api doesn't accept this field back
                delete userAttributes.email_verified;
                cognitoUser.completeNewPasswordChallenge(newPasswordUser.password, requiredAttributes, {
                    onSuccess: result => callback.cognitoCallback(undefined, userAttributes),
                    onFailure: err => callback.cognitoCallback(err, undefined)
                });
            },
            onSuccess: result => callback.cognitoCallback(undefined, result),
            onFailure: err => callback.cognitoCallback(err, undefined)
        });
    }
}
