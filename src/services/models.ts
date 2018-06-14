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
    identityPoolId: string;
    userPoolId: string;
    clientId: string;
    cognito_idp_endpoint: string;
    cognito_identity_endpoint: string;
    sts_endpoint: string;
    analyticsAppId: string;
    analyticsAppTitle: string;
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

export enum TomeType {
    RED = 'red',
    BLUE = 'blue'
}
export interface Tome {
    _id: string;
    type: TomeType;
    author: string;
    name: string;
    keywords: string[];
    date: string;
}
export interface TomeSearchOptions {
    type?: TomeType;
    dateMin?: string;
    dateMax?: string;
    author?: string;
    name?: string;
}

export interface Results<T> extends BackendMessage {
    result: T;
}
