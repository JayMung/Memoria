import { convexAuth } from "@convex-dev/auth/clerk";
 
export const { auth, signIn, signOut, isAuthenticated } = convexAuth({
  providers: [], // We use Clerk for the UI, this configures the backend
});