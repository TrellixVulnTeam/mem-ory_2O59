import template from './game.component.html';
import { Component } from '../../utils/component';

export class GameComponent extends Component {

    constructor() {
        super('game');
        // ...
    }

    getTemplate() { return template; }

    gotoScore() {
        const timeElapsedInSeconds = Math.floor((Date.now() - this._startTime) / 1000);

        setTimeout(() => window.location = `../score/score.component.html?name=${this._name}&size=${this._size}'&time=${timeElapsedInSeconds}`, 750);
    }
}
