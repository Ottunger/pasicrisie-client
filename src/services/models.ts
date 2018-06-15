export interface AppConfig {
    name: string;
    aws: AWSEnvironment;
    api: ApiConfig;
}

export interface ApiConfig {
    baseUri: string;
    servicesUris: {[id: string]: string};
}

export interface AWSEnvironment {
    production: boolean;
    region: string;
    userPoolId: string;
    clientId: string;
    cognito_idp_endpoint: string;
    identityPoolId: string;
    cognito_identity_endpoint: string;
    sts_endpoint: string;
    analyticsAppId: string;
    analyticsAppTitle: string;
    s3: string;
}

export enum BackendMessagePolicy {
    DAY = 'day',
    IMMEDIATE = 'immediate'
}
export interface BackendMessage {
    targetAppVesion?: string;
    messages?: {
        titleKey: string,
        messageKey: string,
        policy?: BackendMessagePolicy
    }[];
}

export interface AWSUser {
    name: string;
    email: string;
    phone_number: string;
    address: string;
    birthdate: string;
    family_name: string;
    gender: string;
    password: string;
    // Own stuff
    loggedIn?: boolean;
}

export interface AWSPasswordCommand {
    username: string;
    existingPassword: string;
    password: string;
}

export interface Tome {
    _id: string;
    type: string;
    author: string;
    name: string;
    keywords: string[];
    date: string;
}
export interface TomeSearchOptions {
    type: string;
    dateMin?: string;
    dateMax?: string;
    author?: string;
    name?: string;
    keywords?: string;
    fulltext?: string;
}

export interface Results<T> extends BackendMessage {
    result: T;
}
