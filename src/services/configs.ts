import {AppConfig} from './models';

export const API_ENVS: any = {
    prod: {
        baseUri: 'https://owr63owwn7.execute-api.eu-central-1.amazonaws.com/production/api/',
        servicesUris: {
            s3: 'https://s3.eu-central-1.amazonaws.com/'
        }
    }
};

export const AWS_ENVS: any = {
    prod: {
        production: true,
        region: 'eu-central-1',
        userPoolId: 'eu-central-1_TOi0ZoW4p',
        clientId: '16hg05s78cjuhiu1uqnu65910o',
        cognito_idp_endpoint: '',
        identityPoolId: 'eu-central-1:7df5d151-5bfa-4935-b012-4cf12dc7836c',
        cognito_identity_endpoint: '',
        sts_endpoint: '',
        analyticsAppId: '',
        analyticsAppTitle: ''
    }
};

export const ENVS: AppConfig[] = <any>Object.getOwnPropertyNames(AWS_ENVS).map(name => ({
    name: name,
    aws: AWS_ENVS[name],
    api: API_ENVS[name]
}));
