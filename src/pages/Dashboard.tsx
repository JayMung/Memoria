import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, Flame, Target, Loader2, Play, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import DashboardLayout from "@/components/DashboardLayout";
import SeedButton from "@/components/SeedButton";

const Dashboard = () => {
  const chapters = useQuery(api.memoria.listChapters);
  const stats = useQuery(api.progress.getUserStats) ?? {
    chaptersMemorized: 0,
    streak: 0,
    level: 1,
    reviewsToday: 0,
  };
  const reviewsToday = useQuery(api.progress.getReviewsToday) ?? [];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-2">
          Bienvenue dans ta formation biblique ✝️
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Continue ton parcours et grave la Parole dans ton cœur.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Chapitres mémorisés"
          value={stats.chaptersMemorized}
          color="amber"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Jours consécutifs"
          value={stats.streak}
          color="orange"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Niveau"
          value={stats.level}
          color="blue"
        />
        <StatCard
          icon={<Brain className="w-5 h-5" />}
          label="À revoir aujourd'hui"
          value={stats.reviewsToday}
          color="emerald"
        />
      </div>

      {/* Chapter of the Day */}
      <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
              <Calendar className="w-5 h-5" />
              Chapitre du jour
            </CardTitle>
            <Badge className="bg-amber-600 text-white">Nouveau</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">
            Genèse 1 — La Création du Monde
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 italic">
            "Dieu crée tout par sa Parole, ordonnant le chaos en un cosmos bon."
          </p>
          <Link to="/chapter/genesis_1">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
              Commencer <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </CardContent>
      </Card>

      {/* Chapters List */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50">
          <Play className="w-5 h-5 text-amber-600" /> Continuer l'apprentissage
        </h2>
        <SeedButton />
      </div>

      {chapters === undefined ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : chapters.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          <p>Aucun contenu trouvé. Cliquez sur "Seed Content" pour commencer.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {chapters.map((chapter) => (
            <Link key={chapter._id} to={`/chapter/${chapter.chapterId}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden border-l-4 border-l-amber-500 bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {chapter.periodeHistoireSalut}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">
                    {chapter.book} {chapter.chapter}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">{chapter.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                    "{chapter.ideaCentrale}"
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "amber" | "orange" | "blue" | "emerald";
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => {
  const colorClasses = {
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className={`inline-flex p-2 rounded-lg mb-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          {value}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {label}
        </p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;