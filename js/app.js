import {DOMManager} from './DOMManager.js';
import {Game} from './Game.js';
import {ApiService} from './ApiService.js';

const domManager = new DOMManager();
const game = new Game();
game.setupGestionnaireClics();

document.querySelector('.game-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const pseudo = JSON.stringify(formData.get('pseudonyme'));
    const difficulte = parseInt(formData.get('difficulte'));
    const mode = parseInt(formData.get('mode-jeu'));
    const vies = parseInt(formData.get('vies'))
    const collection = parseInt(formData.get('collection'));

    try {
        const data = await ApiService.createGame(pseudo, difficulte+1);
        console.log('Success:', data, data.id);

        document.querySelector('.setup-form').classList.add('hidden');
        game.generateCards(collection, difficulte); // Doit être avant startGame car startGame() utilise le nombre de
        game.startGame(data.id, mode, vies);        // cartes pour définir la limite de temps et le nombre de vies
        domManager.createCards(game.cartes);
        domManager.boutonAbandon(game)

    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Erreur lors de la création de la partie');
    }
});
