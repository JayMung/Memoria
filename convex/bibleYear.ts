import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// SEED DATA FOR THE FIRST MONTH (Les Débuts & Patriarches)
const WEEK_1_PLAN = [
    // --- LES DEBUTS ---
    {
        day: 1,
        period: "Les Débuts",
        readings: [
            { book: "Genèse", chapter: "1-2", type: "narrative" },
            { book: "Psaume", chapter: "19", type: "prayer" }
        ]
    },
    {
        day: 2,
        period: "Les Débuts",
        readings: [
            { book: "Genèse", chapter: "3-4", type: "narrative" },
            { book: "Psaume", chapter: "104", type: "prayer" }
        ]
    },
    {
        day: 3,
        period: "Les Débuts",
        readings: [
            { book: "Genèse", chapter: "5-6", type: "narrative" },
            { book: "Psaume", chapter: "136", type: "prayer" }
        ]
    },
    {
        day: 4,
        period: "Les Débuts",
        readings: [
            { book: "Genèse", chapter: "7-9", type: "narrative" },
            { book: "Psaume", chapter: "1", type: "prayer" }
        ]
    },
    {
        day: 5,
        period: "Les Débuts",
        readings: [
            { book: "Genèse", chapter: "10-11", type: "narrative" },
            { book: "Psaume", chapter: "2", type: "prayer" } // Correction from Proverbs
        ]
    },
    // --- PATRIARCHES ---
    {
        day: 6,
        period: "Patriarches",
        readings: [
            { book: "Genèse", chapter: "12-13", type: "narrative" },
            { book: "Job", chapter: "1-2", type: "supplemental" },
            { book: "Proverbes", chapter: "1:1-7", type: "prayer" }
        ]
    },
    {
        day: 7,
        period: "Patriarches",
        readings: [
            { book: "Genèse", chapter: "14-15", type: "narrative" },
            { book: "Job", chapter: "3-4", type: "supplemental" },
            { book: "Proverbes", chapter: "1:8-19", type: "prayer" }
        ]
    },
    {
        day: 8,
        period: "Patriarches",
        readings: [
            { book: "Genèse", chapter: "16-17", type: "narrative" },
            { book: "Job", chapter: "5-6", type: "supplemental" },
            { book: "Proverbes", chapter: "1:20-33", type: "prayer" }
        ]
    },
    {
        day: 9,
        period: "Patriarches",
        readings: [
            { book: "Genèse", chapter: "18-19", type: "narrative" },
            { book: "Job", chapter: "7-8", type: "supplemental" },
            { book: "Proverbes", chapter: "2:1-5", type: "prayer" }
        ]
    },
    {
        day: 10,
        period: "Patriarches",
        readings: [
            { book: "Genèse", chapter: "20-21", type: "narrative" },
            { book: "Job", chapter: "9-10", type: "supplemental" },
            { book: "Proverbes", chapter: "2:6-8", type: "prayer" }
        ]
    },
    {
        day: 11,
        period: "Patriarches",
        readings: [
            { book: "Genèse", chapter: "22-23", type: "narrative" },
            { book: "Job", chapter: "11-12", type: "supplemental" },
            { book: "Proverbes", chapter: "2:9-15", type: "prayer" }
        ]
    },
    {
        day: 12,
        period: "Patriarches",
        readings: [
            { book: "Genèse", chapter: "24", type: "narrative" },
            { book: "Job", chapter: "13-14", type: "supplemental" },
            { book: "Proverbes", chapter: "2:16-19", type: "prayer" }
        ]
    },
    {
        day: 13,
        period: "Patriarches",
        readings: [
            { book: "Genèse", chapter: "25-26", type: "narrative" },
            { book: "Job", chapter: "15-16", type: "supplemental" },
            { book: "Proverbes", chapter: "2:20-22", type: "prayer" }
        ]
    },
    {
        day: 14,
        period: "Patriarches",
        readings: [
            { book: "Genèse", chapter: "27-28", type: "narrative" },
            { book: "Job", chapter: "17-18", type: "supplemental" },
            { book: "Proverbes", chapter: "3:1-4", type: "prayer" }
        ]
    },
    {
        day: 15,
        period: "Patriarches",
        readings: [
            { book: "Genèse", chapter: "29-30", type: "narrative" },
            { book: "Job", chapter: "19-20", type: "supplemental" },
            { book: "Proverbes", chapter: "3:5-8", type: "prayer" }
        ]
    },
];

export const seedPlan = mutation({
    args: {},
    handler: async (ctx) => {
        // Clear existing plan to ensure language update
        const existing = await ctx.db.query("readingPlan").collect();
        for (const doc of existing) await ctx.db.delete(doc._id);

        for (const plan of WEEK_1_PLAN) {
            const existingDay = await ctx.db
                .query("readingPlan")
                .withIndex("by_day", (q) => q.eq("day", plan.day))
                .first();

            if (!existingDay) {
                await ctx.db.insert("readingPlan", plan);
            }
        }
        return "Seeded Bible in a Year Plan for Week 1 (French)";
    },
});

export const getPlan = query({
    handler: async (ctx) => {
        return await ctx.db.query("readingPlan").collect();
    },
});

export const getUserProgress = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const progress = await ctx.db
            .query("userReadingProgress")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();

        return progress;
    },
});

export const toggleReading = mutation({
    args: {
        readingId: v.string(), // Format: "day-1-index-0"
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const progress = await ctx.db
            .query("userReadingProgress")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();

        if (!progress) {
            await ctx.db.insert("userReadingProgress", {
                userId,
                dayCompleted: 0,
                completedReadings: [args.readingId],
            });
        } else {
            const completed = progress.completedReadings;
            let newCompleted;
            if (completed.includes(args.readingId)) {
                newCompleted = completed.filter((id) => id !== args.readingId);
            } else {
                newCompleted = [...completed, args.readingId];
            }

            // Optional: Recalculate 'dayCompleted' based on full days done
            // logic would go here

            await ctx.db.patch(progress._id, {
                completedReadings: newCompleted,
            });
        }
    },
});
