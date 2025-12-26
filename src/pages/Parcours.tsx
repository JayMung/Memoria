import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
    BookOpen,
    CheckCircle2,
    Loader2,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    CalendarCheck,
    Lock
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";

const ParcoursPage = () => {
    const readingPlan = useQuery(api.bibleYear.getPlan);
    const userProgress = useQuery(api.bibleYear.getUserProgress);
    const seedPlan = useMutation(api.bibleYear.seedPlan);
    const toggleReading = useMutation(api.bibleYear.toggleReading);

    const [currentWeek, setCurrentWeek] = useState(1);

    // Auto-seed if plan is empty
    useEffect(() => {
        if (readingPlan && readingPlan.length === 0) {
            seedPlan();
        }
    }, [readingPlan]);

    // Calculate Global Progress & Current Place
    const totalReadings = readingPlan ? readingPlan.reduce((acc, day) => acc + day.readings.length, 0) : 0;
    const completedReadingsCount = userProgress?.completedReadings?.length || 0;
    const progressPercentage = totalReadings > 0 ? (completedReadingsCount / totalReadings) * 100 : 0;

    // Detect current week based on progress if first load?
    // For now, default to 1, or maybe last active? we can persist this later.

    // Derived State for Pagination
    const daysPerWeek = 7;
    const totalWeeks = readingPlan ? Math.ceil(readingPlan.length / daysPerWeek) : 52;

    const currentWeekData = readingPlan
        ? readingPlan.slice((currentWeek - 1) * daysPerWeek, currentWeek * daysPerWeek)
        : [];

    const handleToggle = (readingId: string) => {
        toggleReading({ readingId });
    };

    const isReadingCompleted = (readingId: string) => {
        return userProgress?.completedReadings?.includes(readingId);
    };

    const isDayCompleted = (day: any) => {
        return day.readings.every((r: any, idx: number) => isReadingCompleted(`day-${day.day}-reading-${idx}`));
    };

    const getPeriodColor = (period: string) => {
        // Mapping periods to colors
        if (period.includes("Débuts")) return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300";
        if (period.includes("Patriarches")) return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
        if (period.includes("Exode")) return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300";
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    };

    const getBookId = (bookName: string) => {
        // Map display names to IDs found in books.json
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

    const getChapterLink = (reading: any) => {
        const bookId = getBookId(reading.book);
        return `/lecture/${bookId}/${reading.chapter}`;
    };

    if (readingPlan === undefined) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-1">
                            Étude Biblique
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Semaine {currentWeek} sur {totalWeeks}
                        </p>
                    </div>

                    {/* Simple Pagination Controls */}
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border shadow-sm">
                        <Button
                            variant="ghost" size="icon"
                            disabled={currentWeek === 1}
                            onClick={() => setCurrentWeek(c => Math.max(1, c - 1))}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium w-24 text-center">
                            Semaine {currentWeek}
                        </span>
                        <Button
                            variant="ghost" size="icon"
                            disabled={currentWeek >= totalWeeks}
                            onClick={() => setCurrentWeek(c => Math.min(totalWeeks, c + 1))}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-4 mb-4 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-500 whitespace-nowrap">Progression globale</span>
                    <Progress value={progressPercentage} className="h-2 bg-amber-200 dark:bg-slate-700" />
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-500">{Math.round(progressPercentage)}%</span>
                </div>
            </div>

            {/* Week Content Grid */}
            <ScrollArea className="h-[calc(100vh-220px)] pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {currentWeekData.map((day) => {
                        const dayCompleted = isDayCompleted(day);

                        return (
                            <Card
                                key={day.day}
                                className={`
                                    relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2
                                    ${dayCompleted
                                        ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/30'
                                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950'
                                    }
                                `}
                            >
                                {/* Period Badge */}
                                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-300 to-amber-500 opacity-80" />

                                <CardHeader className="pb-3 pt-5">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className={`mb-2 ${getPeriodColor(day.period)}`}>
                                            {day.period}
                                        </Badge>
                                        {dayCompleted && (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        )}
                                    </div>
                                    <CardTitle className="text-xl font-serif">Jour {day.day}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-3">
                                        {day.readings.map((reading: any, idx: number) => {
                                            const readingId = `day-${day.day}-reading-${idx}`;
                                            const isDone = isReadingCompleted(readingId);

                                            return (
                                                <div key={idx} className="flex items-center gap-2 text-sm group">
                                                    <Checkbox
                                                        checked={isDone}
                                                        onCheckedChange={() => handleToggle(readingId)}
                                                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                                    />
                                                    <Link
                                                        to={getChapterLink(reading)}
                                                        className={`flex-1 hover:text-amber-600 transition-colors ${isDone ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}
                                                    >
                                                        {reading.book} {reading.chapter}
                                                    </Link>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                                        <Link to={getChapterLink(day.readings[0])}>
                                            <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 hover:text-amber-600">
                                                Lire les chapitres <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* Placeholder for partially filled weeks? */}
                    {currentWeekData.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-500">
                            Aucun contenu pour cette semaine.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </DashboardLayout>
    );
};

export default ParcoursPage;
