import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, Shield, ArrowRight, Clock, Star, Loader2, Plus, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import Header from "@/components/Header";
import SeedButton from "@/components/SeedButton";

const Dashboard = () => {
  const chapters = useQuery(api.memoria.listChapters);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <section>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map((chapter) => (
                <Link key={chapter._id} to={`/chapter/${chapter.chapterId}`}>
                  <Card className="hover:shadow-md transition-shadow transition-transform hover:-translate-y-1 cursor-pointer overflow-hidden border-l-4 border-l-amber-500 bg-white dark:bg-slate-900">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="mb-2">
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
        </section>
      </main>
    </div>
  );
};

export default Dashboard;