import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Brain, Shield, ArrowRight, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data - In real app, this comes from Convex
  const userProgress = {
    currentChapter: "Genèse 1",
    currentChapterTitle: "La Création",
    progressPercent: 12,
    streak: 5,
    dailyGoal: 10, // minutes
  };

  const todayReview = [
    { id: 1, title: "Genèse 3", topic: "La Chute", type: "Révision" },
    { id: 2, title: "Jean 1", topic: "Le Verbe", type: "Mémorisation" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="font-serif font-semibold text-slate-800 dark:text-slate-100">
              MEMORIA FIDEI
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span>{userProgress.streak} jours</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-2">
            Bonjour, Frère
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Continuez votre progression dans l'Histoire du Salut.
          </p>
        </div>

        {/* Current Chapter Card */}
        <Card className="border-amber-200 dark:border-amber-900/50 shadow-md overflow-hidden">
          <div className="bg-amber-600 dark:bg-amber-700 p-4 text-white">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium uppercase tracking-wider opacity-90">Chapitre du jour</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">Période : Création</span>
            </div>
            <h2 className="text-2xl font-serif font-bold">{userProgress.currentChapter}</h2>
            <p className="text-amber-100">{userProgress.currentChapterTitle}</p>
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>Progression du parcours</span>
              <span>{userProgress.progressPercent}%</span>
            </div>
            <Progress value={userProgress.progressPercent} className="h-2 mb-6" />
            
            <Link to="/chapter/genesis/1" className="block">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Commencer la lecture
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Review */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            À revoir aujourd'hui
          </h3>
          <div className="grid gap-3">
            {todayReview.map((item) => (
              <Card key={item.id} className="border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.topic}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {item.type}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-2 gap-4">
          <QuickAccessCard
            icon={<Shield className="w-6 h-6 text-emerald-600" />}
            title="Apologétique"
            description="Arguments bibliques"
            color="emerald"
          />
          <QuickAccessCard
            icon={<BookOpen className="w-6 h-6 text-purple-600" />}
            title="Parcours"
            description="Histoire du Salut"
            color="purple"
          />
        </div>
      </main>
    </div>
  );
};

const QuickAccessCard = ({ icon, title, description, color }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  color: string 
}) => (
  <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
    <CardContent className="p-4">
      <div className={`mb-3 inline-flex p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </CardContent>
  </Card>
);

export default Dashboard;