// TODO Step 6 import { parseUrl } from '../../utils/utils.js';
// TODO Step 7 import { Component } from "../../utils/component";
// TODO Step 7 import template from "./game.component.html"

(function () {
  // TODO Step 6 remove this closure
  var environment = {
    api: {
      host: "http://localhost:8081",
    },
  };

  // TODO Step 3.1 create a class
  /* class GameComponent constructor */
  function GameComponent() {
    // gather parameters from URL
    var params = parseUrl();

    // save player name & game ize
    this._name = params.name;
    this._size = parseInt(params.size) || 9;
    this._flippedCard = null;
    this._matchedPairs = 0;
  }

  /* method GameComponent.init */
  GameComponent.prototype.init = function init() {
    // fetch the cards configuration from the server
    this.fetchConfig(
      function (config) {
        // TODO Step 3.2: use arrow function
        this._config = config;

        // create a card out of the config
        this._cards = []; // TODO Step 3.3: use Array.map()
        for (var i in this._config.ids) {
          this._cards[i] = new CardComponent(this._config.ids[i]);
        }

        this._boardElement = document.querySelector(".cards");

        for (var i in this._cards) {
          // TODO Step 3.3: use Array.forEach()
          (function () {
            // TODO Step 3.2: use arrow function
            var card = this._cards[i];
            this._boardElement.appendChild(card.getElement());
            card.getElement().addEventListener(
              "click",
              function () {
                this._flipCard(card);
              }.bind(this)
            ); // TODO Step 3.2 use arrow function.
          }.bind(this)());
        }

        this.start();
      }.bind(this)
    );
  };

  // TODO Step 7 implement getTemplate() {}

  /* method GameComponent.start */
  GameComponent.prototype.start = function start() {
    this._startTime = Date.now();
    var seconds = 0;
    // TODO Step 3.2: use template literals (backquotes)
    document.querySelector("nav .navbar-title").textContent =
      "Player: " + this._name + ". Elapsed time: " + seconds++;

    this._timer = setInterval(
      function () {
        // TODO Step 3.2: use arrow function
        // TODO Step 3.2: use template literals (backquotes)
        document.querySelector("nav .navbar-title").textContent =
          "Player: " + this._name + ". Elapsed time: " + seconds++;
      }.bind(this),
      1000
    );
  };

  /* method GameComponent.fetchConfig */
  GameComponent.prototype.fetchConfig = function fetchConfig(cb) {
    var xhr =
      typeof XMLHttpRequest != "undefined"
        ? new XMLHttpRequest()
        : new ActiveXObject("Microsoft.XMLHTTP");

    // TODO Step 3.2 use template literals
    xhr.open("get", environment.api.host + "/board?size=" + this._size, true);

    // TODO Step 3.2 use arrow function
    xhr.onreadystatechange = function () {
      var status;
      var data;
      // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
      if (xhr.readyState == 4) {
        // `DONE`
        status = xhr.status;
        if (status == 200) {
          data = JSON.parse(xhr.responseText);
          cb(data);
        } else {
          throw new Error(status);
        }
      }
    };
    xhr.send();
  };

  /* method GameComponent.gotoScore */
  GameComponent.prototype.gotoScore = function gotoScore() {
    var timeElapsedInSeconds = Math.floor(
      (Date.now() - this._startTime) / 1000
    );
    clearInterval(this._timer);

    setTimeout(
      function () {
        // TODO Step 3.2: use arrow function.
        // TODO Step 1: replace with '../score/score.component.html?name=...' location
        // TODO Step 3.2: use template literals (backquotes)
        // TODO Step 7: change path to: `score?name=${this._name}&size=${this._size}'&time=${timeElapsedInSeconds}`;
        window.location =
          "score.html?name=" +
          this._name +
          "&size=" +
          this._size +
          "&time=" +
          timeElapsedInSeconds;
      }.bind(this),
      750
    ); // TODO Step 3.2: Why bind(this)?
  };

  /* method GameComponent._flipCard */
  GameComponent.prototype._flipCard = function _flipCard(card) {
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
        // TODO Step 3.2 use arrow function
        setTimeout(
          function () {
            // hide the cards
            this._flippedCard.flip();
            card.flip();
            this._busy = false;

            // reset flipped card for the next turn.
            this._flippedCard = null;
          }.bind(this),
          500
        );
      }
    }
  };

  // TODO Step 6: Move this method to utils.js
  function parseUrl() {
    var url = window.location;
    var query = url.href.split("?")[1] || "";
    var delimiter = "&";
    var result = {};

    var parts = query.split(delimiter);
    // TODO Step 3.3: Use Array.map() & Array.reduce()
    for (var i in parts) {
      var item = parts[i];
      var kv = item.split("=");
      result[kv[0]] = kv[1];
    }

    return result;
  }

  // put component in global scope, to be runnable right from the HTML.
  // TODO Step 7: export GameComponent
  window.GameComponent = GameComponent;
})();
