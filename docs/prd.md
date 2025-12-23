Parfait.
Voici **LA VERSION DÉFINITIVE ET COMPLÈTE du PRD** de **MEMORIA FIDEI**, **intégrant clairement Convex**, l’architecture hybride, les flows, user stories, contraintes théologiques et techniques.

👉 **Format Markdown (.md)**
👉 Prêt pour : développeurs, designers, investisseurs, partenaires ecclésiaux.

---

# 📘 PRD — **MEMORIA FIDEI**

### Application Web & Mobile d’apprentissage, mémorisation et apologétique biblique catholique

**Architecture : Convex + Bible catholique statique**

---

## 1. 🎯 VISION PRODUIT

### 1.1 Mission

Créer une application catholique de référence qui permet de :

* Comprendre la Bible comme **UNE seule Histoire du Salut**
* Mémoriser durablement les Écritures
* Relier Ancien et Nouveau Testament
* Former des catholiques **sûrs de leur foi**
* Donner des bases bibliques solides pour l’apologétique

> MEMORIA FIDEI n’est pas une Bible de lecture,
> c’est une **école numérique de la foi catholique**.

---

### 1.2 Public cible

* Catholiques pratiquants
* Jeunes adultes
* Catéchistes
* Convertis récents
* Prêtres et animateurs bibliques
* Public francophone (Afrique / Europe / diaspora)

---

## 2. 🧱 PRINCIPES NON NÉGOCIABLES

* Bible catholique (73 livres)
* Fidélité à la Tradition et au Magistère
* Lecture typologique (AT → NT)
* Apologétique biblique, non agressive
* Mémorisation avant volume
* Sobriété visuelle et doctrinale
* Zéro dépendance critique à une API externe

---

## 3. 🧠 CONCEPT CENTRAL

Chaque **chapitre biblique** est transformé en une **fiche MEMORIA FIDEI** structurée, mémorisable et défendable.

Structure fixe :

* 1 idée centrale
* 1 image mentale
* 1 lecture typologique
* 1 section apologétique
* 1 résumé ultra-court

---

## 4. 🏗️ ARCHITECTURE TECHNIQUE (DÉCISION OFFICIELLE)

### 4.1 Stack technique

* **Frontend Web** : Next.js
* **Mobile** : Expo (React Native)
* **Backend logique** : Convex
* **Texte biblique** : Fichiers JSON catholiques (statique)
* **Auth** : Convex Auth / Clerk
* **Offline** : Cache local / SQLite (mobile)
* **Notifications** : Expo Push

---

### 4.2 Principe architectural clé

```
┌────────────────────────────┐
│        Frontend             │
│  Next.js / Expo             │
└──────────────┬─────────────┘
               │
┌──────────────▼─────────────┐
│           Convex            │
│  - logique métier           │
│  - progression              │
│  - mémorisation              │
│  - apologétique              │
└──────────────┬─────────────┘
               │
┌──────────────▼─────────────┐
│   Bible catholique statique │
│   JSON / CDN / SQLite       │
│   (73 livres)               │
└────────────────────────────┘
```

👉 Convex = **cerveau**
👉 Bible statique = **bibliothèque**
👉 MEMORIA FIDEI = **valeur unique**

---

## 5. 🧭 USER FLOW GLOBAL

### 5.1 Onboarding

1. Écran d’introduction (vision)
2. Choix de l’objectif :

   * 📖 Comprendre la Bible
   * 🧠 Mémoriser
   * 🛡️ Défendre la foi
3. Création de compte
4. Choix du rythme :

   * Léger (5 min/jour)
   * Normal (10 min/jour)
   * Approfondi (15–20 min/jour)

---

### 5.2 Flow principal

```
Accueil
 ↓
Parcours
 ↓
Livre → Chapitre
 ↓
Fiche MEMORIA FIDEI
 ↓
Mémorisation / Apologétique / Prière
 ↓
Révision programmée
```

---

## 6. 🧩 ÉCRANS & MODULES

### 6.1 Accueil

* Progression globale
* Chapitre du jour
* À revoir aujourd’hui
* Accès rapide :

  * Parcours
  * Mémoire
  * Apologétique
  * Prière

---

### 6.2 Parcours bibliques

Types :

