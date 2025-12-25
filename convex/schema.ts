import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    preferences: v.object({
      rhythm: v.string(),
      goal: v.string(),
      darkMode: v.boolean(),
    }),
    level: v.number(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  progress: defineTable({
    userId: v.id("users"),
    chapterId: v.string(),
    memorized: v.boolean(),
    lastReview: v.number(),
    nextReview: v.number(),
    reviewCount: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_next_review", ["userId", "nextReview"]),

  memoriaContent: defineTable({
    chapterId: v.string(),
    book: v.string(),
    chapter: v.number(),
    title: v.string(),
    ideaCentrale: v.string(),
    contexteEssentiel: v.string(),
    imageMentale: v.string(),
    typologie: v.string(),
    versetsCles: v.array(v.string()),
    apologetique: v.object({
      veriteAffirmee: v.string(),
      versetsAppui: v.array(v.string()),
      objection: v.string(),
      reponse: v.string(),
    }),
    placeHistoireSalut: v.string(),
    applicationSpirituelle: v.string(),
    resumeMemoirel: v.string(),
    astuceMemoire: v.string(),
    periodeHistoireSalut: v.string(),
    familleTheologique: v.string(),
  }).index("by_chapter", ["chapterId"]),

  verseFiches: defineTable({
    verseId: v.string(),
    book: v.string(),
    chapter: v.number(),
    verse: v.number(),
    verseText: v.string(),
    periodeHistoireSalut: v.string(),
    familleTheologique: v.string(),
    ideeCentrale: v.string(),
    contexteEssentiel: v.string(),
    imageMentale: v.string(),
    typologieAT: v.string(),
    typologieNT: v.string(),
    versetsCles: v.array(v.string()),
    apologetiqueVerite: v.string(),
    apologetiqueVersetsAppui: v.array(v.string()),
    apologetiqueObjection: v.string(),
    apologetiqueReponse: v.string(),
    placeHistoireSalut: v.string(),
    applicationSpirituelle: v.string(),
    resumeMemoriel: v.string(),
    astuceMemoire: v.string(),
    generatedAt: v.number(),
  }).index("by_verse", ["verseId"]),

  parcours: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.string(),
    color: v.string(),
    order: v.number(),
    etapes: v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      versets: v.array(v.string()),
    })),
    badgeIcon: v.optional(v.string()),
    badgeTitle: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),

  parcoursProgress: defineTable({
    userId: v.id("users"),
    parcoursId: v.id("parcours"),
    currentEtapeIndex: v.number(),
    completedEtapes: v.array(v.string()),
    completedVersets: v.array(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    badgeEarned: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parcours", ["userId", "parcoursId"]),

  apologetiqueFiches: defineTable({
    slug: v.string(),
    title: v.string(),
    category: v.string(),
    icon: v.string(),
    veriteCatholique: v.string(),
    explication: v.string(),
    versetsAppui: v.array(v.object({
      reference: v.string(),
      texte: v.string(),
    })),
    objections: v.array(v.object({
      question: v.string(),
      reponse: v.string(),
    })),
    versetsCles: v.array(v.string()),
    typologie: v.optional(v.object({
      type: v.string(), // ex: "Manne dans le desert"
      antitype: v.string(), // ex: "Eucharistie"
      reference: v.string(), // ex: "Exode 16"
      explication: v.string(),
    })),
    resumeMemoriel: v.string(),
    order: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),

  // Cours d'apologetique interactif
  apologetiqueCours: defineTable({
    slug: v.string(),
    ordre: v.number(),
    titre: v.string(),
    sousTitre: v.string(),
    icon: v.string(),
    contenu: v.string(),
    pointsCles: v.array(v.string()),
    versets: v.array(v.object({
      reference: v.string(),
      texte: v.string(),
    })),
    quiz: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      reponseIndex: v.number(),
      explication: v.string(),
    })),
    flashcards: v.array(v.object({
      recto: v.string(),
      verso: v.string(),
    })),
  }).index("by_slug", ["slug"]),

  // Progression cours
  coursProgress: defineTable({
    userId: v.id("users"),
    lessonSlug: v.string(),
    completedAt: v.number(),
    quizScore: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_lesson", ["userId", "lessonSlug"]),

  // Bookmarks
  userBookmarks: defineTable({
    userId: v.id("users"),
    type: v.string(),
    itemId: v.string(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"]),

  // ========== MODULE PRIÈRE ==========

  // Prières traditionnelles
  prieres: defineTable({
    slug: v.string(),
    titre: v.string(),
    categorie: v.string(), // "base", "marie", "saints", "liturgie"
    texte: v.string(),
    texteLatinOptional: v.optional(v.string()),
    icon: v.string(),
    ordre: v.number(),
  }).index("by_slug", ["slug"]),

  // Mystères du Rosaire
  mysteresRosaire: defineTable({
    slug: v.string(),
    serie: v.string(), // "joyeux", "lumineux", "douloureux", "glorieux"
    ordre: v.number(), // 1-5 dans chaque série
    titre: v.string(),
    fruit: v.string(), // Fruit spirituel du mystère
    reference: v.string(), // Référence biblique
    meditation: v.string(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_serie", ["serie"]),

  // Sessions de prière (historique)
  prayerSessions: defineTable({
    userId: v.id("users"),
    type: v.string(), // "rosaire", "priere", "examen", "lectio"
    details: v.optional(v.string()), // JSON avec détails spécifiques
    completedAt: v.number(),
    durationMinutes: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"]),

  // Examen de conscience
  examenConscience: defineTable({
    userId: v.id("users"),
    date: v.number(),
    graces: v.optional(v.string()), // Ce pour quoi on remercie
    lumieres: v.optional(v.string()), // Ce qu'on a découvert
    peches: v.optional(v.string()), // Ce qu'on regrette
    resolution: v.optional(v.string()), // Résolution pour demain
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  // Lectio Divina
  lectioDivina: defineTable({
    userId: v.id("users"),
    date: v.number(),
    passage: v.string(), // ex: "Jean 1:1-14"
    lectio: v.optional(v.string()), // Notes de lecture
    meditatio: v.optional(v.string()), // Réflexions
    oratio: v.optional(v.string()), // Prière personnelle
    contemplatio: v.optional(v.string()), // Expérience contemplative
    actio: v.optional(v.string()), // Action à faire
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),
});