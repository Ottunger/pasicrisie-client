import {AppConfig} from './models';

export const API_ENVS: any = {
    prod: {
        baseUri: 'https://8vln1owxz6.execute-api.eu-west-2.amazonaws.com/production/api/',
        servicesUris: {}
    }
};

export const AWS_ENVS: any = {
    prod: {
        production: true,
        region: 'eu-west-2',
        userPoolId: 'eu-west-2_I3zbY3Ita',
        clientId: '3b8q6picrd1p377bn1356nml6q',
        cognito_idp_endpoint: '',
        identityPoolId: '',
        cognito_identity_endpoint: '',
        sts_endpoint: '',
        analyticsAppId: '',
        analyticsAppTitle: '',
        s3: 'https://s3.eu-west-2.amazonaws.com/'
    }
};

export const ENVS: AppConfig[] = <any>Object.getOwnPropertyNames(AWS_ENVS).map(name => ({
    name: name,
    aws: AWS_ENVS[name],
    api: API_ENVS[name]
}));