* Histoire du Salut (12 périodes)
* Fondements de la foi catholique
* Apologétique essentielle
* Parcours 30 / 60 / 90 jours

---

### 6.3 Fiche Chapitre — MEMORIA FIDEI

Sections **fixes et obligatoires** :

1. Titre
2. Idée centrale
3. Contexte essentiel
4. Image mentale maîtresse
5. Lecture typologique AT → NT
6. Versets clés
7. 🛡️ Section apologétique
8. Place dans l’Histoire du Salut
9. Application spirituelle
10. Résumé mémoriel
11. Astuce mémoire

Navigation :

* Scroll vertical
* Swipe entre chapitres
* Bouton “Marquer comme mémorisé”

---

## 7. 🛡️ MODULE APOLOGÉTIQUE

Fonctionnalités :

* Fiches doctrinales :

  * Primauté de Pierre
  * Eucharistie
  * Tradition
  * Grâce
  * Église
* Objection → Réponse biblique
* Recherche par thème
* Favoris apologétiques

Objectif :

> Donner confiance au catholique, pas gagner des débats.

---

## 8. 🧠 MODULE MÉMOIRE

### Méthodes

* Répétition espacée
* Image mentale
* Résumé ultra-court
* Phrase déclencheur

### Fonctionnalités

* À revoir aujourd’hui
* Historique de mémorisation
* Progression personnelle
* Notifications intelligentes

---

## 9. 🙏 MODULE PRIÈRE

* Prière liée au chapitre
* Silence guidé (1 min)
* Acte de foi / confiance
* Passage lecture → prière

---

## 10. 👤 PROFIL UTILISATEUR

* Niveau
* Progression
* Chapitres mémorisés
* Versets favoris
* Parcours actifs
* Paramètres :

  * rythme
  * notifications
  * mode sombre

---

## 11. 📖 USER STORIES (EXTRAIT)

### US-01

> En tant que catholique, je veux comprendre un chapitre biblique simplement afin de m’en souvenir durablement.

### US-02

> En tant que chrétien, je veux des arguments bibliques clairs pour expliquer ma foi sans agressivité.

### US-03

> En tant que catéchiste, je veux un contenu fiable et structuré utilisable tel quel.

### US-04

> En tant qu’utilisateur, je veux être rappelé de ce que j’ai appris pour ne pas oublier.

---

## 12. 📦 MODÈLE DE DONNÉES (CONVEX)

### Tables principales

#### User

* id
* email
* preferences
* niveau

#### Progression

* userId
* chapterId
* memorized
* lastReview
* nextReview

#### MemoriaContent

* chapterId
* idéeCentrale
* imageMentale
* typologie
* apologetique
* resume
* astuce

#### Parcours

* id
* type
* chapters[]

---

## 13. 🔐 NON-FONCTIONNEL

* Performance élevée
* Mode offline partiel
* Sécurité des données
* Scalabilité
* Multiplateforme
* Maintenance simple

---

## 14. 💰 MODÈLE ÉCONOMIQUE (ÉTHIQUE)

### Freemium

* Gratuit :

  * Parcours de base
* Premium :

  * Tous les parcours
  * Apologétique avancée
  * Révisions intelligentes

⚠️ Aucun blocage sur les doctrines essentielles.

---

## 15. 🚀 MVP — VERSION 1

### Inclus

* Onboarding
* Parcours Histoire du Salut
* Fiches MEMORIA FIDEI
* Module mémoire
* Apologétique de base
* Convex backend

### Exclu (v2+)

* Communauté
* Audio
* Multilingue

---

## 16. 🧭 VISION LONG TERME

* Mode paroisse
* Mode groupe
* Formation catéchiste
* Certification interne
* Multilingue
* Version diocésaine

---

## ✝️ CONCLUSION

**MEMORIA FIDEI** est :

* biblique
* doctrinal
* mémoriel
* apologétique
* missionnaire

> *Former l’intelligence, nourrir la foi, fortifier le témoignage.*

---

### 👉 Prochaines briques possibles

1️⃣ Schéma Convex détaillé
2️⃣ Algorithme de répétition espacée
3️⃣ Structure des fichiers Bible JSON
4️⃣ Wireframes UX
5️⃣ Roadmap technique complète

Dis-moi : **on passe au niveau code, UX ou data ?** ✝️📖💻🔥
