import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper to get authenticated user (consistent with progress.ts)
async function getUser(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userEmail = identity.email || `${identity.subject}@clerk.user`;

    return await ctx.db
        .query("users")
        .withIndex("by_email", (q: any) => q.eq("email", userEmail))
        .first();
}

// Save or update a highlight/note
export const saveHighlight = mutation({
    args: {
        chapterId: v.string(), // "genese_1"
        verseIndex: v.number(), // 1
        color: v.optional(v.string()), // "yellow", "green", "red", "blue"
        note: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        const existing = await ctx.db
            .query("userHighlights")
            .withIndex("by_user_verse", (q) =>
                q.eq("userId", user._id)
                    .eq("chapterId", args.chapterId)
                    .eq("verseIndex", args.verseIndex)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                color: args.color,
                note: args.note,
                tags: args.tags,
                updatedAt: Date.now(),
            });
            return existing._id;
        } else {
            const id = await ctx.db.insert("userHighlights", {
                userId: user._id,
                chapterId: args.chapterId,
                verseIndex: args.verseIndex,
                color: args.color,
                note: args.note,
                tags: args.tags || [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            return id;
        }
    },
});

// Remove a highlight (or clear color/tags)
export const removeHighlight = mutation({
    args: {
        highlightId: v.id("userHighlights")
    },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        if (!user) throw new Error("Unauthenticated");

        // Ensure own
        const h = await ctx.db.get(args.highlightId);
        if (!h || h.userId !== user._id) throw new Error("Unauthorized");

        await ctx.db.delete(args.highlightId);
    }
});

// Get highlights for a specific chapter
export const getChapterHighlights = query({
    args: { chapterId: v.string() },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        if (!user) return [];

        return await ctx.db
            .query("userHighlights")
            .withIndex("by_user_chapter", (q) =>
                q.eq("userId", user._id).eq("chapterId", args.chapterId)
            )
            .collect();
    },
});

// Get all highlights with a specific tag (for "My Notes" page later)
export const getHighlightsByTag = query({
    args: { tag: v.string() },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        if (!user) return [];

        const allUserHighlights = await ctx.db
            .query("userHighlights")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        return allUserHighlights.filter(h => h.tags?.includes(args.tag));
    }
});

// Get all highlights for the user (for "My Notes" page)
export const getAllUserHighlights = query({
    handler: async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return [];

        const highlights = await ctx.db
            .query("userHighlights")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        // Manual sort by reverse creation time since we don't have a compound index by_user_createdAt yet
        return highlights.sort((a, b) => b.createdAt - a.createdAt);
    }
});
