import template from './game.component.html';
import { Component } from '../../utils/component';

import {parseUrl} from '../../utils/utils';
import {CardComponent} from './card/card.component';

const environment = {
    api: {
        host: 'http://localhost:8081'
    }
};

/* class GameComponent constructor */

// TODO create a class
export class GameComponent extends Component {

    constructor() {
        super('game');

        // gather parameters from URL
        const params = parseUrl(window.location.href);

        // save player name & game ize
        this._name = params.name;
        this._size = parseInt(params.size) || 9;
        this._flippedCard = null;
        this._matchedPairs = 0;
    }

    init() {
        // fetch the cards configuration from the server
        this.fetchConfig(config => {
            this._config = config;

            // create a card out of the config
            this._cards = []; // TODO use Array.map()
            for (let i in this._config.ids) {
                this._cards[i] = new CardComponent(this._config.ids[i]);
            }

            this._boardElement = document.querySelector('.cards');

            for (let i in this._cards) {    // TODO use Array.forEach()
                const card = this._cards[i];
                this._boardElement.appendChild(card.getElement());
                card.getElement().addEventListener('click', () => this._flipCard(card));
            }

            this.start();
        })
    }

    getTemplate() {
        return template;
    }

    start() {
        this._startTime = Date.now();
        let seconds = 0;
        document.querySelector('nav .navbar-title').textContent = `Player: ${this._name}. Elapsed time: ${seconds++}`;

        this._timer = setInterval(() => document.querySelector('nav .navbar-title').textContent = `Player: ${this._name}. Elapsed time: ${seconds++}`, 1000);
    }

    gotoScore() {
        const timeElapsedInSeconds = Math.floor((Date.now() - this._startTime) / 1000);
        clearInterval(this._timer);
        setTimeout(() => window.location.hash = `score?name=${this._name}&size=${this._size}'&time=${timeElapsedInSeconds}`, 750);
    }

    fetchConfig(cb) {
        const xhr = typeof XMLHttpRequest != 'undefined'
            ? new XMLHttpRequest()
            : new ActiveXObject('Microsoft.XMLHTTP');

        xhr.open('get', environment.api.host + '/board?size=' + this._size, true);
        xhr.onreadystatechange = () => {
            let status;
            let data;
            // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
            if (xhr.readyState == 4) { // `DONE`
                status = xhr.status;
                if (status == 200) {
                    data = JSON.parse(xhr.responseText);
                    cb(data);
                } else {
                    throw new Error(status)
                }
            }
        };
        xhr.send();
    }

    _flipCard(card) {
        if (this._busy) {
            return;
        }

        if (card.flipped) {
            return;
        }


        // flip the card
        card.flip();

        // if flipped first card of the pair
        if (!this._flippedCard) {
            // keep this card flipped, and wait for the second card of the pair
            this._flippedCard = card;
        } else {
            // second card of the pair flipped...

            // if cards are the same
            if (card.equals(this._flippedCard)) {
                this._flippedCard.matched = true;
                card.matched = true;
                this._matchedPairs += 1;

                // reset flipped card for the next turn.
                this._flippedCard = null;

                if (this._matchedPairs === this._size) {
                    this.gotoScore();
                }
            } else {
                this._busy = true;

                // cards did not match
                // wait a short amount of time before hiding both cards
                setTimeout(() => {
                    // hide the cards
                    this._flippedCard.flip();
                    card.flip();
                    this._busy = false;

                    // reset flipped card for the next turn.
                    this._flippedCard = null;
                }, 500);
            }
        }
    }

}

// put component in global scope, to be runnable right from the HTML. TODO remove in step XXX
window.GameComponent = GameComponent;
