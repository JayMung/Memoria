import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Categories disponibles
export const CATEGORIES = [
    { id: "sacrements", name: "Sacrements", icon: "🍞", color: "purple" },
    { id: "marie", name: "Marie", icon: "🌹", color: "pink" },
    { id: "eglise", name: "Eglise", icon: "⛪", color: "blue" },
    { id: "ecriture", name: "Ecriture", icon: "📖", color: "amber" },
    { id: "pratiques", name: "Pratiques", icon: "🙏", color: "green" },
    { id: "doctrines", name: "Doctrines", icon: "✝️", color: "red" },
];

// Query: List all fiches
export const list = query({
    handler: async (ctx) => {
        const fiches = await ctx.db.query("apologetiqueFiches").collect();
        return fiches.sort((a, b) => a.order - b.order);
    },
});

// Query: Get by category
export const getByCategory = query({
    args: { category: v.string() },
    handler: async (ctx, args) => {
        const fiches = await ctx.db
            .query("apologetiqueFiches")
            .withIndex("by_category", (q) => q.eq("category", args.category))
            .collect();
        return fiches.sort((a, b) => a.order - b.order);
    },
});

// Query: Get by slug
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("apologetiqueFiches")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

// Query: Get categories with counts
export const getCategoriesWithCounts = query({
    handler: async (ctx) => {
        const allFiches = await ctx.db.query("apologetiqueFiches").collect();

        return CATEGORIES.map(cat => ({
            ...cat,
            count: allFiches.filter(f => f.category === cat.id).length,
        }));
    },
});

