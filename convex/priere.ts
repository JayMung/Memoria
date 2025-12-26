import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ========== PRIÈRES TRADITIONNELLES ==========

export const listPrieres = query({
    handler: async (ctx) => {
        const prieres = await ctx.db.query("prieres").collect();
        return prieres.sort((a, b) => a.ordre - b.ordre);
    },
});

export const getPriere = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("prieres")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

// ========== ROSAIRE ==========

export const listMysteres = query({
    handler: async (ctx) => {
        const mysteres = await ctx.db.query("mysteresRosaire").collect();
        return mysteres.sort((a, b) => {
            const serieOrder = { joyeux: 1, lumineux: 2, douloureux: 3, glorieux: 4 };
            const serieComp = (serieOrder[a.serie as keyof typeof serieOrder] || 0) -
                (serieOrder[b.serie as keyof typeof serieOrder] || 0);
            if (serieComp !== 0) return serieComp;
            return a.ordre - b.ordre;
        });
    },
});

export const getMysteresBySerie = query({
    args: { serie: v.string() },
    handler: async (ctx, args) => {
        const mysteres = await ctx.db
            .query("mysteresRosaire")
            .withIndex("by_serie", (q) => q.eq("serie", args.serie))
            .collect();
        return mysteres.sort((a, b) => a.ordre - b.ordre);
    },
});

// ========== SESSIONS DE PRIÈRE ==========

export const getUserPrayerSessions = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();
        if (!user) return [];

        return await ctx.db
            .query("prayerSessions")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(50);
    },
});

export const savePrayerSession = mutation({
    args: {
        type: v.string(),
        details: v.optional(v.string()),
        durationMinutes: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();
        if (!user) throw new Error("User not found");

        return await ctx.db.insert("prayerSessions", {
            userId: user._id,
            type: args.type,
            details: args.details,
            completedAt: Date.now(),
            durationMinutes: args.durationMinutes,
        });
    },
});

// ========== EXAMEN DE CONSCIENCE ==========

export const getExamenHistory = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();
        if (!user) return [];

        return await ctx.db
            .query("examenConscience")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(30);
    },
});

export const saveExamen = mutation({
    args: {
        pechesIds: v.array(v.string()),
        generatedPrayer: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();
        if (!user) throw new Error("User not found");

        // Also save as a prayer session
        await ctx.db.insert("prayerSessions", {
            userId: user._id,
            type: "examen",
            details: JSON.stringify({ pechesCount: args.pechesIds.length }),
            completedAt: Date.now(),
        });

        return await ctx.db.insert("examenConscience", {
            userId: user._id,
            date: Date.now(),
            pechesIds: args.pechesIds,
            generatedPrayer: args.generatedPrayer,
            completed: true,
        });
    },
});

// ========== LECTIO DIVINA ==========

export const getLectioDivinaHistory = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();
        if (!user) return [];

        return await ctx.db
            .query("lectioDivina")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(30);
    },
});

export const saveLectioDivina = mutation({
    args: {
        passage: v.string(),
        lectio: v.optional(v.string()),
        meditatio: v.optional(v.string()),
        oratio: v.optional(v.string()),
        contemplatio: v.optional(v.string()),
        actio: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();
        if (!user) throw new Error("User not found");

        // Also save as a prayer session
        await ctx.db.insert("prayerSessions", {
            userId: user._id,
            type: "lectio",
            details: args.passage,
            completedAt: Date.now(),
        });

        return await ctx.db.insert("lectioDivina", {
            userId: user._id,
            date: Date.now(),
            passage: args.passage,
            lectio: args.lectio,
            meditatio: args.meditatio,
            oratio: args.oratio,
            contemplatio: args.contemplatio,
            actio: args.actio,
        });
    },
});

// ========== SEED DATA ==========

