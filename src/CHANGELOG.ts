const changelog: Array<any> = [
  {
    version: '0.3.3',
    releaseDate: '2025-01-18',
    notes: [
      "Dofus : Le prix total d'une ressource dans un set affiche désormais le vrai prix total et non plus le prix unitaire multiplié par 1",
      "Dofus : Changement des libellés 'prix moyen' par 'prix unitaire'",
    ],
  },
  {
    version: '0.3.2',
    releaseDate: '2025-01-09',
    notes: [
      "Dofus : Correctif dans l'affichage d'une carte d'un set, le champ multiplicateur et le bouton de suppression sortaient du cadre à droite",
      "Dofus : Ajout de l'iditem quand on clique sur une image d'un objet pour l'agrandir dans la recherche des items",
    ],
  },
  {
    version: '0.3.1',
    releaseDate: '2025-01-08',
    notes: [
      'Dofus : Correctif dans le résumé, ajout du multiplicateur de chaque item pour chaque calcul',
    ],
  },
  {
    version: '0.3.0',
    releaseDate: '2024-12-31',
    notes: [
      "Dofus : Mise en place de l'affichage des sets partagés",
      'Dofus : Ajout de la génération du lien de partage',
      'Core : Affichage du numéro de version dans le header depuis le package.json',
    ],
  },
  {
    version: '0.2.1',
    releaseDate: '2024-12-29',
    notes: [
      "Dofus : Changement de sens pour la flèche qui dit si c'est mieux de craft ou d'acheter directement l'objet",
    ],
  },
  {
    version: '0.2.0',
    releaseDate: '2024-12-22',
    notes: [
      'Dofus : Mise en place du module Dofus avec la recherche des objets',
      'Dofus : Mise en place de la gestion des sets',
    ],
  },
  {
    version: '0.1.0',
    releaseDate: '2024-12-21',
    notes: [
      'Core : Ajout de Vuetify dans le projet',
      "Core : Ajout de Google Oauth2 lors de la connexion et retrait du mode d'inscription classique",
      'Core : Mise en place des modules par utilisateur',
      "Core : Mise en place de l'inscription via Google",
    ],
  },
];

export default changelog