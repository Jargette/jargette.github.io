import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';
import {DOMManager} from './DOMManager.js';

const images = [imageCollections.animals, imageCollections.fruits, imageCollections.cars, imageCollections.pokemon, imageCollections.foods]

export class Game {
    /**
     * @type {number} id identifiant de la partie en cours
     */
    #id;
    //// Variables pour suivre la partie en cours
    timerInterval;
    cartes = [];
    nbPaires;
    vies;
    pairesTrouvees = 0;
    cartesRetournees = [];
    grilleBloquee = false;
    nbCoups = 0;

    async endGame() {
        //On supprime ce qui est créé en début de partie
        clearInterval(this.timerInterval);
        document.querySelectorAll('.game-timer').forEach(elt =>{
            elt.remove() //Les deux timers, les coups et les vies sont de class game-timer
        })
        document.querySelector('#abandon').remove() //Bouton Abandonner
        this.cartes = [];

        const id = this.#id;
        const nbPairesRestantes = this.nbPaires - this.pairesTrouvees;

        // On affiche le bon message selon la situation
        if (nbPairesRestantes === 0) {
            alert(`Victoire ! Vous avez trouvé toutes les paires en ${this.nbCoups} coups !`);
        } else {
            alert(`Partie terminée !\n${this.pairesTrouvees} sur ${this.nbPaires} paires trouvées.`);
        }

        // On réaffiche le menu et on cache le jeu tout de suite pour éviter les freezes et pouvoir relancer une partie
        document.querySelector('.setup-form').classList.remove('hidden');
        document.querySelector('.game-area').classList.add('hidden');

        try {
            const result = await ApiService.updateGameResult(id, nbPairesRestantes);
            console.log('Fin de partie:', result);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Erreur lors de la fin de la partie');
        }
    }

    /**
     * Start a new game.
     * @param {number} id - The game ID.
     * @param {number} mode Le mode de jeu
     * @param {number} vies 1 si les vies sont limitées, 0 sinon
     */
    startGame(id, mode, vies) {
        this.#id = id;

        this.pairesTrouvees = 0;
        this.cartesRetournees = [];
        this.grilleBloquee = false;
        this.nbCoups = 0;

        const gameArea = document.querySelector('.game-area')
        gameArea.classList.remove('hidden');
        // Choix du chronomètre ou temps limité
        switch (mode) {
            case 1:
                this.startLimitedTimer();
                break;
            default:
                this.startUnlimitedTimer();
        }
        // Choix du nombre de vies limitées
        switch (vies) {
            case 1:
                this.setLives();
                break;
        }
        this.initCompteurCoups(); // Affiche le nombre de coups
    }

    /**
     * Lance un temps limité pour finir le jeu
     */
    startLimitedTimer() {
        let time = this.cartes.length*2; // Temps suffisant mais pas trop long
        const timer = document.createElement('div');
        timer.classList.add('game-timer');
        timer.innerHTML = `Temps restant : ${time}s`;
        document.querySelector('.game-area-header').append(timer);
        this.timerInterval = setInterval(() => {
            time -= 1;
            timer.innerHTML = `Temps restant : ${time}s`;
            if (time === 0) {
                this.endGame();
            }
        }, 1000);
    }

    /**
     * Lance un chronomètre
     */
    startUnlimitedTimer() {
        let time = 0;
        const timer = document.createElement('div');
        timer.classList.add('game-timer');
        timer.innerHTML = `Temps écoulé : ${time}s`;
        document.querySelector('.game-area-header').append(timer);
        this.timerInterval = setInterval(() => {
            time += 1;
            timer.innerHTML = `Temps écoulé : ${time}s`;
        }, 1000);
    }

