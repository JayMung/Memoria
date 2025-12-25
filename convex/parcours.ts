import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: List all parcours
export const list = query({
    handler: async (ctx) => {
        const parcours = await ctx.db.query("parcours").collect();
        return parcours.sort((a, b) => a.order - b.order);
    },
});

// Query: Get parcours by slug
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("parcours")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

// Query: Get user progress for a parcours
export const getUserProgress = query({
    args: { parcoursId: v.id("parcours"), userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("parcoursProgress")
            .withIndex("by_user_parcours", (q) =>
                q.eq("userId", args.userId).eq("parcoursId", args.parcoursId)
            )
            .first();
    },
});

// Query: Get all user parcours progress
export const getAllUserProgress = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("parcoursProgress")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

// Mutation: Start a parcours (create progress)
export const startParcours = mutation({
    args: { parcoursId: v.id("parcours"), userId: v.id("users") },
    handler: async (ctx, args) => {
        // Check if already started
        const existing = await ctx.db
            .query("parcoursProgress")
            .withIndex("by_user_parcours", (q) =>
                q.eq("userId", args.userId).eq("parcoursId", args.parcoursId)
            )
            .first();

        if (existing) return existing._id;

        // Create new progress
        return await ctx.db.insert("parcoursProgress", {
            userId: args.userId,
            parcoursId: args.parcoursId,
            currentEtapeIndex: 0,
            completedEtapes: [],
            completedVersets: [],
            startedAt: Date.now(),
            badgeEarned: false,
        });
    },
});

// Mutation: Mark verset as completed in parcours
export const completeVerset = mutation({
    args: {
        progressId: v.id("parcoursProgress"),
        versetId: v.string(),
        etapeId: v.string(),
    },
    handler: async (ctx, args) => {
        const progress = await ctx.db.get(args.progressId);
        if (!progress) throw new Error("Progress not found");

        const parcours = await ctx.db.get(progress.parcoursId);
        if (!parcours) throw new Error("Parcours not found");

        // Add verset to completed list
        const completedVersets = progress.completedVersets.includes(args.versetId)
            ? progress.completedVersets
            : [...progress.completedVersets, args.versetId];

        // Check if etape is complete
        const etape = parcours.etapes.find((e) => e.id === args.etapeId);
        let completedEtapes = progress.completedEtapes;

        if (etape) {
            const allVersetsComplete = etape.versets.every((v) =>
                completedVersets.includes(v)
            );
            if (allVersetsComplete && !completedEtapes.includes(args.etapeId)) {
                completedEtapes = [...completedEtapes, args.etapeId];
            }
        }

        // Check if parcours is complete
        const allEtapesComplete = parcours.etapes.every((e) =>
            completedEtapes.includes(e.id)
        );

        await ctx.db.patch(args.progressId, {
            completedVersets,
            completedEtapes,
            currentEtapeIndex: Math.min(
                completedEtapes.length,
                parcours.etapes.length - 1
            ),
            ...(allEtapesComplete
                ? { completedAt: Date.now(), badgeEarned: true }
                : {}),
        });

        return { allEtapesComplete, completedEtapes, completedVersets };
    },
});

