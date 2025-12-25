import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's chapters due for review today
export const getReviewsToday = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();

        if (!user) {
            return [];
        }

        const now = Date.now();
        const reviews = await ctx.db
            .query("progress")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) =>
                q.and(
                    q.eq(q.field("memorized"), true),
                    q.lte(q.field("nextReview"), now)
                )
            )
            .collect();

        // Get chapter details for each review
        const chaptersToReview = await Promise.all(
            reviews.map(async (review) => {
                const chapter = await ctx.db
                    .query("memoriaContent")
                    .withIndex("by_chapter", (q) => q.eq("chapterId", review.chapterId))
                    .first();
                return chapter ? { ...chapter, progress: review } : null;
            })
        );

        return chaptersToReview.filter(Boolean);
    },
});

// Mark a chapter as memorized
export const markAsMemorized = mutation({
    args: {
        chapterId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        console.log("Convex Auth Identity:", identity ? "Found" : "Null");
        if (identity) {
            console.log("Identity Details:", {
                issuer: identity.issuer,
                email: identity.email,
                subject: identity.subject
            });
        }

        // Get email or use subject as fallback
        const userEmail = identity.email || `${identity.subject}@clerk.user`;
        const userName = identity.name || identity.email?.split("@")[0] || identity.subject || "User";

        let user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", userEmail))
            .first();

        // Auto-create user if not found
        if (!user) {
            const userId = await ctx.db.insert("users", {
                email: userEmail,
                name: userName,
                createdAt: Date.now(),
                level: 1,
                preferences: {
                    rhythm: "moyen",
                    goal: "approfondir",
                    darkMode: false,
                },
            });
            user = await ctx.db.get(userId);
        }

        if (!user) {
            throw new Error("Could not create user");
        }

        // Check if progress exists
        const existingProgress = await ctx.db
            .query("progress")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("chapterId"), args.chapterId))
            .first();

        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (existingProgress) {
            // Update existing progress
            const newInterval = existingProgress.reviewCount === 0
                ? oneDayMs
                : oneDayMs * Math.pow(2.5, existingProgress.reviewCount);

            await ctx.db.patch(existingProgress._id, {
                memorized: true,
                lastReview: now,
                nextReview: now + newInterval,
                reviewCount: existingProgress.reviewCount + 1,
            });
        } else {
            // Create new progress
            await ctx.db.insert("progress", {
                userId: user._id,
                chapterId: args.chapterId,
                memorized: true,
                lastReview: now,
                nextReview: now + oneDayMs, // First review in 1 day
                reviewCount: 1,
            });
        }

        return "Chapter marked as memorized!";
    },
});

// Get user stats
export const getUserStats = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { chaptersMemorized: 0, streak: 0, level: 1, reviewsToday: 0 };
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();

        if (!user) {
            return { chaptersMemorized: 0, streak: 0, level: 1, reviewsToday: 0 };
        }

        const now = Date.now();

        // Count memorized chapters
        const allProgress = await ctx.db
            .query("progress")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        const chaptersMemorized = allProgress.filter(p => p.memorized).length;

        // Count reviews due today
        const reviewsToday = allProgress.filter(
            p => p.memorized && p.nextReview <= now
        ).length;

        // Calculate level based on chapters memorized
        const level = Math.floor(chaptersMemorized / 5) + 1;

        // Streak is a placeholder for now (would need daily tracking)
        const streak = chaptersMemorized > 0 ? Math.min(chaptersMemorized, 30) : 0;

        return {
            chaptersMemorized,
            streak,
            level,
            reviewsToday,
        };
    },
});

// Record a review (for spaced repetition)
export const recordReview = mutation({
    args: {
        chapterId: v.string(),
        success: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        const progress = await ctx.db
            .query("progress")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("chapterId"), args.chapterId))
            .first();

        if (!progress) {
            throw new Error("Progress not found");
        }

        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (args.success) {
            // Increase interval (SM-2 simplified)
            const newInterval = oneDayMs * Math.pow(2.5, progress.reviewCount);
            await ctx.db.patch(progress._id, {
                lastReview: now,
                nextReview: now + newInterval,
                reviewCount: progress.reviewCount + 1,
            });
        } else {
            // Reset to 1 day
            await ctx.db.patch(progress._id, {
                lastReview: now,
                nextReview: now + oneDayMs,
                reviewCount: 0,
            });
        }

        return "Review recorded!";
    },
});

// Get all memorized chapters for display
export const getAllMemorized = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const userEmail = identity.email || `${identity.subject}@clerk.user`;

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", userEmail))
            .first();

        if (!user) {
            return [];
        }

        const allProgress = await ctx.db
            .query("progress")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("memorized"), true))
            .collect();

        // Return with chapter info parsed from chapterId
        return allProgress.map(p => {
            const parts = p.chapterId.split("_");
            const chapter = parts.pop();
            const bookId = parts.join("_");
            return {
                ...p,
                bookId,
                chapterNum: chapter,
                displayName: `${bookId.charAt(0).toUpperCase() + bookId.slice(1)} ${chapter}`,
            };
        });
    },
});
