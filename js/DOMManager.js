import {Game} from "./Game.js";

export class DOMManager {

    /**
     * Ajoute toutes les images d'une collection sur le gameBoard
     * @param {Image[]} images
     */
    createCards(images) {
        const gameBoard = document.querySelector('.game-board');
        // On vide le plateau pour pas que les cartes se superposent si on rejoue
        gameBoard.innerHTML = '';

        const template = document.querySelector('#carteAJouer');
        let tab = [];
        let i = 0; // On se sert du i comme index pour chaque carte       
        for (const image of images) {
            const newDiv = document.importNode(template.content, true);

            // On met un attribut data-index pour savoir quelle carte est cliquée plus tard
            const cardElement = newDiv.querySelector('.card');
            cardElement.setAttribute('data-index', i);

            newDiv.querySelector('.card-back')
                .querySelector('img')
                .setAttribute('src', image.url);
            newDiv.querySelector('.card-back')
                .querySelector('img')
                .setAttribute('alt', image.name);

            gameBoard.append(newDiv);
            i++;
        }
    }

    /**
     * Retourne une carte
     * @param {Event} event
     */
    returnCard(event) {
        const carte = event.target.closest('.card')
        carte.classList.toggle('flip');

    }

    /**
     * Crée un bouton qui permet d'abandonner la partie
     * @param {Game} game La partie concernée par le bouton
     */
    boutonAbandon(game) {
        const abandon = document.createElement('button')
        abandon.id = 'abandon'
        abandon.innerHTML = "Abandonner";
        abandon.addEventListener('click', game.endGame.bind(game));
        document.querySelector('.game-area-header').append(abandon)
    }

    /**
     * Affiche le nombre de vies restantes
     * @param {Game} game
     */
    voirVieRestante(game) {
        debugger
        if (Number.isInteger(game.vies)) {
            const lives = document.createElement('div')
            lives.id = "affichage-vies";
            lives.classList.add('game-timer');
            lives.innerHTML = `Vies restantes : ${game.vies}`;
            document.querySelector('.game-area-header').append(lives);
        }
    }

    /**
     * Lance un chronomètre ou un temps imparti selon le mode sélectionné
     * @param {Game} game La partie en cours
     */
    starTimer(game) {
        // Choix du chronomètre ou temps limité
        switch (game.mode) {
            case 1:
                this.startLimitedTimer(game);
                break;
            default:
                this.startUnlimitedTimer(game);
        }
    }

    /**
     * Lance un temps limité pour finir le jeu
     * @param {Game} game La partie en cours
     */
    startLimitedTimer(game) {
        let time = game.cartes.length * 2; // Temps suffisant mais pas trop long
        const timer = document.createElement('div');
        timer.classList.add('game-timer');
        timer.innerHTML = `Temps restant : ${time}s`;
        document.querySelector('.game-area-header').append(timer);
        game.timerInterval = setInterval(() => {
            time -= 1;
            timer.innerHTML = `Temps restant : ${time}s`;
            if (time === 0) {
                game.endGame();
            }
        }, 1000);
    }

    /**
     * Lance un chronomètre
     * @param {Game} game La partie en cours
     */
    startUnlimitedTimer(game) {
        let time = 0;
        const timer = document.createElement('div');
        timer.classList.add('game-timer');
        timer.innerHTML = `Temps écoulé : ${time}s`;
        document.querySelector('.game-area-header').append(timer);
        game.timerInterval = setInterval(() => {
            time += 1;
            timer.innerHTML = `Temps écoulé : ${time}s`;
        }, 1000);
    }

    /**
     * Affiche le compteur de coups en haut
     * @param {Game} game La partie en cours
     */
    initCompteurCoups(game) {
        const coupsDiv = document.createElement('div');
        coupsDiv.id = 'affichage-coups';
        coupsDiv.classList.add('game-timer');
        coupsDiv.innerHTML = `Coups : ${game.nbCoups}`;
        document.querySelector('.game-area-header').append(coupsDiv);
    }
}
