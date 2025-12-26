# Memoria Fidei ✝️

> "Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence." (Romains 12:2)

**Memoria Fidei** est une application web progressive (PWA) conçue pour aider les catholiques à former leur intelligence, nourrir leur prière et fortifier leur mémoire.

![App Preview](public/icon.png)

## 🌟 Fonctionnalités

### 📖 Bible & Étude
- **Bible en 365 Jours** : Suivez le plan chronologique (basé sur *The Bible in a Year* avec Fr. Mike Schmitz).
- **Lecture Immersive** : Surlignage, annotations et tags personnalisés.
- **Traduction** : Textes basés sur la liturgie catholique (AELF) et la Bible de Jérusalem.

### 🙏 Vie de Prière
- **Saint Rosaire Interactif** : Méditations pour chaque mystère, suivi grain par grain.
- **Examen de Conscience** : Préparation à la confession avec génération de prière de contrition (IA).
- **Lectio Divina** : Guide pas-à-pas (Lectio, Meditatio, Oratio, Contemplatio).

### 🛡️ Apologétique (Défense de la Foi)
- **Assistant IA Catholique** : Répond à vos questions en se basant strictement sur le Magistère, la Bible et les Pères de l'Église.
- **Cours** : Leçons structurées pour comprendre les dogmes essentiels.

### 📊 Progression
- Suivi de l'XP et des séries (Streaks).
- Statistiques de lecture.

## 🛠️ Stack Technique

- **Frontend** : React, Vite, TailwindCSS, Shadcn/ui.
- **Backend / Database** : [Convex](https://convex.dev/) (Real-time DB, Serverless Functions).
- **Auth** : [Clerk](https://clerk.com/).
- **AI** : Google Gemini (via Convex Actions).

## 🚀 Installation Locale

1. **Cloner le projet**
   ```bash
   git clone https://github.com/JayMung/Memoria.git
   cd Memoria
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Variables d'environnement**
   Copiez `.env.example` vers `.env.local` et ajoutez vos clés :
   - `VITE_CONVEX_URL`
   - `VITE_CLERK_PUBLISHABLE_KEY`

4. **Lancer le serveur de développement**
   ```bash
   pnpm run dev
   ```
   Et dans un autre terminal :
   ```bash
   npx convex dev
   ```

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour des changements majeurs, veuillez ouvrir une issue d'abord pour discuter de ce que vous aimeriez changer.

## 📄 Licence

[MIT](LICENSE) © 2024 Memoria Fidei
