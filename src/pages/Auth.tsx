import { SignIn, SignUp } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
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

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-serif">Bienvenue</CardTitle>
            <CardDescription>
              Connectez-vous pour commencer votre parcours dans l'Histoire du Salut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Sign In Form */}
              <div className="space-y-4">
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "shadow-none border-0 p-0",
                    }
                  }}
                  routing="path"
                  path="/sign-in"
                  signUpUrl="/sign-up"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>En continuant, vous acceptez nos conditions d'utilisation.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;