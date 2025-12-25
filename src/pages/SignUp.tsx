import { SignUp } from "@clerk/clerk-react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="w-full max-w-md">
        <Link to="/sign-in" className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour à la connexion
        </Link>

        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-amber-500/30">
              M
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-2">
            MEMORIA FIDEI
          </h1>
          <p className="text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" />
            École numérique de la foi catholique
          </p>
        </div>

        {/* Clerk Sign Up */}
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-2xl",
              headerTitle: "font-serif text-slate-900 dark:text-slate-100",
              headerSubtitle: "text-slate-600 dark:text-slate-400",
              socialButtonsBlockButton: "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
              socialButtonsBlockButtonText: "text-slate-700 dark:text-slate-300",
              dividerLine: "bg-slate-200 dark:bg-slate-700",
              dividerText: "text-slate-500 dark:text-slate-400",
              formFieldLabel: "text-slate-700 dark:text-slate-300",
              formFieldInput: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-amber-500 focus:border-amber-500",
              formButtonPrimary: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25",
              footerActionLink: "text-amber-600 hover:text-amber-700 dark:text-amber-500",
              identityPreviewEditButton: "text-amber-600 hover:text-amber-700",
              footer: "hidden",
            },
            layout: {
              socialButtonsPlacement: "top",
              showOptionalFields: false,
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/onboarding"
        />
      </div>
    </div>
  );
};

export default SignUpPage;