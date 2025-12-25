import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: List all lessons
export const listLessons = query({
    handler: async (ctx) => {
        const lessons = await ctx.db.query("apologetiqueCours").collect();
        return lessons.sort((a, b) => a.ordre - b.ordre);
    },
});

// Query: Get lesson by slug
export const getLesson = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("apologetiqueCours")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

// Query: Get user progress
export const getUserCoursProgress = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();

        if (!user) return [];

        return await ctx.db
            .query("coursProgress")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
    },
});

// Mutation: Complete lesson
export const completeLesson = mutation({
    args: {
        lessonSlug: v.string(),
        quizScore: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();
        if (!user) throw new Error("User not found");

        // Check if already completed
        const existing = await ctx.db
            .query("coursProgress")
            .withIndex("by_user_lesson", (q) =>
                q.eq("userId", user._id).eq("lessonSlug", args.lessonSlug)
            )
            .first();

        if (existing) {
            // Update score if better
            if (args.quizScore && (!existing.quizScore || args.quizScore > existing.quizScore)) {
                await ctx.db.patch(existing._id, { quizScore: args.quizScore });
            }
            return existing._id;
        }

        return await ctx.db.insert("coursProgress", {
            userId: user._id,
            lessonSlug: args.lessonSlug,
            completedAt: Date.now(),
            quizScore: args.quizScore,
        });
    },
});

// Mutation: Add bookmark
export const addBookmark = mutation({
    args: {
        type: v.string(),
        itemId: v.string(),
        note: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();
        if (!user) throw new Error("User not found");

        return await ctx.db.insert("userBookmarks", {
            userId: user._id,
            type: args.type,
            itemId: args.itemId,
            note: args.note,
            createdAt: Date.now(),
        });
    },
});

// Query: Get user bookmarks
export const getUserBookmarks = query({
    args: { type: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();
        if (!user) return [];

        if (args.type) {
            return await ctx.db
                .query("userBookmarks")
                .withIndex("by_user_type", (q) =>
                    q.eq("userId", user._id).eq("type", args.type)
                )
                .collect();
        }
        return await ctx.db
            .query("userBookmarks")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
    },
});