// Mutation: Seed apologetique fiches (Upsert logic)
export const seed = mutation({
    handler: async (ctx) => {
        const fiches = [
            // SACREMENTS
            {
                slug: "eucharistie-presence-reelle",
                title: "L'Eucharistie - Presence Reelle",
                category: "sacrements",
                icon: "🍞",
                veriteCatholique: "Le pain et le vin deviennent reellement le Corps et le Sang du Christ lors de la consecration.",
                explication: "La transsubstantiation signifie que la substance du pain et du vin est changee en la substance du Corps et du Sang du Christ. C'est le meme sacrifice du Calvaire rendu present.",
                versetsAppui: [
                    { reference: "Jean 6:51", texte: "Je suis le pain vivant descendu du ciel... le pain que je donnerai, c'est mon corps." },
                    { reference: "Jean 6:53-56", texte: "Si vous ne mangez le corps du Fils de l'homme... vous n'avez pas la vie en vous." },
                    { reference: "1 Cor 11:27", texte: "Celui qui mange le pain indignement sera coupable envers le corps et le sang du Seigneur." },
                ],
                objections: [
                    { question: "C'est symbolique, 'la chair ne sert de rien' (Jn 6:63)", reponse: "Jesus parle ici de la chair humaine charnelle, pas de SA chair qu'il vient de dire etre 'vie pour le monde'. Si sa chair ne servait de rien, l'Incarnation serait inutile !" },
                    { question: "Le verbe 'est' veut dire 'represente'", reponse: "Dans le texte grec, quand Jesus dit 'Ceci est mon corps', il n'utilise jamais de terme de comparaison. En Jean 6, il utilise meme 'trogo' (macher/ronger) pour etre cruement realiste." }
                ],
                versetsCles: ["Jean 6:55", "1 Cor 11:27"],
                typologie: {
                    type: "La Manne au desert (Exode 16)",
                    antitype: "L'Eucharistie (Jean 6)",
                    reference: "Exode 16 / Jean 6:49-50",
                    explication: "La manne etait un pain descendu du ciel pour mourir dans le corps. L'Eucharistie est le vrai pain du ciel pour la vie eternelle."
                },
                resumeMemoriel: "Vraie nourriture - Typologie de la Manne - Realisme de Jean 6",
                order: 1,
            },
            {
                slug: "confession-pardon-peches",
                title: "La Confession",
                category: "sacrements",
                icon: "🔑",
                veriteCatholique: "Jesus a donne aux Apotres le pouvoir de pardonner les peches en son nom.",
                explication: "Seul Dieu pardonne les peches, mais il a choisi d'exercer ce pouvoir a travers le ministere des Apotres et de leurs successeurs (pretres).",
                versetsAppui: [
                    { reference: "Jean 20:23", texte: "Ceux a qui vous remettrez les peches, ils leur seront remis." },
                    { reference: "2 Cor 5:18", texte: "Dieu nous a confie le ministere de la reconciliation." },
                    { reference: "Jacques 5:16", texte: "Confessez vos peches les uns aux autres." }
                ],
                objections: [
                    { question: "Je me confesse directement a Dieu", reponse: "C'est bien, mais Jesus a institue un sacrement specifique en Jean 20:23. Il a donne un pouvoir reel aux hommes pour la certitude du pardon." }
                ],
                versetsCles: ["Jean 20:23"],
                resumeMemoriel: "Jean 20:23 : Le pouvoir de remettre les peches confie aux hommes",
                order: 2,
            },
            {
                slug: "bapteme-regeneration",
                title: "Le Bapteme & Regeneration",
                category: "sacrements",
                icon: "💧",
                veriteCatholique: "Le bapteme est necessaire au salut et opere une veritable regeneration spirituelle (nouvelle naissance), effacant le peche originel.",
                explication: "Ce n'est pas juste un symbole d'appartenance. C'est le moyen ordinaire par lequel Dieu nous communique la vie divine et nous sauve.",
                versetsAppui: [
                    { reference: "1 Pierre 3:21", texte: "Le bapteme, qui n'est pas la purification des souillures du corps... vous SAUVE maintenant." },
                    { reference: "Jean 3:5", texte: "Si un homme ne nait d'EAU et d'Esprit, il ne peut entrer dans le royaume de Dieu." },
                    { reference: "Actes 2:38", texte: "Repentez-vous et que chacun soit baptise... pour le pardon de vos peches." }
                ],
                objections: [
                    { question: "Le bapteme est juste une oeuvre, on est sauve par la foi seule", reponse: "La Bible dit explicitement 'Le bapteme vous sauve' (1 Pi 3:21). Ce n'est pas une oeuvre humaine, c'est une oeuvre de Dieu en nous." }
                ],
                versetsCles: ["1 Pierre 3:21", "Jean 3:5"],
                typologie: {
                    type: "L'Arche de Noe / Mer Rouge",
                    antitype: "Le Bapteme",
                    reference: "1 Pierre 3:20-21 / 1 Cor 10:1-2",
                    explication: "Noe a ete sauve 'a travers l'eau', tout comme le bapteme nous sauve du monde pecheur. La Mer Rouge a libere Israel de l'esclavage, le bapteme libere du peche."
                },
                resumeMemoriel: "Plus qu'un symbole : il SAUVE (1 Pi 3:21) et regenere (Jn 3:5)",
                order: 3,
            },
            // MARIE
            {
                slug: "marie-nouvelle-eve",
                title: "Marie, Nouvelle Eve",
                category: "marie",
                icon: "🌹",
                veriteCatholique: "Comme Eve a coopere a la chute par desobeissance, Marie a coopere a la Redemption par son obeissance (Fiat).",
                explication: "Marie est la femme dont la posterite ecrase la tete du serpent. Elle defait le noeud de la desobeissance d'Eve.",
                versetsAppui: [
                    { reference: "Genese 3:15", texte: "Je mettrai une inimitie entre toi et la femme, entre ta posterite et sa posterite." },
                    { reference: "Luc 1:38", texte: "Qu'il me soit fait selon ta parole." },
                    { reference: "Jean 2:4", texte: "Jesus l'appelle 'Femme' (revoquant Eve)." }
                ],
                objections: [
                    { question: "C'est faire de Marie une deesse", reponse: "Non, c'est reconnaitre le parallelisme biblique voulu par Dieu. Eve etait creature, Marie aussi. Mais Marie est la 'mere des vivants' dans l'ordre de la grace." }
                ],
                versetsCles: ["Genese 3:15", "Luc 1:38"],
                typologie: {
                    type: "Eve (Mere des vivants)",
                    antitype: "Marie (Mere de l'Eglise)",
                    reference: "Genese 3:20 / Jean 19:27",
                    explication: "Eve est sortie d'Adam, Jesus est sorti de Marie. Eve a ecoute l'ange dechu, Marie a ecoute l'ange Gabriel."
                },
                resumeMemoriel: "Eve a desobei, Marie a obei. Typologie fondamentale.",
                order: 4,
            },
            {
                slug: "marie-arche-alliance",
                title: "Marie, Arche d'Alliance",
                category: "marie",
                icon: "✨",
                veriteCatholique: "Marie est l'Arche de la Nouvelle Alliance, portant en elle la Parole de Dieu faite chair.",
                explication: "L'Arche contenait la Manne, la Loi et le Baton d'Aaron. Marie a porte Jesus : Pain de Vie, Loi Nouvelle, Pretre Eternel.",
                versetsAppui: [
                    { reference: "Luc 1:35", texte: "La puissance du Tres-Haut te couvrira de son ombre (meme verbe que pour l'Arche)." },
                    { reference: "Apocalypse 11:19", texte: "L'Arche de son alliance apparut... Et un grand signe apparut : une Femme..." },
                    { reference: "2 Samuel 6:9 vs Luc 1:43", texte: "David : 'Comment l'arche vient-elle chez moi?' / Elisabeth : 'Comment la mere de mon Seigneur vient-elle chez moi?'" }
                ],
                objections: [
                    { question: "Marie n'est qu'une femme ordinaire", reponse: "Dieu ne choisit pas n'importe quel vase pour son Fils. L'Arche de l'Ancien Testament etait sacree et intouchable (Uzzah est mort pour l'avoir touchee). Marie est la Nouvelle Arche, encore plus sainte." }
                ],
                versetsCles: ["Apocalypse 11:19", "Luc 1:35"],
                typologie: {
                    type: "Arche d'Alliance (Exode 25)",
                    antitype: "Marie (Luc 1)",
                    reference: "Exode 40:35 / Luc 1:35",
                    explication: "La Gloire (Shekinah) couvrait l'Arche. L'Esprit Saint couvre Marie."
                },
                resumeMemoriel: "Marie porte Jesus comme l'Arche portait la Parole.",
                order: 5,
            },
            // EGLISE & DOCTRINE
            {
                slug: "papaute-pierres",
                title: "La Papaute & Les Clefs",
                category: "eglise",
                icon: "🔑",
                veriteCatholique: "Pierre est le Rocher sur lequel l'Eglise est batie. Il a recu les clefs du Royaume, symbole d'autorite royale deleguee.",
                explication: "Jesus etablit une structure visible pour son Eglise pour garantir l'unite et la verite a travers les siecles.",
                versetsAppui: [
                    { reference: "Matthieu 16:18-19", texte: "Tu es Pierre et sur cette pierre je batirai mon Eglise... Je te donnerai les clefs." },
                    { reference: "Jean 21:15-17", texte: "Pais mes agneaux, pais mes brebis." },
                    { reference: "Isaie 22:22", texte: "Je mettrai la clef de la maison de David sur son epaule." }
                ],
                objections: [
                    { question: "Le Rocher c'est Jesus, pas Pierre", reponse: "Jesus est le fondement invisible, mais il etablit Pierre comme fondement visible. Il change son nom de Simon a Kephas (Roc) expres. Isaie 22 montre que les 'clefs' designent un office de Premier Ministre." }
                ],
                versetsCles: ["Matthieu 16:18", "Isaie 22:22"],
                typologie: {
                    type: "Eliakim (Premier Ministre)",
                    antitype: "Pierre (Pape)",
                    reference: "Isaie 22:20-22",
                    explication: "Eliakim a recu les clefs de la maison de David pour gouverner au nom du Roi. Pierre recoit les clefs du Royaume pour gouverner au nom du Roi Jesus."
                },
                resumeMemoriel: "Les Clefs du Royaume = Office d'autorite (Isaie 22)",
                order: 6,
            },
            {
                slug: "justification-foi-oeuvres",
                title: "Foi & Oeuvres",
                category: "doctrines",
                icon: "⚖️",
                veriteCatholique: "Nous sommes sauves par la grace, par le moyen de la foi QUI AGIT par la charite. La 'Foi Seule' (Sola Fide) est une doctrine non biblique.",
                explication: "La seule fois ou 'foi seule' apparait dans la Bible, c'est pour dire que 'l'homme N'EST PAS justifie par la foi seule' (Jacques 2:24).",
                versetsAppui: [
                    { reference: "Jacques 2:24", texte: "Vous voyez que l'homme est justifie par les oeuvres et NON PAR LA FOI SEULE." },
                    { reference: "Galates 5:6", texte: "Ce qui compte... c'est la foi agissant par la charite." },
                    { reference: "Matthieu 25:31-46", texte: "Le Jugement dernier est base sur les oeuvres (j'ai eu faim, vous m'avez donne a manger)." }
                ],
                objections: [
                    { question: "Paul dit qu'on est sauve par la foi sans les oeuvres de la loi", reponse: "Paul parle des 'oeuvres de la Loi' (circoncision, rituels mosaiques), pas des bonnes oeuvres de la charite chretienne. Jacques clarifie cela." }
                ],
                versetsCles: ["Jacques 2:24", "Matthieu 25:40"],
                resumeMemoriel: "Jacques 2:24 : Non par la foi seule. La foi sans œuvres est morte.",
                order: 7,
            },
            {
                slug: "sola-scriptura-refutation",
                title: "Contre Sola Scriptura",
                category: "ecriture",
                icon: "📜",
                veriteCatholique: "La Bible seule ne suffit pas. L'Eglise est la 'colonne et le soutien de la verite'. La Tradition apostolique est necessaire pour interpreter la Bible et definir le Canon.",
                explication: "La Bible ne contient pas sa propre table des matieres. C'est la Tradition de l'Eglise qui a defini quels livres sont bibliques.",
                versetsAppui: [
                    { reference: "1 Timothee 3:15", texte: "L'Eglise est la colonne et le soutien de la verite." },
                    { reference: "2 Thess 2:15", texte: "Gardez les Traditions que vous avez reçues." },
                    { reference: "2 Pierre 3:16", texte: "Il y a dans les epitres de Paul des points difficiles... que les ignorants tordent pour leur ruine." }
                ],
                objections: [
                    { question: "La Bible est la seule autorite infaillible", reponse: "La Bible ne dit jamais cela ! Elle dit que toute Ecriture est utile, pas qu'elle est SUFFISANTE seule. Jesus n'a rien ecrit, il a fonde une Eglise." }
                ],
                versetsCles: ["1 Tim 3:15", "2 Thess 2:15"],
                resumeMemoriel: "L'Eglise est la colonne de la verite. Qui a defini le Canon ? L'Eglise.",
                order: 8,
            },
            {
                slug: "veneration-saints",
                title: "Veneration des Saints",
                category: "pratiques",
                icon: "🙏",
                veriteCatholique: "Prier les saints, c'est leur demander leur intercession, comme on demande a un ami de prier pour nous. Ils sont vivants en Christ et presentent nos prieres.",
                explication: "La 'communion des saints' signifie que la mort ne rompt pas le lien de charite entre les chretiens du ciel et de la terre.",
                versetsAppui: [
                    { reference: "Apocalypse 5:8", texte: "Les anciens... tenaient des coupes d'or pleines de parfums, qui sont les PRIERES DES SAINTS." },
                    { reference: "Hebreux 12:1", texte: "Entoures d'une si grande nuee de temoins." },
                    { reference: "2 Maccabees 15:14", texte: "Jérémie prie beaucoup pour le peuple." }
                ],
                objections: [
                    { question: "Il n'y a qu'un seul mediateur, Jesus (1 Tim 2:5)", reponse: "Unique mediateur de Redemption. Mais nous sommes tous mediateurs de priere les uns pour les autres. Les saints le font plus parfaitement." }
                ],
                versetsCles: ["Apocalypse 5:8", "Hebreux 12:1"],
                resumeMemoriel: "Apoc 5:8 : Les saints au ciel presentent nos prieres a Dieu.",
                order: 9,
            },
            {
                slug: "martin-luther-faits",
                title: "Martin Luther & Origines",
                category: "eglise",
                icon: "🏚️",
                veriteCatholique: "Le Protestantisme est une invention humaine du 16eme siecle. Jesus a promis que les portes de l'enfer ne prevaldraient pas contre son Eglise (celle de Pierre).",
                explication: "Martin Luther a supprime 7 livres de la Bible, a ajoute le mot 'seule' a Romains 3:28 dans sa traduction, et a rompu l'unite voulue par Christ.",
                versetsAppui: [
                    { reference: "Matthieu 16:18", texte: "Les portes de l'enfer ne prevaldront point contre elle." },
                    { reference: "Jean 17:21", texte: "Qu'ils soient UN... afin que le monde croie." },
                    { reference: "Galates 1:8", texte: "Si quelqu'un vous annonce un autre Evangile... qu'il soit anatheme." }
                ],
                objections: [
                    { question: "L'Eglise etait corrompue, il fallait la reformer", reponse: "Reformer les moeurs, oui (comme les vrais saints l'ont fait), mais pas changer la DOCTRINE et creer une nouvelle Eglise 1500 ans plus tard." }
                ],
                versetsCles: ["Matthieu 16:18", "Galates 1:8"],
                resumeMemoriel: "Une Eglise fondee en 1517 ne peut pas etre celle de Jesus (an 33).",
                order: 10,
            },
        ];

        let count = 0;
        for (const fiche of fiches) {
            // Check if exists
            const existing = await ctx.db
                .query("apologetiqueFiches")
                .withIndex("by_slug", (q) => q.eq("slug", fiche.slug))
                .first();

            if (existing) {
                // Update
                await ctx.db.replace(existing._id, fiche);
            } else {
                // Insert
                await ctx.db.insert("apologetiqueFiches", fiche);
            }
            count++;
        }

        return `Updated/Seeded ${count} fiches with typologies and new content`;
    },
});
