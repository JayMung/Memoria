import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({
    args: {
        goal: v.string(),
        rhythm: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        if (user !== null) {
            // Update existing user
            await ctx.db.patch(user._id, {
                preferences: {
                    ...user.preferences,
                    goal: args.goal,
                    rhythm: args.rhythm,
                },
            });
            return user._id;
        }

        // Create new user
        return await ctx.db.insert("users", {
            email: identity.email!,
            name: identity.name,
            preferences: {
                goal: args.goal,
                rhythm: args.rhythm,
                darkMode: false,
            },
            level: 1,
            createdAt: Date.now(),
        });
    },
});
