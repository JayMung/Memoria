export default {
  providers: [
    {
      // Clerk Frontend API URL from your Clerk Dashboard
      // This should be set as CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};