// Mutation: Seed the 12 Histoire du Salut parcours
export const seedHistoireSalut = mutation({
    handler: async (ctx) => {
        // Check if already seeded
        const existing = await ctx.db
            .query("parcours")
            .withIndex("by_slug", (q) => q.eq("slug", "histoire-salut"))
            .first();

        if (existing) return "Already seeded";

        // Create the main Histoire du Salut parcours
        await ctx.db.insert("parcours", {
            slug: "histoire-salut",
            title: "Histoire du Salut",
            description: "Parcourez les 12 periodes qui racontent le plan de Dieu pour l'humanite, de la Creation a l'accomplissement final.",
            icon: "📖",
            category: "histoire",
            color: "amber",
            order: 1,
            badgeIcon: "🏆",
            badgeTitle: "Historien du Salut",
            etapes: [
                {
                    id: "creation",
                    title: "1. Creation",
                    description: "Dieu cree le monde et l'homme a son image",
                    versets: ["genese_1_1", "genese_1_27", "genese_2_7"],
                },
                {
                    id: "patriarches",
                    title: "2. Patriarches",
                    description: "L'appel d'Abraham et les promesses d'alliance",
                    versets: ["genese_12_1", "genese_15_5", "genese_22_18"],
                },
                {
                    id: "exode",
                    title: "3. Exode",
                    description: "La liberation d'Egypte et l'alliance au Sinai",
                    versets: ["exode_3_14", "exode_12_13", "exode_20_2"],
                },
                {
                    id: "juges",
                    title: "4. Juges",
                    description: "Le cycle peche-repentir-delivrance en Israel",
                    versets: ["juges_2_16", "juges_6_12", "juges_16_28"],
                },
                {
                    id: "royaume",
                    title: "5. Royaume",
                    description: "Samuel, Saul, David et la promesse messianique",
                    versets: ["1samuel_16_13", "2samuel_7_12", "2samuel_7_16"],
                },
                {
                    id: "royaume-divise",
                    title: "6. Royaume divise",
                    description: "Separation d'Israel et de Juda, prophetes d'avertissement",
                    versets: ["1rois_12_16", "1rois_18_21", "2rois_17_23"],
                },
                {
                    id: "exil",
                    title: "7. Exil",
                    description: "La chute de Jerusalem et l'exil a Babylone",
                    versets: ["jeremie_29_11", "ezechiel_37_4", "lamentations_3_22"],
                },
                {
                    id: "retour",
                    title: "8. Retour",
                    description: "Reconstruction du Temple et esperance renouvelee",
                    versets: ["esdras_1_3", "nehemie_8_10", "aggee_2_9"],
                },
                {
                    id: "maccabees",
                    title: "9. Maccabees",
                    description: "Resistance heroique et purete de la foi",
                    versets: ["1maccabees_2_27", "2maccabees_7_9", "2maccabees_12_46"],
                },
                {
                    id: "messie",
                    title: "10. Messie",
                    description: "L'avenement de Jesus, accomplissement des promesses",
                    versets: ["luc_2_11", "matthieu_16_16", "jean_1_14"],
                },
                {
                    id: "eglise",
                    title: "11. Eglise",
                    description: "Naissance et mission de l'Eglise universelle",
                    versets: ["actes_2_4", "matthieu_16_18", "matthieu_28_19"],
                },
                {
                    id: "accomplissement",
                    title: "12. Accomplissement final",
                    description: "Le retour du Christ et la nouvelle creation",
                    versets: ["apocalypse_21_1", "apocalypse_22_20", "1corinthiens_15_28"],
                },
            ],
        });

        // Create thematic parcours
        await ctx.db.insert("parcours", {
            slug: "alliance",
            title: "Les Alliances",
            description: "Decouvrez les 7 grandes alliances entre Dieu et l'humanite",
            icon: "🤝",
            category: "thematique",
            color: "blue",
            order: 2,
            badgeIcon: "📜",
            badgeTitle: "Fils de l'Alliance",
            etapes: [
                {
                    id: "adam",
                    title: "Alliance avec Adam",
                    description: "L'alliance de creation",
                    versets: ["genese_1_28", "genese_2_17"],
                },
                {
                    id: "noe",
                    title: "Alliance avec Noe",
                    description: "L'alliance cosmique",
                    versets: ["genese_9_9", "genese_9_13"],
                },
                {
                    id: "abraham",
                    title: "Alliance avec Abraham",
                    description: "L'alliance patriarcale",
                    versets: ["genese_15_18", "genese_17_7"],
                },
                {
                    id: "moise",
                    title: "Alliance avec Moise",
                    description: "L'alliance nationale",
                    versets: ["exode_19_5", "exode_24_8"],
                },
                {
                    id: "david",
                    title: "Alliance avec David",
                    description: "L'alliance royale",
                    versets: ["2samuel_7_12", "psaumes_89_4"],
                },
                {
                    id: "nouvelle",
                    title: "Nouvelle Alliance",
                    description: "L'alliance eternelle en Jesus",
                    versets: ["jeremie_31_31", "luc_22_20", "hebreux_8_6"],
                },
            ],
        });

        await ctx.db.insert("parcours", {
            slug: "marie",
            title: "Marie dans la Bible",
            description: "La Vierge Marie a travers les Ecritures",
            icon: "🌹",
            category: "thematique",
            color: "pink",
            order: 3,
            badgeIcon: "👑",
            badgeTitle: "Serviteur de Marie",
            etapes: [
                {
                    id: "prophecie",
                    title: "La femme annoncee",
                    description: "Propheties sur la Vierge",
                    versets: ["genese_3_15", "isaie_7_14"],
                },
                {
                    id: "annonciation",
                    title: "L'Annonciation",
                    description: "Le oui de Marie",
                    versets: ["luc_1_28", "luc_1_38"],
                },
                {
                    id: "visitation",
                    title: "La Visitation",
                    description: "Marie porte le Sauveur",
                    versets: ["luc_1_42", "luc_1_46"],
                },
                {
                    id: "cana",
                    title: "Les noces de Cana",
                    description: "Marie intercede",
                    versets: ["jean_2_3", "jean_2_5"],
                },
                {
                    id: "croix",
                    title: "Au pied de la Croix",
                    description: "Marie notre Mere",
                    versets: ["jean_19_26", "jean_19_27"],
                },
                {
                    id: "apocalypse",
                    title: "La Femme de l'Apocalypse",
                    description: "Marie glorifiee",
                    versets: ["apocalypse_12_1", "apocalypse_12_17"],
                },
            ],
        });

        await ctx.db.insert("parcours", {
            slug: "eucharistie",
            title: "L'Eucharistie",
            description: "Les fondements bibliques de la presence reelle",
            icon: "🍞",
            category: "doctrinal",
            color: "purple",
            order: 4,
            badgeIcon: "✝️",
            badgeTitle: "Adorateur eucharistique",
            etapes: [
                {
                    id: "manne",
                    title: "La manne du desert",
                    description: "Prefiguration de l'Eucharistie",
                    versets: ["exode_16_4", "exode_16_15"],
                },
                {
                    id: "melchisedech",
                    title: "Melchisedech",
                    description: "Le pretre roi offre pain et vin",
                    versets: ["genese_14_18", "psaumes_110_4"],
                },
                {
                    id: "pain-vie",
                    title: "Le Pain de vie",
                    description: "Discours eucharistique de Jesus",
                    versets: ["jean_6_35", "jean_6_51", "jean_6_56"],
                },
                {
                    id: "cene",
                    title: "La Derniere Cene",
                    description: "Institution de l'Eucharistie",
                    versets: ["luc_22_19", "1corinthiens_11_24"],
                },
                {
                    id: "emmaus",
                    title: "Emmaus",
                    description: "Reconnaissance dans la fraction du pain",
                    versets: ["luc_24_30", "luc_24_35"],
                },
            ],
        });

        return "Seeded 4 parcours successfully";
    },
});
