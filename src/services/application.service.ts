import {en_strings} from '../i18n/en';
import {fr_strings} from '../i18n/fr';

export class Application {
    private translations: {[id: string]: {[id: string]: string}};
    private lang: string;

    constructor() {
        this.translations = {
            en: en_strings,
            fr: fr_strings
        };
        this.lang = 'fr';
        this.getStoredItem('lang').then(lang => this.lang = lang || 'fr', () => this.lang = 'fr');
    }

    getLang(): string {
        return this.lang;
    }

    setLang(lang: string) {
        this.lang = lang;
        this.storeItem('lang', lang);
    }

    // Translates
    transform(value: string): string {
        if (this.lang in this.translations) {
            return this.translations[this.lang][value] || value;
        } else {
            return value;
        }
    }

    storeItem(key: string, value: any) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
    }

    getStoredItem(key: string): Promise<any> {
        return Promise.resolve(JSON.parse(localStorage.getItem(key) || 'null'));
    }

    getStoredItems(keys: string[]): Promise<any[]> {
        return Promise.resolve(keys.map(key => JSON.parse(localStorage.getItem(key) || 'null')));
    }
}
