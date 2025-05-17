const changelog: Array<any> = [
  {
    version: '0.9.0',
    releaseDate: '2025-05-17',
    notes: [
      `Core : Ajout de l'appel vers l'api V2`
    ]
  },
  {
    version: '0.8.1',
    releaseDate: '2025-03-16',
    notes: [
      `Core : Suppression d'un doublon de chargement du bouton de connexion avec google`,
      `Core : Chargement de certains fichiers css en local afin d'éviter certains blocages liés à la latence de unpkg`,
    ]
  },
  {
    version: '0.8.0',
    releaseDate: '2025-02-26',
    notes: [
      `Répartition d'épargne : Création du composant initial`,
    ]
  },
  {
    version: '0.7.0',
    releaseDate: '2025-02-26',
    notes: [
      `Core : Ajout de la note de version sur la page d'accueil`,
      `Core : Désactivation temporaire du lien qui pointe vers les paramètres`,
      `Core : Mise en place de l'application en PWA et récupération interne du type de plateforme`,
    ]
  },
  {
    version: '0.6.1',
    releaseDate: '2025-01-26',
    notes: [
      `Dofus : On surcharge la position de départ des minogolems quand on appuie sur le bouton Continuer`,
      `Dofus : On décoche les tours joués si le recalcul du résultat est effectué`,
    ]
  },
  {
    version: '0.6.0',
    releaseDate: '2025-01-26',
    notes: [
      `Dofus : Ajout d'un outil d'aide pour la quête "Une âme en peine", nécessaire pour le dofus pourpre`
    ]
  },
  {
    version: '0.5.0',
    releaseDate: '2025-01-23',
    notes: [
      `Core : Ajout d'un bouton dans le header pour signaler un bug ou proposer une amélioration`
    ]
  },
  {
    version: '0.4.0',
    releaseDate: '2025-01-20',
    notes: [
      `Dofus : On peut désormais copier le nom d'un objet en cliquant sur ce dernier, dans la recherche d'items et également dans les sets`
    ]
  },
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