// Mutation: Seed course data
export const seedCours = mutation({
    handler: async (ctx) => {
        const lessons = [
            {
                slug: "introduction",
                ordre: 1,
                titre: "Introduction à l'Apologétique",
                sousTitre: "Définition et fondements bibliques",
                icon: "📖",
                contenu: `L'apologétique catholique est l'art et la science de défendre la foi de manière rationnelle. Le terme provient du grec "apologia" (ἀπολογία) qui signifie "défense juridique" ou "réponse argumentée". Contrairement à une idée reçue, faire de l'apologétique ne signifie pas "s'excuser" d'être catholique, mais au contraire rendre raison de son espérance.

Historiquement, l'apologétique a toujours fait partie de la mission de l'Église. Dès les premiers siècles, des auteurs comme Saint Justin Martyr ou Tertullien ont écrit des "Apologies" pour dissiper les rumeurs fausses sur les chrétiens (accusés d'athéisme ou de cannibalisme) auprès des empereurs romains.

L'objectif de l'apologétique n'est pas de convertir par la force de l'argumentation pure — seule la Grâce convertit les cœurs — mais de **préparer le terrain** :
1. En dissipant les malentendus et préjugés.
2. En montrant que la foi n'est pas irrationnelle (foi et raison sont les deux ailes de l'esprit humain).
3. En répondant aux objections concrètes qui bloquent l'accès à l'Évangile.

Le Pape Jean-Paul II disait : "La foi et la raison sont comme les deux ailes qui permettent à l'esprit humain de s'élever vers la contemplation de la vérité." L'apologétique utilise ces deux ailes.`,
                pointsCles: [
                    "Apologia = Défense rationnelle (grec)",
                    "Objectif : Dissiper les malentendus, pas forcer la conversion",
                    "Foi et Raison sont complémentaires",
                    "Prépare le terrain pour l'Évangélisation",
                ],
                versets: [
                    {
                        reference: "1 Pierre 3:15",
                        texte: "Sanctifiez dans vos cours Christ le Seigneur, étant toujours prêts à vous défendre, avec douceur et respect, devant quiconque vous demande raison de l'espérance qui est en vous.",
                    },
                    {
                        reference: "Actes 17:2-3",
                        texte: "Paul... discuta avec eux, d'après les Écritures, expliquant et prouvant que le Christ devait souffrir et ressusciter.",
                    }
                ],
                quiz: [
                    {
                        question: "Que signifie littéralement le mot grec 'apologia' ?",
                        options: ["S'excuser platement", "Défense argumentée", "Attaque verbale", "Prédication"],
                        reponseIndex: 1,
                        explication: "Apologia vient du vocabulaire juridique grec signifiant une défense rationnelle face à une accusation.",
                    },
                    {
                        question: "Quel est le rôle de la raison dans la foi catholique ?",
                        options: ["Elle est l'ennemie de la foi", "Elle est inutile", "Elle est complémentaire à la foi", "Elle remplace la foi"],
                        reponseIndex: 2,
                        explication: "L'Église enseigne que Foi et Raison sont les deux ailes qui élèvent l'esprit vers la Vérité (Fides et Ratio).",
                    },
                    {
                        question: "Selon 1 Pierre 3:15, comment devons-nous nous défendre ?",
                        options: ["Avec colère et force", "Avec douceur et respect", "Avec indifférence", "En ignorant l'autre"],
                        reponseIndex: 1,
                        explication: "L'apôtre Pierre insiste sur la 'douceur' et le 'respect'. L'attitude compte autant que l'argument.",
                    }
                ],
                flashcards: [
                    { recto: "Définition de 'Apologia'", verso: "Défense argumentée (mot grec)" },
                    { recto: "Verset clé de l'apologétique", verso: "1 Pierre 3:15" },
                    { recto: "Relation Foi et Raison", verso: "Deux ailes vers la Vérité (complémentaires)" },
                    { recto: "But de l'apologétique", verso: "Préparer le terrain pour l'Évangélisation en levant les obstacles" }
                ],
            },
            {
                slug: "obstacles-intellectuels",
                ordre: 2,
                titre: "Les Obstacles Intellectuels",
                sousTitre: "Malentendus doctrinaux et réfutations",
                icon: "🧠",
                contenu: `Les obstacles intellectuels sont parmi les plus courants aujourd'hui. Ils reposent souvent sur une mauvaise compréhension de ce que l'Église enseigne réellement. Beaucoup de gens rejettent non pas le catholicisme, mais une caricature du catholicisme.

**Types d'obstacles intellectuels :**
1. **L'Ignorance** : La personne n'a jamais entendu la vérité ("Les catholiques adorent des statues").
2. **Les préjugés historiques** : Croisades, Inquisition, Galilée (souvent déformés par la culture populaire).
3. **Les objections bibliques** : "Le mot Purgatoire n'est pas dans la Bible" ou "La Bible interdit d'appeler quelqu'un Père".
4. **Le Scientisme** : "Seule la science prouve la vérité, Dieu est une hypothèse inutile."

**L'approche apologétique :**
Face à ces obstacles, il faut user de pédagogie. Il ne suffit pas d'affirmer, il faut expliquer et prouver.
Par exemple, pour l'intercession des saints : ne dites pas juste "C'est bien de prier les saints". Expliquez : "Nous ne les adorons pas (latrie), nous les vénérons (dulie) et leur demandons de prier POUR nous, tout comme je te demanderais de prier pour moi. La mort ne rompt pas la communion du Corps du Christ."

Utilisez l'histoire, la philosophie, et surtout l'Écriture (si l'interlocuteur est chrétien) pour montrer la cohérence de la doctrine catholique.`,
                pointsCles: [
                    "Distinguer ce que l'Église enseigne vs Caricature",
                    "Répondre à l'ignorance par l'explication",
                    "Utiliser des analogies compréhensibles",
                    "Démontrer la cohérence Biblique et Historique",
                ],
                versets: [
                    {
                        reference: "Osée 4:6",
                        texte: "Mon peuple est détruit, parce qu'il lui manque la connaissance.",
                    },
                    {
                        reference: "Jean 8:32",
                        texte: "Vous connaîtrez la vérité, et la vérité vous affranchira.",
                    }
                ],
                quiz: [
                    {
                        question: "Quelle distinction est cruciale concernant les Saints ?",
                        options: ["Adoration vs Vénération", "Amour vs Haine", "Prière vs Méditation", "Oubli vs Mémoire"],
                        reponseIndex: 0,
                        explication: "Les catholiques ADORENT Dieu seul, mais VÉNÈRENT les saints. Confondre les deux est un obstacle intellectuel majeur.",
                    },
                    {
                        question: "Le scientisme affirme que...",
                        options: ["La science et la foi sont compatibles", "Seule la science donne la vérité absolue", "La science est fausse", "La foi est une science"],
                        reponseIndex: 1,
                        explication: "Le scientisme est la croyance erronée que seule la méthode scientifique permet d'atteindre la vérité, excluant la philosophie et la foi.",
                    },
                    {
                        question: "La plupart des gens rejettent...",
                        options: ["Le vrai catholicisme", "Une caricature du catholicisme", "Jésus", "L'amour"],
                        reponseIndex: 1,
                        explication: "Comme disait Fulton Sheen : 'Peu de gens haïssent l'Église catholique, mais des millions haïssent ce qu'ils croient être l'Église catholique.'",
                    }
                ],
                flashcards: [
                    { recto: "Adoration vs Vénération", verso: "Adoration (Dieu seul) vs Vénération (Saints/Anges)" },
                    { recto: "Qu'est-ce que le Scientisme ?", verso: "Erreur croyant que seule la science détient la vérité" },
                    { recto: "Citation de Fulton Sheen", verso: "Ils haïssent ce qu'ils croient être l'Église, pas l'Église elle-même." }
                ],
            },
            {
                slug: "obstacles-moraux",
                ordre: 3,
                titre: "Les Obstacles Moraux",
                sousTitre: "La conscience et le refus de changer",
                icon: "⚖️",
                contenu: `Parfois, l'intellect est convaincu, mais la volonté résiste. C'est l'obstacle moral. La personne comprend que l'Église dit vrai, mais elle refuse d'adhérer car cela impliquerait un changement de vie trop coûteux (situation matrimoniale irrégulière, pratiques sexuelles, malhonnêteté professionnelle, orgueil...).

**Le mécanisme :**
Pour éviter la dissonance cognitive ("Je sais que c'est mal mais je le fais quand même"), la personne va souvent rationaliser son péché et attaquer l'Église : "L'Église est rétrograde", "Elle veut contrôler nos vies", "Qui sont-ils pour juger ?".
Derrière une objection intellectuelle véhémente se cache souvent une blessure morale ou un péché qui ne veut pas être lâché.

**L'approche :**
Ici, les arguments logiques ne suffisent pas. Il faut toucher le cœur :
1. **La Beauté** : Montrer que la morale chrétienne n'est pas une liste d'interdits ("Non !"), mais un grand "OUI" à l'Amour et à la dignité humaine.
2. **Le Témoignage** : Votre joie et votre cohérence de vie sont la meilleure preuve que suivre le Christ rend heureux.
3. **La Miséricorde** : Rappeler que l'Église est un hôpital pour pécheurs, pas un musée pour saints. Le pardon est toujours possible.`,
                pointsCles: [
                    "L'obstacle moral : refus de changer de vie",
                    "Rationalisation : attaquer la vérité pour justifier son comportement",
                    "Réponse : Montrer la beauté de la vertu",
                    "La Miséricorde divine est centrale",
                ],
                versets: [
                    {
                        reference: "Jean 3:19",
                        texte: "Et ce jugement, c'est que, la lumière étant venue dans le monde, les hommes ont préféré les ténèbres à la lumière, parce que leurs œuvres étaient mauvaises.",
                    },
                    {
                        reference: "Romains 2:15",
                        texte: "Ils montrent que l'œuvre de la loi est écrite dans leurs cœurs, leur conscience en rendant témoignage...",
                    }
                ],
                quiz: [
                    {
                        question: "Qu'est-ce qui se cache souvent derrière une agressivité soudaine contre l'Église ?",
                        options: ["Une thèse de doctorat", "Un conflit moral personnel", "Une indigestion", "Une erreur de traduction"],
                        reponseIndex: 1,
                        explication: "Souvent, la résistance violente vient d'une conscience qui reproche quelque chose, et la personne se défend en attaquant.",
                    },
                    {
                        question: "Pour surmonter un obstacle moral, il faut insister sur...",
                        options: ["L'Enfer", "La logique pure", "La beauté de la vertu et la miséricorde", "Les statistiques"],
                        reponseIndex: 2,
                        explication: "L'attrait du Bien (la beauté de la vie chrétienne) est plus puissant que la simple condamnation du Mal.",
                    },
                    {
                        question: "L'Église est définie comme...",
                        options: ["Un tribunal", "Un club de parfaits", "Un hôpital pour pécheurs", "Une administration"],
                        reponseIndex: 2,
                        explication: "C'est l'image classique pour montrer que l'Église accueille ceux qui ont besoin de guérison.",
                    }
                ],
                flashcards: [
                    { recto: "Signe possible d'un obstacle moral", verso: "Colère disproportionnée ou rationalisation du péché" },
                    { recto: "Réponse à l'obstacle moral", verso: "Témoignage de joie + offre de Miséricorde" },
                    { recto: "Jean 3:19 explique...", verso: "Que certains préfèrent les ténèbres car leurs œuvres sont mauvaises" }
                ],
            },
            {
                slug: "obstacles-emotionnels",
                ordre: 4,
                titre: "Les Obstacles Émotionnels",
                sousTitre: "La souffrance et le scandale",
                icon: "💔",
                contenu: `L'obstacle émotionnel est peut-être le plus délicat. Il ne s'agit ni de logique ni de péché, mais de **souffrance**.
"Si Dieu existe, pourquoi mon enfant est-il mort ?"
"Comment croire en l'Église quand un prêtre m'a fait du mal ?"
"Les chrétiens sont des hypocrites."

**Anatomie de l'obstacle :**
La douleur érige un mur. La personne associe Dieu ou l'Église à sa souffrance. Essayer de "prouver" que Dieu existe à une mère qui vient de perdre son enfant est souvent maladroit, voire cruel.

**L'approche : Compassion avant tout.**
1. **Écouter** : Ne coupez pas la parole. Laissez la douleur s'exprimer. Parfois, la personne a juste besoin de crier sa colère contre Dieu.
2. **Compatir** : "Je suis tellement désolé que tu aies vécu ça." Reconnaissez la gravité du mal (ex: abus dans l'Église). Ne minimisez jamais.
3. **Distinguer** : Avec douceur, et plus tard, aidez à distinguer Judas (le traître) de Jésus. La trahison d'un membre de l'Église n'invalide pas la vérité de l'Évangile, au contraire, l'Évangile nous avait prévenus qu'il y aurait de l'ivraie dans le bon grain.
4. **La Croix** : Le christianisme est la seule religion où Dieu Lui-même a souffert. Il n'est pas distant de notre douleur, Il l'a partagée.`,
                pointsCles: [
                    "Ne pas argumenter face à la douleur brute",
                    "Écoute active et Empathie",
                    "Distinguer la personne de l'institution/Dieu",
                    "Présenter le Christ souffrant (Dieu avec nous)",
                ],
                versets: [
                    {
                        reference: "Psaume 34:18",
                        texte: "L'Éternel est près de ceux qui ont le cœur brisé, et il sauve ceux qui ont l'esprit dans l'abattement.",
                    },
                    {
                        reference: "Jean 11:35",
                        texte: "Jésus pleura.",
                    }
                ],
                quiz: [
                    {
                        question: "La première réaction face à un obstacle émotionnel doit être...",
                        options: ["L'argumentation théologique", "L'écoute silencieuse et empathique", "La réprimande", "Changer de sujet"],
                        reponseIndex: 1,
                        explication: "Ecouter valide la souffrance de l'autre. C'est la base de toute guérison relationnelle.",
                    },
                    {
                        question: "L'existence de mauvais chrétiens (scandales) prouve que...",
                        options: ["L'Église est fausse", "Dieu n'existe pas", "L'homme est libre et peut pécher", "La Bible ment"],
                        reponseIndex: 2,
                        explication: "Le péché des membres de l'Église ne nie pas la sainteté de l'Église en tant que Corps du Christ, mais montre la réalité du combat spirituel.",
                    },
                    {
                        question: "Quel aspect de Dieu est le plus touchant pour celui qui souffre ?",
                        options: ["Sa toute-puissance", "Son omniscience", "Sa compassion (Souffrir-avec)", "Son éternité"],
                        reponseIndex: 2,
                        explication: "Savoir que Dieu a souffert sur la Croix nous montre qu'Il comprend notre douleur de l'intérieur.",
                    }
                ],
                flashcards: [
                    { recto: "Réaction face au deuil/colère", verso: "Compassion et Écoute (pas de débat)" },
                    { recto: "Réponse au scandale des mauvais chrétiens", verso: "Ne pas juger Jésus par Judas" },
                    { recto: "Jésus pleura (Jean 11:35) montre...", verso: "L'humanité et la compassion de Dieu" }
                ],
            },
            {
                slug: "cycle-ace",
                ordre: 5,
                titre: "Le Cycle A.C.E.",
                sousTitre: "Apologétique - Catéchèse - Évangélisation",
                icon: "🔄",
                contenu: `Pour être efficace, l'apologétique ne doit pas être isolée. Elle s'inscrit dans un cycle dynamique appelé A.C.E. :

1.  **A - Apologétique** : C'est le "déminage".
    *   *But* : Lever les obstacles (intellectuels, moraux, émotionnels).
    *   *Image* : Enlever les pierres et les ronces du champ avant de semer.
    *   *Quand ?* Au début, ou quand une objection surgit.

2.  **E - Évangélisation** : C'est la "semence".
    *   *But* : Annoncer le Kérygme (Jésus mort et ressuscité pour nous sauver).
    *   *Action* : Inviter à une rencontre personnelle avec le Christ.
    *   *Quand ?* Une fois que la personne est ouverte et que les préjugés sont tombés. L'apologétique sans évangélisation est stérile (on gagne un débat, on perd une âme).

3.  **C - Catéchèse** : C'est la "croissance".
    *   *But* : Enseigner la foi en profondeur (Sacrements, Morale, Trinité...).
    *   *Quand ?* Après la conversion initiale, pour nourrir la foi.

**Erreur classique** : Commencer par la catéchèse ("Voici comment marche la Trinité") avec quelqu'un qui a des obstacles apologétiques ("Dieu n'existe pas"). Il faut respecter l'ordre des besoins de la personne.`,
                pointsCles: [
                    "Apologétique = Déminer (Préparer)",
                    "Évangélisation = Semer (Annoncer le Christ)",
                    "Catéchèse = Nourrir (Enseigner)",
                    "Adapter l'outil au besoin du moment",
                ],
                versets: [
                    {
                        reference: "1 Corinthiens 3:6",
                        texte: "J'ai planté, Apollos a arrosé, mais Dieu a fait croître.",
                    }
                ],
                quiz: [
                    {
                        question: "Quelle est l'étape qui 'enlève les pierres' du chemin ?",
                        options: ["Catéchèse", "Apologétique", "Évangélisation", "Liturgie"],
                        reponseIndex: 1,
                        explication: "L'apologétique prépare le terrain en retirant les obstacles rationnels ou émotionnels.",
                    },
                    {
                        question: "L'annonce du cœur de la foi (Jésus Sauveur) s'appelle...",
                        options: ["Le Dogme", "Le Kérygme", "Le Droit Canon", "L'Exégèse"],
                        reponseIndex: 1,
                        explication: "Le Kérygme est la proclamation première et essentielle du salut en Jésus-Christ (Évangélisation).",
                    },
                    {
                        question: "Faire de la catéchèse à un athée militant est souvent...",
                        options: ["Efficace", "Prématuré", "Nécessaire", "Interdit"],
                        reponseIndex: 1,
                        explication: "C'est prématuré. Il faut d'abord traiter les questions apologétiques (existence de Dieu) avant d'expliquer les détails de la foi.",
                    }
                ],
                flashcards: [
                    { recto: "Rôle de l'Apologétique", verso: "Lever les obstacles (Déminer)" },
                    { recto: "Rôle de l'Évangélisation", verso: "Annoncer Jésus (Semer)" },
                    { recto: "Rôle de la Catéchèse", verso: "Enseigner la doctrine (Nourrir)" }
                ],
            },
            {
                slug: "approches",
                ordre: 6,
                titre: "Les 3 Stratégies de Dialogue",
                sousTitre: "Tête-à-tête, Côte-à-côte, Recul",
                icon: "🤝",
                contenu: `Comment aborder une conversation ? Tout dépend de l'ouverture de votre interlocuteur. Voici 3 stratégies :

1.  **Le Tête-à-tête (Débat bienveillant)** :
    *   *Contexte* : L'autre est ouvert, pose des questions franches, veut comprendre.
    *   *Action* : Vous apportez des réponses directes. C'est un échange d'arguments.
    *   *Risque* : Que cela tourne à l'affrontement d'egos. Restez humble.

2.  **Le Côte-à-côte (Recherche commune)** :
    *   *Contexte* : L'autre est sceptique mais pas hostile.
    *   *Action* : "C'est une excellente question. Je ne suis pas sûr d'avoir la réponse parfaite, mais cherchons ensemble." Vous vous mettez de son côté face à la vérité. Cela désarme l'hostilité.

3.  **Le Recul (La méthode Socratique)** :
    *   *Contexte* : L'autre est hostile, agressif, ou sûr de lui.
    *   *Action* : Ne donnez AUCUNE réponse. Posez seulement des questions pour lui faire réaliser les failles de sa logique.
    *   *Exemple* : "Dieu est un tyran !" -> "Ah bon ? Quelle est ta définition d'un tyran ? Et en quoi Jésus correspond-il à cette définition ?"
    *   Cela oblige l'autre à réfléchir plutôt qu'à répéter des slogans.`,
                pointsCles: [
                    "Adapter la stratégie à l'ouverture de l'autre",
                    "Tête-à-tête = pour ceux qui cherchent la vérité",
                    "Côte-à-côte = pour les hésitants",
                    "Recul (Questions) = pour les hostiles",
                ],
                versets: [
                    {
                        reference: "Colossiens 4:6",
                        texte: "Que votre parole soit toujours accompagnée de grâce, assaisonnée de sel, afin que vous sachiez comment il faut répondre à chacun.",
                    }
                ],
                quiz: [
                    {
                        question: "Quelle méthode utiliser face à quelqu'un de très agressif ?",
                        options: ["Lui crier dessus", "Tête-à-tête (arguments massifs)", "Recul (poser des questions)", "Fuir"],
                        reponseIndex: 2,
                        explication: "Poser des questions (Recul) permet de ne pas offrir de prise à l'agressivité et force l'autre à justifier sa position.",
                    },
                    {
                        question: "L'approche 'Côte-à-côte' consiste à...",
                        options: ["Ignorer la question", "Chercher la vérité ensemble", "Imposer sa vérité", "Changer de sujet"],
                        reponseIndex: 1,
                        explication: "C'est une démarche d'accompagnement : 'Regardons cela ensemble'. Crée une alliance.",
                    },
                    {
                        question: "Le but de la méthode socratique (Recul) est...",
                        options: ["D'humilier l'autre", "De montrer sa culture", "D'aider l'autre à voir ses propres contradictions", "De gagner du temps"],
                        reponseIndex: 2,
                        explication: "Comme Socrate, on pose des questions pour que la vérité émerge de l'interlocuteur (maïeutique).",
                    }
                ],
                flashcards: [
                    { recto: "Stratégie pour interlocuteur ouvert ?", verso: "Tête-à-tête (Réponses directes)" },
                    { recto: "Stratégie pour interlocuteur hostile ?", verso: "Recul (Poser des questions)" },
                    { recto: "But des questions (Recul)", verso: "Révéler les contradictions internes" }
                ],
            },
            {
                slug: "ecoute-empathie",
                ordre: 7,
                titre: "L'Art de l'Écoute",
                sousTitre: "Gagner la personne avant de gagner l'argument",
                icon: "👂",
                contenu: `On dit souvent que "personne ne se soucie de ce que vous savez tant qu'ils ne savent pas que vous vous souciez d'eux". En apologétique, l'attitude compte à 80%.

**L'Écoute Active :**
La plupart des gens n'écoutent pas pour comprendre, ils écoutent pour répondre.
*   Ne préparez pas votre contre-attaque pendant que l'autre parle.
*   Reformulez : "Si je comprends bien, ce qui te gêne avec l'Église, c'est..."
*   Validez l'émotion : "Je comprends que cela te mette en colère."

**Pourquoi ça marche ?**
Quand quelqu'un se sent vraiment écouté et compris, il baisse ses défenses. Il vous donne alors la "permission" de parler à votre tour.
Vous créez un "compte en banque émotionnel". Chaque moment d'écoute est un dépôt. Quand vous devrez dire une vérité difficile (retrait), vous aurez assez de crédit pour qu'elle soit acceptée.

**L'humilité :**
Admettez quand vous ne savez pas. "C'est une très bonne question. Je ne connais pas la réponse exacte, mais je vais faire des recherches et on en reparle." C'est une preuve d'honnêteté qui renforce votre crédibilité.`,
                pointsCles: [
                    "Écouter pour comprendre, pas pour répondre",
                    "Reformuler pour valider la compréhension",
                    "La relation précède la transmission",
                    "Admettre son ignorance est une force",
                ],
                versets: [
                    {
                        reference: "Jacques 1:19",
                        texte: "Que tout homme soit prompt à écouter, lent à parler, lent à se mettre en colère.",
                    },
                    {
                        reference: "Proverbes 18:13",
                        texte: "Celui qui répond avant d'avoir écouté fait un acte de folie et s'attire la confusion.",
                    }
                ],
                quiz: [
                    {
                        question: "Quelle est l'erreur d'écoute la plus fréquente ?",
                        options: ["S'endormir", "Écouter pour préparer sa réponse", "Prendre des notes", "Regarder ailleurs"],
                        reponseIndex: 1,
                        explication: "On est souvent concentré sur notre future réplique au lieu de vraiment comprendre la pensée de l'autre.",
                    },
                    {
                        question: "Que faire si on ne connaît pas la réponse ?",
                        options: ["Inventer quelque chose", "Changer de sujet", "Admettre humblement et chercher plus tard", "Dire que c'est un mystère"],
                        reponseIndex: 2,
                        explication: "L'honnêteté bâtit la confiance. L'invention ou l'esquive la détruit.",
                    },
                    {
                        question: "Quel est l'effet de la reformulation ('Si je comprends bien...') ?",
                        options: ["Ça énerve l'autre", "Ça montre qu'on a écouté et valide la compréhension", "Ça fait perdre du temps", "Ça montre qu'on est sourd"],
                        reponseIndex: 1,
                        explication: "La reformulation est l'outil n°1 de l'écoute active. Elle apaise et clarifie.",
                    }
                ],
                flashcards: [
                    { recto: "Règle d'or de l'écoute (Jacques 1:19)", verso: "Prompt à écouter, lent à parler" },
                    { recto: "Reformuler sert à...", verso: "Vérifier qu'on a bien compris et valider l'autre" },
                    { recto: "Si je ne sais pas répondre ?", verso: "J'admets, je cherche, je reviens vers toi" }
                ],
            },
            {
                slug: "conclusion",
                ordre: 8,
                titre: "Vivre l'Apologétique",
                sousTitre: "Synthèse et appel à l'action",
                icon: "🎯",
                contenu: `Félicitations, vous avez terminé ce parcours d'initiation !
L'apologétique n'est pas un sport intellectuel, c'est un service de charité. C'est aimer son prochain au point de vouloir partager avec lui le trésor de la Vérité.

**Les 3 Piliers de l'Apologiste :**
1.  **Priere** : Sans l'Esprit Saint, nos arguments sonnent creux. Priez pour les personnes que vous rencontrez. Priez avant, pendant, et après les discussions.
2.  **Formation** : Continuez à lire, étudier le Catéchisme (CEC), la Bible, les Pères de l'Église. On ne donne bien que ce qu'on possède bien.
3.  **Charité** : "La vérité sans charité est une idole qui tue." (inspiré de St Augustin). Votre but n'est pas d'avoir raison, mais d'aimer.

**Votre mission :**
Ne cherchez pas les grands débats. Cherchez les opportunités quotidiennes. Une question d'un collègue, une remarque d'un ami... Soyez des "sememeurs" de vérité, avec le sourire et la paix du cœur.

Comme disait Mère Teresa : "Dieu ne nous demande pas de réussir, mais d'être fidèles."`,
                pointsCles: [
                    "L'apologétique est un acte de charité (Amour)",
                    "3 Piliers : Prière, Formation, Charité",
                    "Vérité sans charité = orgueil",
                    "Fidélité > Succès immédiat",
                ],
                versets: [
                    {
                        reference: "2 Timothée 2:24-25",
                        texte: "Il ne faut pas qu'un serviteur du Seigneur ait des querelles ; il doit, au contraire, avoir de la condescendance pour tous, être propre à enseigner, doué de patience ; il doit redresser avec douceur les adversaires...",
                    },
                    {
                        reference: "Matthieu 5:16",
                        texte: "Que votre lumière luise ainsi devant les hommes, afin qu'ils voient vos bonnes œuvres, et qu'ils glorifient votre Père qui est dans les cieux.",
                    }
                ],
                quiz: [
                    {
                        question: "Selon la conclusion, la vérité sans charité est...",
                        options: ["Suffisante", "Efficace", "Une idole qui tue", "Impossible"],
                        reponseIndex: 2,
                        explication: "Si on assène la vérité sans amour, on blesse l'autre et on défigure le visage du Christ.",
                    },
                    {
                        question: "Quel est le rôle de la prière en apologétique ?",
                        options: ["Optionnel", "Essentiel, car c'est Dieu qui convertit", "Seulement si on perd le débat", "Inutile"],
                        reponseIndex: 1,
                        explication: "Nous ne sommes que des instruments. C'est l'Esprit Saint qui touche les cœurs.",
                    },
                    {
                        question: "Que demande Dieu selon Mère Teresa ?",
                        options: ["De réussir à tout prix", "De convertir le monde entier", "D'être fidèles", "D'avoir 20/20 au quiz"],
                        reponseIndex: 2,
                        explication: "Le succès (la conversion) appartient à Dieu. Notre part est la fidélité au témoignage.",
                    }
                ],
                flashcards: [
                    { recto: "Vérité + Charité = ?", verso: "Évangélisation authentique" },
                    { recto: "Vérité - Charité = ?", verso: "Orgueil / Brutalité" },
                    { recto: "Les 3 piliers de l'apologiste", verso: "Prière, Formation, Charité" }
                ],
            },
        ];

        let count = 0;
        for (const lesson of lessons) {
            // Upsert logic
            const existing = await ctx.db
                .query("apologetiqueCours")
                .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
                .first();

            if (existing) {
                await ctx.db.replace(existing._id, lesson);
            } else {
                await ctx.db.insert("apologetiqueCours", lesson);
            }
            count++;
        }

        return `Updated/Seeded ${count} course lessons with rich content`;
    },
});
