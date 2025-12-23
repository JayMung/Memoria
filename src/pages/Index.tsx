import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Brain, Shield, Sparkles, Cross, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100 dark:from-slate-950 dark:via-amber-950/20 dark:to-slate-900">
      <Header />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-5xl mx-auto py-16">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/30 rounded-full border border-amber-300/50 dark:border-amber-700/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Cross className="w-4 h-4 text-amber-700 dark:text-amber-400 mr-2" />
          <span className="text-amber-800 dark:text-amber-300 font-medium text-sm">
            École numérique de la foi catholique
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          Comprendre. Mémoriser. <br />
          <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
            Défendre la Foi.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          Une application pour apprendre la Bible comme une seule <strong>Histoire du Salut</strong>,
          mémoriser les Écritures et trouver des arguments bibliques solides.
        </p>

        {/* Dynamic CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
          <SignedIn>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300">
                <Sparkles className="mr-2 h-5 w-5" />
                Continuer mon parcours
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300">
                Commencer le parcours
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/sign-in" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
                J'ai déjà un compte
              </Button>
            </Link>
          </SignedOut>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
            title="Mémorisation Durable"
            description="Une méthode cognitive éprouvée pour retenir les chapitres clés de la Bible."
            color="blue"
          />
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400" />}
            title="Histoire du Salut"
            description="Reliez l'Ancien et le Nouveau Testament grâce à la lecture typologique."
            color="amber"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
            title="Apologétique"
            description="Des arguments bibliques clairs pour expliquer et défendre votre foi."
            color="emerald"
          />
        </div>

        {/* Trust Badges */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-6 text-slate-500 dark:text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Fidèle au Magistère</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-2">
            <Cross className="w-4 h-4 text-amber-600" />
            <span>Bible catholique (73 livres)</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Tradition vivante</span>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-slate-800">
        <p>© 2024 Memoria Fidei. Fidélité à la Tradition et au Magistère.</p>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "amber" | "emerald";
}

const FeatureCard = ({ icon, title, description, color }: FeatureCardProps) => {
  const colorClasses = {
    blue: "hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-blue-100 dark:hover:shadow-blue-900/20",
    amber: "hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-amber-100 dark:hover:shadow-amber-900/20",
    emerald: "hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20",
  };

  return (
    <div className={`group p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${colorClasses[color]}`}>
      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default Index;