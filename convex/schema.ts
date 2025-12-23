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
    nextReview: v.number(), // Timestamp pour la répétition espacée
    reviewCount: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_next_review", ["userId", "nextReview"]),

  // Contenu MEMORIA FIDEI (les fiches)
  memoriaContent: defineTable({
    chapterId: v.string(),
    book: v.string(),
    chapter: v.number(),
    title: v.string(),
    ideaCentrale: v.string(),
    contexteEssentiel: v.string(),
    imageMentale: v.string(), // Description textuelle de l'image
    typologie: v.string(), // Lecture AT -> NT
    versetsCles: v.array(v.string()), // Références ou textes
    apologétique: v.object({
      véritéAffirmée: v.string(),
      versetsAppui: v.array(v.string()),
      objection: v.string(),
      réponse: v.string(),
    }),
    placeHistoireSalut: v.string(),
    applicationSpirituelle: v.string(),
    resumeMemoirel: v.string(),
    astuceMemoire: v.string(),
    periodeHistoireSalut: v.string(), // "Création", "Patriarches", etc.
    familleTheologique: v.string(), // "Alliance", "Sacrements", etc.
  })
    .index("by_chapter", ["chapterId"]),
});