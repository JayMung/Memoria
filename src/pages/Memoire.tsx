import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Brain,
    BookOpen,
    Flame,
    Trophy,
    ChevronRight,
    Check,
    X,
    RotateCcw,
    Sparkles,
    Calendar,
    Target,
    Loader2,
    Clock,
    Star,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type ViewMode = "dashboard" | "flashcard";

const MemoirePage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

    // Queries
    const stats = useQuery(api.progress.getUserStats);
    const reviewsToday = useQuery(api.progress.getReviewsToday);
    const allMemorized = useQuery(api.progress.getAllMemorized);

    // Mutations
    const recordReview = useMutation(api.progress.recordReview);

    const handleStartReview = () => {
        if (reviewsToday && reviewsToday.length > 0) {
            setViewMode("flashcard");
            setCurrentCardIndex(0);
            setShowAnswer(false);
            setSessionStats({ correct: 0, incorrect: 0 });
        }
    };

    const handleAnswer = async (success: boolean) => {
        const currentCard = reviewsToday?.[currentCardIndex];
        if (!currentCard) return;

        try {
            await recordReview({
                chapterId: currentCard.chapterId,
                success,
            });

            setSessionStats(prev => ({
                correct: prev.correct + (success ? 1 : 0),
                incorrect: prev.incorrect + (success ? 0 : 1),
            }));

            // Move to next card or end session
            if (currentCardIndex < (reviewsToday?.length || 0) - 1) {
                setCurrentCardIndex(prev => prev + 1);
                setShowAnswer(false);
            } else {
                setViewMode("dashboard");
            }
        } catch (error) {
            console.error("Error recording review:", error);
        }
    };

    const handleExitReview = () => {
        setViewMode("dashboard");
    };

    // Loading state
    if (stats === undefined) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            </DashboardLayout>
        );
    }

    // Flashcard mode
    if (viewMode === "flashcard" && reviewsToday && reviewsToday.length > 0) {
        const currentCard = reviewsToday[currentCardIndex];
        const progress = ((currentCardIndex + 1) / reviewsToday.length) * 100;

        return (
            <DashboardLayout>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={handleExitReview} className="gap-2">
                        <X className="w-4 h-4" />
                        Quitter
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{currentCardIndex + 1}/{reviewsToday.length}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <Progress value={progress} className="h-2 mb-6" />

                {/* Flashcard */}
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Card
                        className={`w-full max-w-lg cursor-pointer transition-all duration-300 ${showAnswer ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20" : ""
                            }`}
                        onClick={() => !showAnswer && setShowAnswer(true)}
                    >
                        <CardContent className="p-6 text-center min-h-[300px] flex flex-col justify-center">
                            {!showAnswer ? (
                                <>
                                    <div className="text-5xl mb-4">🤔</div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                                        {currentCard?.book} {currentCard?.chapter}
                                    </h2>
                                    <p className="text-slate-500 mb-6">
                                        Quelle est l'idee centrale de ce chapitre ?
                                    </p>
                                    <p className="text-sm text-amber-600">
                                        Touche pour voir la reponse
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-3xl mb-4">💡</div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">
                                        {currentCard?.title}
                                    </h3>
                                    <p className="text-slate-700 dark:text-slate-300 italic mb-4">
                                        {currentCard?.ideaCentrale}
                                    </p>
                                    <div className="text-sm text-slate-500">
                                        Resume : {currentCard?.resumeMemoirel}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Answer buttons */}
                    {showAnswer && (
                        <div className="flex gap-4 mt-6">
                            <Button
                                size="lg"
                                variant="outline"
                                className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleAnswer(false)}
                            >
                                <X className="w-5 h-5" />
                                A revoir
                            </Button>
                            <Button
                                size="lg"
                                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAnswer(true)}
                            >
                                <Check className="w-5 h-5" />
                                Je sais !
                            </Button>
                        </div>
                    )}
                </div>

                {/* Session stats */}
                <div className="flex justify-center gap-6 mt-6 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" /> {sessionStats.correct}
                    </span>
                    <span className="flex items-center gap-1 text-red-500">
                        <X className="w-4 h-4" /> {sessionStats.incorrect}
                    </span>
                </div>
            </DashboardLayout>
        );
    }

    // Dashboard mode
    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Brain className="w-7 h-7 text-purple-600" />
                    Memoire
                </h1>
                <p className="text-slate-500 mt-1">
                    Revision espacee pour ne jamais oublier
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <Card>
                    <CardContent className="p-4 text-center">
                        <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                            {stats?.chaptersMemorized || 0}
                        </p>
                        <p className="text-xs text-slate-500">Memorises</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                            {stats?.streak || 0}
                        </p>
                        <p className="text-xs text-slate-500">Jours streak</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                            {stats?.level || 1}
                        </p>
                        <p className="text-xs text-slate-500">Niveau</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                            {stats?.reviewsToday || 0}
                        </p>
                        <p className="text-xs text-slate-500">A revoir</p>
                    </CardContent>
                </Card>
            </div>

            {/* Review Section */}
            <Card className="mb-6 overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        Revisions du jour
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    {reviewsToday === undefined ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                        </div>
                    ) : reviewsToday.length === 0 ? (
                        <div className="text-center py-6">
                            <Star className="w-12 h-12 mx-auto mb-3 text-amber-400" />
                            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                                Bravo ! Aucune revision pour aujourd'hui
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                Continue a memoriser de nouveaux versets
                            </p>
                            <Button
                                className="mt-4 gap-2 bg-amber-600 hover:bg-amber-700"
                                onClick={() => navigate("/bible")}
                            >
                                <BookOpen className="w-4 h-4" />
                                Explorer la Bible
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">
                                {reviewsToday.length} chapitre{reviewsToday.length > 1 ? "s" : ""} a reviser
                            </p>
                            <Button
                                size="lg"
                                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                                onClick={handleStartReview}
                            >
                                <RotateCcw className="w-5 h-5" />
                                Commencer la revision
                            </Button>

                            {/* List of chapters to review */}
                            <div className="space-y-2 mt-4">
                                {reviewsToday.slice(0, 5).map((chapter: any) => (
                                    <div
                                        key={chapter.chapterId}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-slate-800 dark:text-slate-200">
                                                    {chapter.book} {chapter.chapter}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                                    {chapter.title}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            x{chapter.progress?.reviewCount || 0}
                                        </Badge>
                                    </div>
                                ))}
                                {reviewsToday.length > 5 && (
                                    <p className="text-xs text-slate-500 text-center">
                                        +{reviewsToday.length - 5} autres
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* My Memorized Chapters Section */}
            <Card className="mb-6">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        Mes chapitres mémorisés
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    {allMemorized === undefined ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                        </div>
                    ) : allMemorized.length === 0 ? (
                        <div className="text-center py-4">
                            <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm text-slate-500">Aucun chapitre mémorisé pour l'instant</p>
                            <Button
                                variant="outline"
                                className="mt-3 gap-2"
                                onClick={() => navigate("/bible")}
                            >
                                <BookOpen className="w-4 h-4" />
                                Commencer à mémoriser
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {allMemorized.map((chapter: any) => (
                                <div
                                    key={chapter._id}
                                    className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                    onClick={() => navigate(`/verse/${chapter.bookId}_${chapter.chapterNum}_1`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                                            <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-slate-800 dark:text-slate-200">
                                                {chapter.displayName}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {chapter.reviewCount} révision{chapter.reviewCount > 1 ? 's' : ''} • Prochaine: {new Date(chapter.nextReview).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200">
                <CardContent className="p-4">
                    <h3 className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5" />
                        Astuce MEMORIA FIDEI
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                        La repetition espacee augmente la retention de 80%. Revise chaque jour
                        pour ancrer les versets dans ta memoire a long terme.
                    </p>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};

export default MemoirePage;
