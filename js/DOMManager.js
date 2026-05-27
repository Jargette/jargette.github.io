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
     * Montre l'autre face de carte
     */
    returnCard(event){
       const carte=event.target.closest('.card')
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
         * Voici un exemple de contenu de card permettant de contenir une partie masqué
         * et l'image qui doit être révélée.
         *
         <div class="card-inner">
         <div class="card-front">
         <img src="./assets/images/mask1.jpg" alt="Hidden card">
         </div>
         <div class="card-back hidden">
         <img src="${image.url}" alt="${image.name}">
         </div>
         </div>
         */    
}
