import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { genesis1, genesis2 } from "./seed_data";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Seed Genesis 1
        const existing = await ctx.db
            .query("memoriaContent")
            .withIndex("by_chapter", (q) => q.eq("chapterId", "genesis_1"))
            .first();

        if (existing) {
            await ctx.db.replace(existing._id, genesis1);
        } else {
            await ctx.db.insert("memoriaContent", genesis1);
        }

        // Seed Genesis 2
        const existing2 = await ctx.db
            .query("memoriaContent")
            .withIndex("by_chapter", (q) => q.eq("chapterId", "genesis_2"))
            .first();

        if (existing2) {
            await ctx.db.replace(existing2._id, genesis2);
        } else {
            await ctx.db.insert("memoriaContent", genesis2);
        }

        return "Seeded Genesis 1 & 2";
    },
});

export const getChapter = query({
    args: { chapterId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("memoriaContent")
            .withIndex("by_chapter", (q) => q.eq("chapterId", args.chapterId))
            .first();
    },
});

export const listChapters = query({
    handler: async (ctx) => {
        return await ctx.db.query("memoriaContent").collect();
    },
});

export const getBatchChapters = query({
    args: { chapterIds: v.array(v.string()) },
    handler: async (ctx, args) => {
        const chapters = [];
        for (const id of args.chapterIds) {
            const chap = await ctx.db
                .query("memoriaContent")
                .withIndex("by_chapter", (q) => q.eq("chapterId", id))
                .first();
            if (chap) chapters.push(chap);
        }
        return chapters;
    },
});

export const insertBatch = mutation({
    args: {
        chapters: v.array(
            v.object({
                chapterId: v.string(),
                book: v.string(),
                chapter: v.number(),
                content: v.string(),
                familleTheologique: v.optional(v.string()),
                periodeHistoireSalut: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        let count = 0;
        for (const chap of args.chapters) {
            const existing = await ctx.db
                .query("memoriaContent")
                .withIndex("by_chapter", (q) => q.eq("chapterId", chap.chapterId))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    content: chap.content,
                });
            } else {
                await ctx.db.insert("memoriaContent", {
                    ...chap,
                    title: `${chap.book} ${chap.chapter}`,
                    ideaCentrale: "Lecture biblique",
                    versetsCles: [],
                    apologetique: {
                        veriteAffirmee: "",
                        versetsAppui: [],
                        objection: "",
                        reponse: ""
                    },
                    contexteEssentiel: "",
                    imageMentale: "",
                    typologie: "",
                    placeHistoireSalut: "",
                    applicationSpirituelle: "",
                    resumeMemoirel: "",
                    astuceMemoire: "",
                    periodeHistoireSalut: chap.periodeHistoireSalut || "Autre",
                    familleTheologique: chap.familleTheologique || "Bible",
                });
            }
            count++;
        }
        return `Processed ${count} chapters`;
    },
});
