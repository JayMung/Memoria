import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Brain, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="font-serif text-xl font-semibold text-slate-800 dark:text-slate-100">
            MEMORIA FIDEI
          </span>
        </div>
        <Link to="/onboarding">
          <Button variant="ghost">Connexion</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto">
        <div className="mb-6 inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
          <BookOpen className="w-6 h-6 text-amber-700 dark:text-amber-400 mr-2" />
          <span className="text-amber-800 dark:text-amber-300 font-medium text-sm">
            École numérique de la foi catholique
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-6 leading-tight">
          Comprendre. Mémoriser. <br />
          <span className="text-amber-600 dark:text-amber-500">Défendre la Foi.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed">
          Une application pour apprendre la Bible comme une seule Histoire du Salut,
          mémoriser les Écritures et trouver des arguments bibliques solides.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link to="/onboarding" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white">
              Commencer le parcours
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Découvrir la méthode
          </Button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full">
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-blue-600" />}
            title="Mémorisation Durable"
            description="Une méthode cognitive pour retenir les chapitres clés."
          />
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-amber-600" />}
            title="Histoire du Salut"
            description="Reliez l'Ancien et le Nouveau Testament intelligemment."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-emerald-600" />}
            title="Apologétique"
            description="Des arguments bibliques clairs pour expliquer votre foi."
          />
        </div>
      </main>

      <footer className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
        <p>© 2024 Memoria Fidei. Fidélité à la Tradition et au Magistère.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-left">
    <div className="mb-4">{icon}</div>
    <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
  </div>
);

export default Index;