export const seedPrieres = mutation({
    handler: async (ctx) => {
        // Prières traditionnelles
        const prieres = [
            {
                slug: "notre-pere",
                titre: "Notre Père",
                categorie: "base",
                icon: "🙏",
                ordre: 1,
                texte: `Notre Père, qui es aux cieux,
que ton nom soit sanctifié,
que ton règne vienne,
que ta volonté soit faite sur la terre comme au ciel.

Donne-nous aujourd'hui notre pain de ce jour.
Pardonne-nous nos offenses,
comme nous pardonnons aussi à ceux qui nous ont offensés.
Et ne nous laisse pas entrer en tentation,
mais délivre-nous du Mal.

Amen.`,
                texteLatinOptional: `Pater noster, qui es in cælis,
sanctificetur nomen tuum.
Adveniat regnum tuum.
Fiat voluntas tua, sicut in cælo, et in terra.

Panem nostrum quotidianum da nobis hodie,
et dimitte nobis debita nostra,
sicut et nos dimittimus debitoribus nostris.
Et ne nos inducas in tentationem,
sed libera nos a malo.

Amen.`,
            },
            {
                slug: "je-vous-salue-marie",
                titre: "Je vous salue Marie",
                categorie: "marie",
                icon: "🌹",
                ordre: 2,
                texte: `Je vous salue, Marie, pleine de grâce,
le Seigneur est avec vous.
Vous êtes bénie entre toutes les femmes,
et Jésus, le fruit de vos entrailles, est béni.

Sainte Marie, Mère de Dieu,
priez pour nous, pauvres pécheurs,
maintenant et à l'heure de notre mort.

Amen.`,
                texteLatinOptional: `Ave Maria, gratia plena,
Dominus tecum.
Benedicta tu in mulieribus,
et benedictus fructus ventris tui, Iesus.

Sancta Maria, Mater Dei,
ora pro nobis peccatoribus,
nunc et in hora mortis nostræ.

Amen.`,
            },
            {
                slug: "gloire-au-pere",
                titre: "Gloire au Père",
                categorie: "base",
                icon: "✨",
                ordre: 3,
                texte: `Gloire au Père, et au Fils, et au Saint-Esprit.
Comme il était au commencement, maintenant et toujours,
pour les siècles des siècles.

Amen.`,
                texteLatinOptional: `Gloria Patri, et Filio, et Spiritui Sancto.
Sicut erat in principio, et nunc, et semper,
et in sæcula sæculorum.

Amen.`,
            },
            {
                slug: "credo",
                titre: "Symbole des Apôtres (Credo)",
                categorie: "base",
                icon: "✝️",
                ordre: 4,
                texte: `Je crois en Dieu, le Père tout-puissant,
Créateur du ciel et de la terre.

Et en Jésus-Christ, son Fils unique, notre Seigneur,
qui a été conçu du Saint-Esprit,
est né de la Vierge Marie,
a souffert sous Ponce Pilate,
a été crucifié, est mort et a été enseveli,
est descendu aux enfers,
le troisième jour est ressuscité des morts,
est monté aux cieux,
est assis à la droite de Dieu le Père tout-puissant,
d'où il viendra juger les vivants et les morts.

Je crois en l'Esprit Saint,
à la sainte Église catholique,
à la communion des saints,
à la rémission des péchés,
à la résurrection de la chair,
à la vie éternelle.

Amen.`,
            },
            {
                slug: "salve-regina",
                titre: "Salve Regina",
                categorie: "marie",
                icon: "👑",
                ordre: 5,
                texte: `Salut, ô Reine, Mère de miséricorde,
notre vie, notre douceur et notre espérance, salut !
Enfants d'Ève, exilés, nous crions vers vous.
Vers vous nous soupirons, gémissant et pleurant
dans cette vallée de larmes.

Ô vous, notre avocate,
tournez vers nous vos regards miséricordieux,
et, après cet exil, montrez-nous Jésus,
le fruit béni de vos entrailles.

Ô clémente, ô miséricordieuse, ô douce Vierge Marie.

Amen.`,
                texteLatinOptional: `Salve, Regina, Mater misericordiæ,
vita, dulcedo et spes nostra, salve.
Ad te clamamus, exsules filii Evæ.
Ad te suspiramus, gementes et flentes
in hac lacrimarum valle.

Eia ergo, advocata nostra,
illos tuos misericordes oculos ad nos converte.
Et Iesum, benedictum fructum ventris tui,
nobis, post hoc exsilium, ostende.

O clemens, o pia, o dulcis Virgo Maria.

Amen.`,
            },
            {
                slug: "acte-contrition",
                titre: "Acte de Contrition",
                categorie: "base",
                icon: "💔",
                ordre: 6,
                texte: `Mon Dieu, j'ai un très grand regret de vous avoir offensé,
parce que vous êtes infiniment bon, infiniment aimable,
et que le péché vous déplaît.

Je prends la ferme résolution,
avec le secours de votre sainte grâce,
de ne plus vous offenser
et de faire pénitence.

Amen.`,
            },
            {
                slug: "saint-michel",
                titre: "Prière à Saint Michel",
                categorie: "saints",
                icon: "⚔️",
                ordre: 7,
                texte: `Saint Michel Archange,
défendez-nous dans le combat,
soyez notre secours contre la malice et les embûches du démon.

Que Dieu exerce sur lui son empire, nous vous en supplions.

Et vous, Prince de la milice céleste,
par la puissance divine,
refoulez en enfer Satan et les autres esprits mauvais
qui rôdent dans le monde pour la perte des âmes.

Amen.`,
            },
            {
                slug: "angelus",
                titre: "Angélus",
                categorie: "liturgie",
                icon: "🔔",
                ordre: 8,
                texte: `V. L'ange du Seigneur apporta l'annonce à Marie.
R. Et elle conçut du Saint-Esprit.

Je vous salue, Marie...

V. Voici la servante du Seigneur.
R. Qu'il me soit fait selon votre parole.

Je vous salue, Marie...

V. Et le Verbe s'est fait chair.
R. Et il a habité parmi nous.

Je vous salue, Marie...

V. Priez pour nous, sainte Mère de Dieu.
R. Afin que nous devenions dignes des promesses du Christ.

Prions.
Que ta grâce, Seigneur notre Père, se répande en nos cœurs :
Par le message de l'ange, tu nous as fait connaître l'Incarnation de ton Fils bien-aimé ;
conduis-nous par sa passion et par sa croix, à la gloire de la résurrection.
Par Jésus, le Christ, notre Seigneur.

Amen.`,
            },
        ];

        // Mystères du Rosaire
        const mysteres = [
            // Mystères Joyeux (Lundi, Samedi)
            {
                slug: "annonciation",
                serie: "joyeux",
                ordre: 1,
                titre: "L'Annonciation",
                fruit: "L'humilité",
                reference: "Lc 1, 26-38",
                meditation: "L'ange Gabriel annonce à Marie qu'elle sera la mère du Sauveur. Marie, dans son humilité, accepte la volonté de Dieu : « Voici la servante du Seigneur ; qu'il me soit fait selon ta parole. »",
            },
            {
                slug: "visitation",
                serie: "joyeux",
                ordre: 2,
                titre: "La Visitation",
                fruit: "La charité fraternelle",
                reference: "Lc 1, 39-56",
                meditation: "Marie visite sa cousine Élisabeth. Jean-Baptiste tressaille dans le sein de sa mère, reconnaissant la présence du Sauveur. Marie proclame le Magnificat.",
            },
            {
                slug: "nativite",
                serie: "joyeux",
                ordre: 3,
                titre: "La Nativité",
                fruit: "L'esprit de pauvreté",
                reference: "Lc 2, 1-20",
                meditation: "Jésus naît à Bethléem dans une crèche. Les bergers viennent l'adorer, guidés par les anges. Dieu se fait petit pour nous.",
            },
            {
                slug: "presentation",
                serie: "joyeux",
                ordre: 4,
                titre: "La Présentation au Temple",
                fruit: "L'obéissance",
                reference: "Lc 2, 22-40",
                meditation: "Marie et Joseph présentent Jésus au Temple. Siméon reconnaît en lui la lumière des nations et annonce à Marie qu'un glaive lui transpercera l'âme.",
            },
            {
                slug: "recouvrement",
                serie: "joyeux",
                ordre: 5,
                titre: "Le Recouvrement au Temple",
                fruit: "La recherche de Dieu",
                reference: "Lc 2, 41-52",
                meditation: "À 12 ans, Jésus reste au Temple de Jérusalem. Ses parents le cherchent pendant trois jours et le trouvent enseignant les docteurs de la Loi.",
            },
            // Mystères Lumineux (Jeudi)
            {
                slug: "bapteme",
                serie: "lumineux",
                ordre: 1,
                titre: "Le Baptême de Jésus",
                fruit: "La fidélité aux promesses du baptême",
                reference: "Mt 3, 13-17",
                meditation: "Jésus est baptisé par Jean dans le Jourdain. L'Esprit descend sur lui comme une colombe, et la voix du Père proclame : « Celui-ci est mon Fils bien-aimé. »",
            },
            {
                slug: "cana",
                serie: "lumineux",
                ordre: 2,
                titre: "Les Noces de Cana",
                fruit: "La confiance en Marie",
                reference: "Jn 2, 1-12",
                meditation: "À la demande de Marie, Jésus accomplit son premier miracle : il change l'eau en vin. Marie dit aux serviteurs : « Faites tout ce qu'il vous dira. »",
            },
            {
                slug: "annonce-royaume",
                serie: "lumineux",
                ordre: 3,
                titre: "L'Annonce du Royaume",
                fruit: "La conversion",
                reference: "Mc 1, 14-15",
                meditation: "Jésus proclame la Bonne Nouvelle : « Le temps est accompli et le Royaume de Dieu est tout proche : repentez-vous et croyez à l'Évangile. »",
            },
            {
                slug: "transfiguration",
                serie: "lumineux",
                ordre: 4,
                titre: "La Transfiguration",
                fruit: "Le désir du ciel",
                reference: "Mt 17, 1-9",
                meditation: "Sur le mont Thabor, Jésus révèle sa gloire à Pierre, Jacques et Jean. Son visage resplendit comme le soleil, et Moïse et Élie apparaissent avec lui.",
            },
            {
                slug: "eucharistie",
                serie: "lumineux",
                ordre: 5,
                titre: "L'Institution de l'Eucharistie",
                fruit: "L'amour de l'Eucharistie",
                reference: "Mt 26, 26-29",
                meditation: "Au cours de la Cène, Jésus prend le pain et le vin et les donne à ses disciples : « Ceci est mon corps... Ceci est mon sang. Faites cela en mémoire de moi. »",
            },
            // Mystères Douloureux (Mardi, Vendredi)
            {
                slug: "agonie",
                serie: "douloureux",
                ordre: 1,
                titre: "L'Agonie à Gethsémani",
                fruit: "Le regret des péchés",
                reference: "Mt 26, 36-46",
                meditation: "Jésus prie au Jardin des Oliviers. Dans son angoisse, il sue du sang, mais il accepte la volonté du Père : « Non pas ce que je veux, mais ce que tu veux. »",
            },
            {
                slug: "flagellation",
                serie: "douloureux",
                ordre: 2,
                titre: "La Flagellation",
                fruit: "La mortification des sens",
                reference: "Jn 19, 1",
                meditation: "Pilate fait flageller Jésus. Il endure cette souffrance sans se plaindre, par amour pour nous et pour expier nos péchés de la chair.",
            },
            {
                slug: "couronnement-epines",
                serie: "douloureux",
                ordre: 3,
                titre: "Le Couronnement d'épines",
                fruit: "Le courage",
                reference: "Mt 27, 27-31",
                meditation: "Les soldats tressent une couronne d'épines et la placent sur la tête de Jésus, le moquant comme « Roi des Juifs ». Il accepte cette humiliation pour notre orgueil.",
            },
            {
                slug: "portement-croix",
                serie: "douloureux",
                ordre: 4,
                titre: "Le Portement de la Croix",
                fruit: "La patience",
                reference: "Jn 19, 17",
                meditation: "Jésus porte sa croix vers le Golgotha. Simon de Cyrène l'aide à la porter. Chaque pas est une leçon d'amour et de persévérance.",
            },
            {
                slug: "crucifixion",
                serie: "douloureux",
                ordre: 5,
                titre: "La Crucifixion",
                fruit: "L'amour de Dieu et du prochain",
                reference: "Jn 19, 18-30",
                meditation: "Jésus est cloué sur la croix. Il pardonne à ses bourreaux, confie Marie à Jean, et remet son esprit au Père. « Tout est accompli. »",
            },
            // Mystères Glorieux (Mercredi, Dimanche)
            {
                slug: "resurrection",
                serie: "glorieux",
                ordre: 1,
                titre: "La Résurrection",
                fruit: "La foi",
                reference: "Mt 28, 1-10",
                meditation: "Au matin de Pâques, Jésus ressuscite d'entre les morts. Le tombeau est vide. L'ange annonce aux femmes : « Il n'est pas ici, il est ressuscité ! »",
            },
            {
                slug: "ascension",
                serie: "glorieux",
                ordre: 2,
                titre: "L'Ascension",
                fruit: "L'espérance",
                reference: "Ac 1, 9-11",
                meditation: "Quarante jours après Pâques, Jésus monte au ciel sous les yeux des apôtres. Il promet d'envoyer l'Esprit Saint et de revenir à la fin des temps.",
            },
            {
                slug: "pentecote",
                serie: "glorieux",
                ordre: 3,
                titre: "La Pentecôte",
                fruit: "Les dons du Saint-Esprit",
                reference: "Ac 2, 1-13",
                meditation: "L'Esprit Saint descend sur les apôtres sous forme de langues de feu. Remplis de courage, ils proclament l'Évangile à toutes les nations.",
            },
            {
                slug: "assomption",
                serie: "glorieux",
                ordre: 4,
                titre: "L'Assomption de Marie",
                fruit: "La grâce d'une bonne mort",
                reference: "Ap 12, 1",
                meditation: "Marie, au terme de sa vie terrestre, est élevée corps et âme dans la gloire du ciel. Elle est la première à participer pleinement à la résurrection de son Fils.",
            },
            {
                slug: "couronnement-marie",
                serie: "glorieux",
                ordre: 5,
                titre: "Le Couronnement de Marie",
                fruit: "La dévotion à Marie",
                reference: "Ap 12, 1",
                meditation: "Marie est couronnée Reine du Ciel et de la Terre. Elle intercède pour nous auprès de son Fils, nous conduisant toujours vers lui.",
            },
        ];

        let count = 0;

        // Upsert prières
        for (const priere of prieres) {
            const existing = await ctx.db
                .query("prieres")
                .withIndex("by_slug", (q) => q.eq("slug", priere.slug))
                .first();
            if (existing) {
                await ctx.db.replace(existing._id, priere);
            } else {
                await ctx.db.insert("prieres", priere);
            }
            count++;
        }

        // Upsert mystères
        for (const mystere of mysteres) {
            const existing = await ctx.db
                .query("mysteresRosaire")
                .withIndex("by_slug", (q) => q.eq("slug", mystere.slug))
                .first();
            if (existing) {
                await ctx.db.replace(existing._id, mystere);
            } else {
                await ctx.db.insert("mysteresRosaire", mystere);
            }
            count++;
        }

        return `Seeded ${count} prayer items (prayers + mysteries)`;
    },
});
