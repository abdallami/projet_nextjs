# Projet Next.js 🚀

C'est un projet pour mettre en applications nos connaissances sur Next.js.

## 📋 Table des matières

- [À propos](#à-propos)
- [Technologies utilisées](#technologies-utilisées)
- [Composition du projet](#composition-du-projet)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [Contribution](#contribution)

## À propos

Ce projet est une application web moderne construite avec **Next.js**, un framework React puissant et flexible. Il vise à démontrer et mettre en pratique les meilleures pratiques de développement avec Next.js, incluant :

- Le rendu côté serveur (SSR)
- La génération statique (SSG)
- Les API Routes
- L'optimisation des performances
- Les bonnes pratiques TypeScript

## Technologies utilisées

### 🎯 Frontend
- **Next.js** - Framework React pour la production
- **React** - Bibliothèque JavaScript pour les interfaces utilisateur
- **TypeScript** (97.7%) - Langage typé pour une meilleure maintenabilité du code
- **CSS** (0.5%) - Stylisation des composants

### 📝 Langages de programmation
- **TypeScript** (97.7%) - Langage principal du projet
- **JavaScript** (1.8%) - Code JavaScript standard
- **CSS** (0.5%) - Feuilles de style

### 🔧 Stack technologique
- **Node.js** - Environnement d'exécution JavaScript
- **npm/yarn** - Gestionnaire de paquets

## Composition du projet

```
TypeScript: 97.7% ████████████████████░
JavaScript: 1.8%  █
CSS:        0.5%  ▌
```

Le projet est principalement écrit en **TypeScript**, ce qui garantit :
- ✅ Une meilleure sécurité des types
- ✅ Une autocomplétion améliorée dans l'IDE
- ✅ Une maintenance facilitée
- ✅ Une réduction des bugs en production

## Installation

### Prérequis
- Node.js (v16.x ou supérieur)
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/abdallami/projet_nextjs.git
cd projet_nextjs
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

## Utilisation

### Démarrage du serveur de développement
```bash
npm run dev
# ou
yarn dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build pour la production
```bash
npm run build
npm start
# ou
yarn build
yarn start
```

### Linting et vérification du code
```bash
npm run lint
# ou
yarn lint
```

## Structure du projet

```
projet_nextjs/
├── pages/              # Routes de l'application
├── components/         # Composants React réutilisables
├── styles/            # Fichiers CSS et stylisation
├── public/            # Actifs statiques
├── lib/               # Utilitaires et fonctions
├── .env.local         # Variables d'environnement
├── next.config.js     # Configuration Next.js
├── tsconfig.json      # Configuration TypeScript
├── package.json       # Dépendances du projet
└── README.md          # Ce fichier
```

## Fonctionnalités principales

- 🔄 Rendu serveur côté (SSR) pour le SEO
- ⚡ Optimisation automatique des images
- 📱 Design responsive
- 🎨 Stylisation avec CSS moderne
- 🔐 Types TypeScript strictes
- 📦 Bundling optimisé

## Points clés du développement

### TypeScript
Le projet utilise **TypeScript à 97.7%**, ce qui signifie que la quasi-totalité du code est typée. Cela offre :
- Une meilleure expérience développeur
- Une détection d'erreurs précoce
- Une documentation implicite du code

### Next.js
Les avantages de Next.js utilisés dans ce projet :
- **API Routes** pour les endpoints backend
- **Image Optimization** pour les performances
- **Font Optimization** automatique
- **Code Splitting** automatique

## Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. **Fork** le repository
2. **Créer une branche** (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir une Pull Request**

## Auteur

**abdallami** - [Profil GitHub](https://github.com/abdallami)

## Licence

Ce projet est sous la licence **MIT**. Consultez le fichier `LICENSE` pour plus de détails.

---

**Créé avec ❤️ pour explorer et maîtriser Next.js**
