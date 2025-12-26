import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Brain,
  Flame,
  Target,
  Loader2,
  Play,
  Calendar,
  ArrowRight,
  Shield,
  Heart,
  MessageCircle
} from "lucide-react";
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
    xp: 0,
    reviewsToday: 0,
  };

  // New features mock data or future queries
  const apologeticsQuestion = "Le Purgatoire est-il biblique ?";
  const prayerOfTheDay = "Examen de conscience du soir";

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-2">
          Bienvenue, Disciple ✝️
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Votre progression vers la sagesse continue.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Brain className="w-5 h-5" />}
          label="Chapitres mémorisés"
          value={stats.chaptersMemorized}
          color="amber"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Jours de suite"
          value={stats.streak}
          color="orange"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Points d'XP"
          value={stats.xp || (stats.chaptersMemorized * 100)}
          color="blue"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="À revoir"
          value={stats.reviewsToday}
          color="emerald"
        />
      </div>

      {/* ACTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* 1. APOLOGETIQUE */}
        <Card className="hover:border-red-400 transition-all cursor-pointer group border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Débat</Badge>
              <Shield className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            </div>
            <CardTitle className="text-lg mt-2">Question du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              "{apologeticsQuestion}"
            </p>
            <Link to="/apologetique">
              <button className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                Voir la réponse <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </CardContent>
        </Card>

        {/* 2. PRIERE */}
        <Card className="hover:border-rose-400 transition-all cursor-pointer group border-l-4 border-l-rose-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">Spi</Badge>
              <Heart className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <CardTitle className="text-lg mt-2">Prière du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              {prayerOfTheDay}
            </p>
            <Link to="/priere/examen">
              <button className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                Commencer <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </CardContent>
        </Card>

        {/* 3. BIBLE (Dynamic) */}
        <NextReadingCard />

      </div>

      {/* Upcoming Readings List */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50">
          <Calendar className="w-5 h-5 text-amber-600" /> Programme de lecture
        </h2>
        <Link to="/parcours">
          <button className="text-sm text-amber-600 hover:underline">Tout voir</button>
        </Link>
      </div>

      <UpcomingReadings />

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
  const colorStyles = {
    amber: "bg-amber-100 text-amber-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };

  return (
    <Card className="relative overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorStyles[color]} shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none">
            {value}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium uppercase tracking-wide">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


// --- Helper Components ---

function NextReadingCard() {
  const plan = useQuery(api.bibleYear.getPlan);
  const progress = useQuery(api.bibleYear.getUserProgress);

  if (!plan) return <CardLoader />;

  // Find next unfinished day
  const completedReadings = new Set(progress?.completedReadings || []);
  const todayPlan = plan.find(day => {
    // Check if ALL readings for this day are done? 
    // Simplified: Check if *any* reading for this day is NOT done
    return day.readings.some((r, idx) => !completedReadings.has(`day-${day.day}-reading-${idx}`));
  });

  const nextReadingIndex = todayPlan ? todayPlan.readings.findIndex((r, idx) => !completedReadings.has(`day-${todayPlan.day}-reading-${idx}`)) : 0;
  const nextReading = todayPlan ? todayPlan.readings[nextReadingIndex] : plan[0].readings[0];
  const dayNumber = todayPlan ? todayPlan.day : 1;

  // Helper for French IDs
  const getBookId = (bookName: string) => {
    const mapping: Record<string, string> = {
      "Genèse": "genese", "Exode": "exode", "Lévitique": "levitique", "Nombres": "nombres", "Deutéronome": "deuteronome",
      "Josué": "josue", "Juges": "juges", "Ruth": "ruth", "1 Samuel": "1_samuel", "2 Samuel": "2_samuel",
      "1 Rois": "1_rois", "2 Rois": "2_rois", "1 Chroniques": "1_chroniques", "2 Chroniques": "2_chroniques",
      "Esdras": "esdras", "Néhémie": "nehemie", "Esther": "esther", "Job": "job", "Psaumes": "psaumes", "Psaume": "psaumes",
      "Proverbes": "proverbes", "Ecclésiaste": "ecclesiaste", "Cantique des Cantiques": "cantique_des_cantiques",
      "Ésaïe": "esaie", "Jérémie": "jeremie", "Lamentations": "lamentations", "Ézéchiel": "ezechiel", "Daniel": "daniel",
      "Osée": "osee", "Joël": "joel", "Amos": "amos", "Abdias": "abdias", "Jonas": "jonas", "Michée": "michee",
      "Nahum": "nahum", "Habacuc": "habacuc", "Sophonie": "sophonie", "Aggée": "aggee", "Zacharie": "zacharie",
      "Malachie": "malachie", "Matthieu": "matthieu", "Marc": "marc", "Luc": "luc", "Jean": "jean", "Actes": "actes",
      "Romains": "romains", "1 Corinthiens": "1_corinthiens", "2 Corinthiens": "2_corinthiens", "Galates": "galates",
      "Éphésiens": "ephesians", "Philippiens": "philippiens", "Colossiens": "colossiens", "1 Thessaloniciens": "1_thessaloniciens",
      "2 Thessaloniciens": "2_thessaloniciens", "1 Timothée": "1_timothee", "2 Timothée": "2_timothee", "Tite": "tite",
      "Philémon": "philemon", "Hébreux": "hebreux", "Jacques": "jacques", "1 Pierre": "1_pierre", "2 Pierre": "2_pierre",
      "1 Jean": "1_jean", "2 Jean": "2_jean", "3 Jean": "3_jean", "Jude": "jude", "Apocalypse": "apocalypse"
    };
    return mapping[bookName] || bookName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
  };

  const bookId = getBookId(nextReading.book);

  return (
    <Card className="hover:border-amber-400 transition-all cursor-pointer group border-l-4 border-l-amber-500 bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-900 dark:to-amber-900/10">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge className="bg-amber-500 hover:bg-amber-600">Lecture • Jour {dayNumber}</Badge>
          <BookOpen className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
        </div>
        <CardTitle className="text-lg mt-2 font-serif capitalize">{nextReading.book} {nextReading.chapter}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          Continuez votre lecture quotidienne.
        </p>
        <Link to={`/lecture/${bookId}/${nextReading.chapter}`}>
          <button className="w-full py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-md text-sm font-bold hover:bg-amber-200 transition-colors">
            {todayPlan ? "Reprendre" : "Commencer"}
          </button>
        </Link>
      </CardContent>
    </Card>
  );
}

function UpcomingReadings() {
  const plan = useQuery(api.bibleYear.getPlan);
  const progress = useQuery(api.bibleYear.getUserProgress);

  if (!plan) return <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-600" /></div>;

  const completedReadings = new Set(progress?.completedReadings || []);
  const currentDayIndex = plan.findIndex(day =>
    day.readings.some((r, idx) => !completedReadings.has(`day-${day.day}-reading-${idx}`))
  );

  const startIdx = currentDayIndex === -1 ? 0 : currentDayIndex;
  const upcomingDays = plan.slice(startIdx, startIdx + 3);

  return (
    <div className="space-y-3">
      {upcomingDays.map(day => (
        <Card key={day.day} className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-sm">
                J{day.day}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-200">
                  {day.readings.map(r => `${r.book} ${r.chapter}`).join(", ")}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{day.period}</p>
              </div>
            </div>
            {day.day === (plan[currentDayIndex]?.day) ? (
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">En cours</Badge>
            ) : (
              <Badge variant="outline" className="text-slate-400">À venir</Badge>
            )}
          </CardContent>
        </Card>
      ))}
      {upcomingDays.length === 0 && (
        <p className="text-center text-slate-500 italic">Plan de lecture terminé ! Félicitations !</p>
      )}
    </div>
  )
}

function CardLoader() {
  return (
    <Card className="h-full border-l-4 border-l-slate-200">
      <CardContent className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </CardContent>
    </Card>
  )
}

export default Dashboard;