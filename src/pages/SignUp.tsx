import { SignUp } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <Link to="/sign-in" className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour à la connexion
        </Link>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-serif">Créer un compte</CardTitle>
            <CardDescription>
              Rejoignez Memoria Fidei pour mémoriser la Parole de Dieu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-none border-0 p-0",
                }
              }}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/onboarding"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;