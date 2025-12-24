import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Utilisateurs
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    preferences: v.object({
      rhythm: v.string(), // "light", "normal", "deep"
      goal: v.string(), // "understand", "memorize", "defend"
      darkMode: v.boolean(),
    }),
    level: v.number(), // Niveau de progression
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  // Progression de l'utilisateur sur les chapitres
  progress: defineTable({
    userId: v.id("users"),
    chapterId: v.string(), // Format: "book_chapter" (ex: "genesis_1")
    memorized: v.boolean(),
    lastReview: v.number(),
    nextReview: v.number(), // Timestamp pour la repetition espacee
    reviewCount: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_next_review", ["userId", "nextReview"]),

  // Contenu MEMORIA FIDEI (les fiches de chapitres)
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
  })
    .index("by_chapter", ["chapterId"]),

  // Fiches MEMORIA FIDEI pour les VERSETS (generees par IA)
  verseFiches: defineTable({
    verseId: v.string(), // Format: "book_chapter_verse" (ex: "genese_12_1")
    book: v.string(),
    chapter: v.number(),
    verse: v.number(),
    verseText: v.string(),

    // Metadata
    periodeHistoireSalut: v.string(), // "Creation", "Patriarches", etc.
    familleTheologique: v.string(), // "Alliance", "Sacrements", etc.

    // 11 sections obligatoires
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

    // Generation metadata
    generatedAt: v.number(),
  })
    .index("by_verse", ["verseId"]),
});