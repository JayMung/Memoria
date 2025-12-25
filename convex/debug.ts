import { query } from "./_generated/server";

export const debugAuth = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        return {
            identity,
            hasIdentity: !!identity,
            issuer: identity?.issuer,
            subject: identity?.subject,
        };
    },
});
