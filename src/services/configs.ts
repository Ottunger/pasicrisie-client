import {AppConfig} from './models';

export const ES_SERVICE = 'ES';

export const API_ENVS: any = {
    prod: {
        baseUri: 'https://www.amazonaws.com/yyy',
        servicesUris: {
            ES: 'https://www.amazones.com'
        }
    }
};

export const AWS_ENVS: any = {
    prod: {
        production: true,
        region: 'eu-central-1',
        identityPoolId: 'eu-central-1:b2f2bdcf-72a7-4a4d-842a-e414c4491114',
        userPoolId: 'eu-central-1_esSk6WFax',
        clientId: '271ercj66ulkdmt9llmqmcd8rc',
        cognito_idp_endpoint: '',
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
