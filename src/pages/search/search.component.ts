import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {ApiService} from '../../services/api.service';
import {Tome} from '../../services/models';
import {UnsubscribingComponent} from '../unsubscribing.component';

@Component({
    selector: 'page-search',
    templateUrl: './search.html'
})
export class SearchPage extends UnsubscribingComponent {
    author: string;
    desc: string;

    pdf: string;
    keywords: string;
    kind: string;
    fulltext: string;
    availableTypes: string[] = [];
    availableBooks: Tome[] = [];
    results: Tome[] = [];
    displays = 10;

    possibleIndices = [
        'ACCES AUX DOCUMENTS',
        'ACTES ADMINISTRATIFS',
        'ACTES REGLEMENTAIRES (RECOURS CONTRE LES)',
        'AGRICULTURE',
        'ARMES PROHIBEES',
        'AUTORISATION D\'ETABLISSEMENT',
        'COMMUNES',
        'ELECTIONS',
        'ENSEIGNEMENT',
        'ENTRAIDE JUDICIAIRE',
        'ETABLISSEMENTS CLASSES',
        'ETRANGERS',
        'EXPERTS',
        'EXPROPRIATION POUR CAUSE D\'UTILITE PUBLIQUE',
        'FINANCES PUBLIQUES',
        'FONCTION PUBLIQUE',
        'IMPOTS',
        'LANGUES',
        'LOGEMENT',
        'LOIS ET REGLEMENTS',
        'MARCHES PUBLICS',
        'NOMS ET PRENOMS',
        'POSTES ET TELECOMMUNICATIONS',
        'PRATIQUES COMMERCIALES',
        'PROCEDURE ADMINISTRATIVE NON CONTENTIEUSE',
        'PROCEDURE CONTENTIEUSE',
        'PROTECTION DES DONNEES',
        'RECOURS EN ANNULATION',
        'REGULATION ECONOMIQUE',
        'SANTE PUBLIQUE',
        'SECURITE SOCIALE',
        'SITES ET MONUMENTS',
        'TRANSPORTS',
        'TRAVAIL',
        'TUTELLE ADMINISTRATIVE',
        'URBANISME',
        'VOIRIE'
    ];

    constructor(public api: ApiService,
                public platform: Platform) {
        super(true, platform);
        this.api.getTomeTypes().then(availableTypes => this.availableTypes = availableTypes,
            this.api.presentErr.bind(this.api));
        this.kind = this.api.userInfo['cognito:groups'] && this.api.userInfo['cognito:groups'][0].replace(/_readers$/, '');
    }

    searchTome() {
        this.api.getAvailableBooks({
            kind: this.kind,
            author: this.author,
            fulltext: this.fulltext
        }).then(availableBooks => this.availableBooks = availableBooks,
            this.api.presentErr.bind(this.api));
    }

    onMenuSelect() {
        this.api.getPdf('bulletin', this.pdf.toLowerCase().replace(/'/g, '')
            .replace(/ /g, '_').replace(/\s*\(.*\)\s*/g, '')
            .replace(/_$/, ''), true);
    }

    doInfinite() {
        this.displays += 10;
    }

    invalidOption(type: string): boolean {
        return this.api.userInfo['cognito:groups'].indexOf(type === 'bulletin'? 'bulletin_readers' : 'recueil_readers') === -1;
    }

    clearify(excerpt: string) {
        return excerpt.replace(/\s[0-9]+\s*\.[^0-9]/g, match => match.substring(0, 1) + '<span style="background-color: yellowgreen">'
                + match.substring(1, match.length - 1) + '</span>' + match.substring(match.length - 1))
            .replace(/\*\*\*[^*]+\*\*\*/g,match => '<span style="background-color: wheat">' + match.replace(/\*\*\*/g, '') + '</span>');
    }
}
