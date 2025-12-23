import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { genesis1 } from "./seed_data";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db
            .query("memoriaContent")
            .withIndex("by_chapter", (q) => q.eq("chapterId", "genesis_1"))
            .first();

        if (!existing) {
            await ctx.db.insert("memoriaContent", genesis1);
            return "Seeded Genesis 1";
        }
        return "Genesis 1 already seeded";
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
