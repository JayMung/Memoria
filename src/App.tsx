import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignUpPage from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Chapter from "./pages/Chapter";
import Bible from "./pages/Bible";
import Verse from "./pages/Verse";
import Parcours from "./pages/Parcours";
import Memoire from "./pages/Memoire";
import Apologetique from "./pages/Apologetique";
import ApologetiqueCours from "./pages/ApologetiqueCours";
import Priere from "./pages/Priere";
import Rosaire from "./pages/Rosaire";
import PrieresTraditionnelles from "./pages/PrieresTraditionnelles";
import ExamenConscience from "./pages/ExamenConscience";
import LectioDivina from "./pages/LectioDivina";
import NotFound from "./pages/NotFound";

// Initialize Convex
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
const queryClient = new QueryClient();

// Clerk Publishable Key (Replace with your actual key in .env)
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key");
}

const App = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/sign-in" element={<Auth />} />
              <Route path="/sign-up" element={<SignUpPage />} />

              {/* Protected Routes */}
              <Route
                path="/onboarding"
                element={
                  <>
                    <SignedIn>
                      <Onboarding />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <>
                    <SignedIn>
                      <Dashboard />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/chapter/:chapterId"
                element={
                  <>
                    <SignedIn>
                      <Chapter />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/bible"
                element={
                  <>
                    <SignedIn>
                      <Bible />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/verse/:verseId"
                element={
                  <>
                    <SignedIn>
                      <Verse />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/parcours"
                element={
                  <>
                    <SignedIn>
                      <Parcours />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/memoire"
                element={
                  <>
                    <SignedIn>
                      <Memoire />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/apologetique"
                element={
                  <>
                    <SignedIn>
                      <Apologetique />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/apologetique/cours"
                element={
                  <>
                    <SignedIn>
                      <ApologetiqueCours />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/priere"
                element={
                  <>
                    <SignedIn>
                      <Priere />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/priere/rosaire"
                element={
                  <>
                    <SignedIn>
                      <Rosaire />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/priere/traditionnelles"
                element={
                  <>
                    <SignedIn>
                      <PrieresTraditionnelles />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/priere/examen"
                element={
                  <>
                    <SignedIn>
                      <ExamenConscience />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/priere/lectio"
                element={
                  <>
                    <SignedIn>
                      <LectioDivina />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ConvexProviderWithClerk>
  </ClerkProvider>
);

export default App;