    /**
     * Initialise les vies du joueur
     */
    setLives() {
        this.vies = this.nbPaires;
        const lives = document.createElement('div')
        lives.id = "affichage-vies";
        lives.classList.add('game-timer');
        lives.innerHTML = `Vies restantes : ${this.vies}`;
        document.querySelector('.game-area-header').append(lives);
        if (this.vies === 0) {
            this.endGame();
        }
    }

    /**
     * Affiche le compteur de coups en haut
     */
    initCompteurCoups() {
        const coupsDiv = document.createElement('div');
        coupsDiv.id = 'affichage-coups';
        coupsDiv.classList.add('game-timer');
        coupsDiv.innerHTML = `Coups : ${this.nbCoups}`;
        document.querySelector('.game-area-header').append(coupsDiv);
    }

    /**
     * Crée le tableau de cartes dans le jeu
     * @param {number} collection Le numéro du thème
     * @param {number} difficulte Le numéro de la difficulté
     */
    generateCards(collection, difficulte) {
        const theme = images[collection];
        this.nbPaires = 4 + difficulte;
        for (let i = 0; i < this.nbPaires; ++i) {
            this.cartes.push(theme[i]);
            this.cartes.push(theme[i]);
        }
        this.melangeCartes(this.nbPaires * 2, this.cartes);
    }

    /**
     * Mélange les cartes
     * @param {number} n Le nombre de cartes
     * @param {Image[]} cartes Le tableau des cartes à mélanger
     */
    melangeCartes(n, cartes) {
        for (let i = n - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [cartes[i], cartes[j]] = [cartes[j], cartes[i]];
        }
    }

    /**
     * Gère le clic sur les cartes du plateau
     */
    setupGestionnaireClics() {
        const gameBoard = document.querySelector('.game-board');
        gameBoard.addEventListener('click', (e) => {
            const card = e.target.closest('.card');

            // Si ce n'est pas une carte, la grille est bloquée, ou la carte est déjà retournée on ne fait rien
            if (!card || this.grilleBloquee === true || card.classList.contains('flip')) return;

            const dom = new DOMManager();
            dom.returnCard(e);
            this.cartesRetournees.push(card);
            console.log(this.cartesRetournees)

            // Si on a retourné deux cartes, on vérifie
            if (this.cartesRetournees.length === 2) {
                this.grilleBloquee = true;
                this.nbCoups++;
                document.querySelector('#affichage-coups').innerHTML = `Coups : ${this.nbCoups}`;
                this.verifierPaire();
            }
        });
    }

    /**
     * Vérifie si les deux cartes retournées correspondent
     */
    verifierPaire() {
        this.grilleBloquee = true; // On bloque les clics le temps de la vérification

        const card1 = this.cartesRetournees[0];
        const card2 = this.cartesRetournees[1];

        const index1 = card1.getAttribute('data-index');
        const index2 = card2.getAttribute('data-index');

        // On compare les noms des images grâce à l'index qu'on a mis dans le DOMManager
        if (this.cartes[index1].name === this.cartes[index2].name) {
            // Si on a une paire, on vide les cartes retournées
            this.pairesTrouvees++;
            this.cartesRetournees = [];
            this.grilleBloquee = false;

            // Si on a trouvé toutes les paires, c'est gagné
            if (this.pairesTrouvees === this.nbPaires) {
                setTimeout(() => this.endGame(), 500);
            }
        } else {
            // Pas une paire : on attend 1 seconde et on les cache
            setTimeout(() => {
                card1.classList.remove('flip');
                card2.classList.remove('flip');
                this.cartesRetournees = [];
                this.grilleBloquee = false;

                // Si le mode vies limitées est actif, on baisse les vies
                if (this.vies !== undefined) {
                    this.vies--;
                    const infoVies = document.querySelector('#affichage-vies');
                    if (infoVies) infoVies.innerHTML = `Vies restantes : ${this.vies}`;
                    if (this.vies === 0) {
                        alert("Plus de vies ! Game Over.");
                        this.endGame();
                    }
                }
            }, 1000);
        }
    }
}
