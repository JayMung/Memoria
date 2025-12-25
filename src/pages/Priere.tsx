import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    Heart,
    BookOpen,
    Loader2,
    ChevronRight,
    Sparkles,
    Clock,
    Calendar,
} from "lucide-react";

const PrierePage = () => {
    const sessions = useQuery(api.priere.getUserPrayerSessions);
    const seedPrieres = useMutation(api.priere.seedPrieres);

    const prayerModules = [
        {
            slug: "rosaire",
            title: "Chapelet / Rosaire",
            description: "Priez le Rosaire interactif avec méditations sur les mystères",
            icon: "📿",
            color: "from-blue-500 to-indigo-600",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
            slug: "traditionnelles",
            title: "Prières Traditionnelles",
            description: "Notre Père, Je vous salue Marie, Credo et autres prières",
            icon: "📜",
            color: "from-amber-500 to-orange-600",
            bgColor: "bg-amber-50 dark:bg-amber-900/20",
            borderColor: "border-amber-200 dark:border-amber-800",
        },
        {
            slug: "examen",
            title: "Examen de Conscience",
            description: "Guide quotidien pour examiner sa journée devant Dieu",
            icon: "🪞",
            color: "from-purple-500 to-pink-600",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            borderColor: "border-purple-200 dark:border-purple-800",
        },
        {
            slug: "lectio",
            title: "Lectio Divina",
            description: "Méditation priante de la Parole de Dieu en 4 étapes",
            icon: "📖",
            color: "from-emerald-500 to-teal-600",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            borderColor: "border-emerald-200 dark:border-emerald-800",
        },
    ];

    // Calcul des stats
    const todaySessions = sessions?.filter(s => {
        const today = new Date();
        const sessionDate = new Date(s.completedAt);
        return sessionDate.toDateString() === today.toDateString();
    }).length || 0;

    const weekSessions = sessions?.filter(s => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return s.completedAt > weekAgo.getTime();
    }).length || 0;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-rose-500/25">
                        🙏
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-slate-50">
                            Prière
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Nourris ta vie spirituelle quotidienne
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-200 dark:border-rose-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-100 dark:bg-rose-800/50 rounded-lg">
                                <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                                    {todaySessions}
                                </p>
                                <p className="text-xs text-rose-600/70 dark:text-rose-400/70">
                                    Aujourd'hui
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg">
                                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                                    {weekSessions}
                                </p>
                                <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
                                    Cette semaine
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Prayer Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {prayerModules.map((module) => (
                    <Link key={module.slug} to={`/priere/${module.slug}`}>
                        <Card className={`h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden ${module.bgColor} ${module.borderColor}`}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                                        {module.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">
                                            {module.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {module.description}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 mt-1" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Recent Sessions */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Sessions récentes
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-500"
                        onClick={async () => {
                            if (confirm("Initialiser le contenu des prières ?")) {
                                const res = await seedPrieres();
                                alert(res);
                            }
                        }}
                    >
                        🔄 Seed (Admin)
                    </Button>
                </div>

                {sessions === undefined ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                    </div>
                ) : sessions.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-500">
                            Aucune session de prière enregistrée.
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            Commence par le Rosaire ou une prière traditionnelle !
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {sessions.slice(0, 5).map((session) => (
                            <Card key={session._id} className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                                        {session.type === "rosaire" ? "📿" :
                                            session.type === "priere" ? "📜" :
                                                session.type === "examen" ? "🪞" :
                                                    session.type === "lectio" ? "📖" : "🙏"}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                                            {session.type === "rosaire" ? "Rosaire" :
                                                session.type === "priere" ? "Prière" :
                                                    session.type === "examen" ? "Examen de conscience" :
                                                        session.type === "lectio" ? "Lectio Divina" : session.type}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(session.completedAt).toLocaleDateString("fr-FR", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    {session.durationMinutes && (
                                        <Badge variant="secondary" className="text-xs">
                                            {session.durationMinutes} min
                                        </Badge>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PrierePage;
