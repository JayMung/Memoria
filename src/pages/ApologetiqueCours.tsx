import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    BookOpen,
    CheckCircle2,
    Trophy,
    Sparkles,
    Brain,
    MessageSquare,
    Bookmark,
    RotateCcw,
    Check,
    X,
    Play,
    Quote,
    Lock,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type ViewStep = "list" | "lesson" | "quiz" | "flashcards" | "complete";

const ApologetiqueCoursPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<ViewStep>("list");
    const [selectedLesson, setSelectedLesson] = useState<any>(null);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
    const [showQuizResult, setShowQuizResult] = useState(false);
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const [flashcardFlipped, setFlashcardFlipped] = useState(false);
    const [verseModalOpen, setVerseModalOpen] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState<any>(null);

    // Queries
    const lessons = useQuery(api.apologetiqueCours.listLessons);
    const userProgress = useQuery(api.apologetiqueCours.getUserCoursProgress);
    const seedCours = useMutation(api.apologetiqueCours.seedCours);
    const completeLesson = useMutation(api.apologetiqueCours.completeLesson);

    // Auto-seed if no lessons
    useEffect(() => {
        if (lessons && lessons.length === 0) {
            seedCours();
        }
    }, [lessons]);

    const handleSelectLesson = (lesson: any) => {
        setSelectedLesson(lesson);
        setCurrentStep("lesson");
    };

    const handleStartQuiz = () => {
        setQuizIndex(0);
        setQuizAnswers([]);
        setShowQuizResult(false);
        setCurrentStep("quiz");
    };

    const handleQuizAnswer = (answerIndex: number) => {
        const newAnswers = [...quizAnswers, answerIndex];
        setQuizAnswers(newAnswers);
        setShowQuizResult(true);
    };

    const handleNextQuizQuestion = () => {
        if (quizIndex < (selectedLesson?.quiz?.length || 0) - 1) {
            setQuizIndex(quizIndex + 1);
            setShowQuizResult(false);
        } else {
            // Quiz complete - calculate score
            const correctCount = quizAnswers.filter(
                (ans, i) => ans === selectedLesson.quiz[i].reponseIndex
            ).length;
            const score = Math.round((correctCount / selectedLesson.quiz.length) * 100);
            completeLesson({ lessonSlug: selectedLesson.slug, quizScore: score });
            setCurrentStep("complete");
        }
    };

    const handleStartFlashcards = () => {
        setFlashcardIndex(0);
        setFlashcardFlipped(false);
        setCurrentStep("flashcards");
    };

    const handleNextFlashcard = () => {
        if (flashcardIndex < (selectedLesson?.flashcards?.length || 0) - 1) {
            setFlashcardIndex(flashcardIndex + 1);
            setFlashcardFlipped(false);
        } else {
            setCurrentStep("lesson");
        }
    };

    const handleOpenVerse = (verse: any) => {
        setSelectedVerse(verse);
        setVerseModalOpen(true);
    };

    const handleBack = () => {
        switch (currentStep) {
            case "lesson":
                setSelectedLesson(null);
                setCurrentStep("list");
                break;
            case "quiz":
            case "flashcards":
            case "complete":
                setCurrentStep("lesson");
                break;
        }
    };

    const getProgressPercent = () => {
        if (!lessons || !selectedLesson) return 0;
        return Math.round(((selectedLesson.ordre) / lessons.length) * 100);
    };

    // Helper to check lock status
    const isLessonLocked = (lesson: any) => {
        // First lesson always unlocked
        if (lesson.ordre === 1) return false;

        // Need progress loaded
        if (!userProgress || !lessons) return true;

        // Find previous lesson
        const prevLesson = lessons.find((l: any) => l.ordre === lesson.ordre - 1);
        if (!prevLesson) return false; // Should not happen if sorted

        // Check if previous is completed
        const prevProgress = userProgress.find((p: any) => p.lessonSlug === prevLesson.slug);
        return !prevProgress;
    };

    // Render Lessons List
    const renderLessonsList = () => (
        <div className="space-y-4">
            <div className="text-center py-4">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-red-600" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    Cours d'Apologetique
                </h2>
                <p className="text-sm text-slate-500">8 lecons pour defendre ta foi</p>
                {userProgress && (
                    <Badge variant="secondary" className="mt-2">
                        Progression : {userProgress.length}/{lessons?.length || 8}
                    </Badge>
                )}

                <div className="mt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-400"
                        onClick={async () => {
                            if (confirm("Mettre a jour le contenu du cours ?")) {
                                const res = await seedCours();
                                alert(res);
                                window.location.reload();
                            }
                        }}
                    >
                        🔄 Mettre a jour le cours (Admin)
                    </Button>
                </div>
            </div>

            {!lessons ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            ) : (
                <div className="space-y-3">
                    {lessons.map((lesson: any, index: number) => {
                        const locked = isLessonLocked(lesson);
                        const progress = userProgress?.find((p: any) => p.lessonSlug === lesson.slug);
                        const isCompleted = !!progress;

                        return (
                            <Card
                                key={lesson._id}
                                className={`transition-all overflow-hidden ${locked
                                    ? "opacity-60 bg-slate-50 dark:bg-slate-900 border-slate-200 cursor-not-allowed"
                                    : "cursor-pointer hover:border-amber-500 bg-white dark:bg-slate-950"
                                    }`}
                                onClick={() => !locked && handleSelectLesson(lesson)}
                            >
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${locked ? "bg-slate-200 dark:bg-slate-800" : isCompleted ? "bg-green-100 text-green-600" : "bg-red-100 dark:bg-red-900/30"
                                        }`}>
                                        {locked ? <Lock className="w-5 h-5 text-slate-400" /> : isCompleted ? <Check className="w-5 h-5" /> : lesson.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium text-sm truncate ${locked ? "text-slate-500" : "text-slate-800 dark:text-slate-200"}`}>
                                            {lesson.titre}
                                        </h4>
                                        <p className="text-xs text-slate-500 truncate">
                                            {lesson.sousTitre}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant={locked ? "outline" : isCompleted ? "default" : "secondary"} className="text-xs shrink-0">
                                            {index + 1}/{lessons.length}
                                        </Badge>
                                        {progress && (
                                            <span className="text-[10px] text-green-600 font-medium">
                                                Score: {progress.quizScore}%
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // Render Lesson Content
    const renderLessonContent = () => {
        if (!selectedLesson) return null;

        return (
            <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-6 pr-2">
                    {/* Header */}
                    <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 overflow-hidden">
                        <CardContent className="p-4 text-center">
                            <div className="text-4xl mb-2">{selectedLesson.icon}</div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                Lecon {selectedLesson.ordre} : {selectedLesson.titre}
                            </h2>
                            <p className="text-sm text-slate-500">{selectedLesson.sousTitre}</p>
                            <Progress value={getProgressPercent()} className="h-2 mt-4" />
                        </CardContent>
                    </Card>

                    {/* Content */}
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {selectedLesson.contenu}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Points Cles */}
                    <section>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                            Points cles
                        </h3>
                        <Card className="border-l-4 border-amber-500">
                            <CardContent className="p-4">
                                <ul className="space-y-2">
                                    {selectedLesson.pointsCles.map((point: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Versets - clickable to open modal */}
                    {selectedLesson.versets.length > 0 && (
                        <section>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                                <Quote className="w-5 h-5 text-blue-600" />
                                Versets bibliques
                            </h3>
                            <div className="space-y-2">
                                {selectedLesson.versets.map((verse: any, i: number) => (
                                    <Card
                                        key={i}
                                        className="cursor-pointer hover:border-blue-500 transition-all"
                                        onClick={() => handleOpenVerse(verse)}
                                    >
                                        <CardContent className="p-3 flex items-center gap-3">
                                            <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
                                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                                {verse.reference}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-4">
                        {selectedLesson.quiz.length > 0 && (
                            <Button
                                size="lg"
                                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                                onClick={handleStartQuiz}
                            >
                                <MessageSquare className="w-5 h-5" />
                                Quiz ({selectedLesson.quiz.length} questions)
                            </Button>
                        )}
                        {selectedLesson.flashcards.length > 0 && (
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full gap-2"
                                onClick={handleStartFlashcards}
                            >
                                <Brain className="w-5 h-5" />
                                Flashcards ({selectedLesson.flashcards.length})
                            </Button>
                        )}
                    </div>
                </div>
            </ScrollArea>
        );
    };

    // Render Quiz
    const renderQuiz = () => {
        if (!selectedLesson || !selectedLesson.quiz[quizIndex]) return null;
        const question = selectedLesson.quiz[quizIndex];
        const userAnswer = quizAnswers[quizIndex];
        const isCorrect = userAnswer === question.reponseIndex;

        return (
            <div className="space-y-6">
                <Card className="bg-purple-50 dark:bg-purple-900/20">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500">
                                Question {quizIndex + 1}/{selectedLesson.quiz.length}
                            </span>
                            <Badge variant="outline">
                                {quizAnswers.filter((a, i) => a === selectedLesson.quiz[i]?.reponseIndex).length} correct
                            </Badge>
                        </div>
                        <Progress
                            value={((quizIndex + 1) / selectedLesson.quiz.length) * 100}
                            className="h-2"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
                            {question.question}
                        </h3>
                        <div className="space-y-2">
                            {question.options.map((option: string, i: number) => (
                                <Button
                                    key={i}
                                    variant={
                                        showQuizResult
                                            ? i === question.reponseIndex
                                                ? "default"
                                                : i === userAnswer
                                                    ? "destructive"
                                                    : "outline"
                                            : "outline"
                                    }
                                    className={`w-full justify-start text-left h-auto py-3 ${showQuizResult && i === question.reponseIndex
                                        ? "bg-green-600 hover:bg-green-600"
                                        : ""
                                        }`}
                                    onClick={() => !showQuizResult && handleQuizAnswer(i)}
                                    disabled={showQuizResult}
                                >
                                    {option}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {showQuizResult && (
                    <Card className={isCorrect ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                {isCorrect ? (
                                    <Check className="w-5 h-5 text-green-600" />
                                ) : (
                                    <X className="w-5 h-5 text-red-500" />
                                )}
                                <span className={`font-bold ${isCorrect ? "text-green-700" : "text-red-600"}`}>
                                    {isCorrect ? "Correct !" : "Incorrect"}
                                </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {question.explication}
                            </p>
                            <Button
                                className="w-full mt-4"
                                onClick={handleNextQuizQuestion}
                            >
                                {quizIndex < selectedLesson.quiz.length - 1 ? "Question suivante" : "Voir les resultats"}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    // Render Flashcards
    const renderFlashcards = () => {
        if (!selectedLesson || !selectedLesson.flashcards[flashcardIndex]) return null;
        const card = selectedLesson.flashcards[flashcardIndex];

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="text-sm text-slate-500">
                    {flashcardIndex + 1}/{selectedLesson.flashcards.length}
                </div>

                <Card
                    className={`w-full max-w-md cursor-pointer transition-all duration-300 min-h-[200px] flex items-center justify-center ${flashcardFlipped
                        ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
                        : "bg-white dark:bg-slate-800"
                        }`}
                    onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                >
                    <CardContent className="p-6 text-center">
                        {!flashcardFlipped ? (
                            <>
                                <Brain className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                                    {card.recto}
                                </p>
                                <p className="text-xs text-slate-400 mt-4">Touche pour voir la reponse</p>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-8 h-8 mx-auto mb-3 text-amber-600" />
                                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                                    {card.verso}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {flashcardFlipped && (
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setFlashcardFlipped(false)}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retourner
                        </Button>
                        <Button onClick={handleNextFlashcard}>
                            {flashcardIndex < selectedLesson.flashcards.length - 1 ? "Suivant" : "Terminer"}
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    // Render Complete
    const renderComplete = () => {
        const correctCount = quizAnswers.filter(
            (ans, i) => selectedLesson && ans === selectedLesson.quiz[i]?.reponseIndex
        ).length;
        const score = selectedLesson ? Math.round((correctCount / selectedLesson.quiz.length) * 100) : 0;

        // Determine next lesson
        const nextLesson = lessons?.find((l: any) => l.ordre === (selectedLesson?.ordre || 0) + 1);

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
                <Trophy className="w-16 h-16 text-amber-500" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Lecon terminee !
                </h2>
                <p className="text-slate-500">
                    Score du quiz : {correctCount}/{selectedLesson?.quiz.length} ({score}%)
                </p>
                <div className="flex gap-4 mt-4">
                    <Button variant="outline" onClick={() => setCurrentStep("lesson")}>
                        Revoir la lecon
                    </Button>
                    <Button onClick={() => {
                        if (nextLesson) {
                            setSelectedLesson(nextLesson);
                            setCurrentStep("lesson");
                        } else {
                            setSelectedLesson(null);
                            setCurrentStep("list");
                        }
                    }}>
                        {nextLesson ? "Lecon suivante" : "Retour a la liste"}
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                {currentStep !== "list" && (
                    <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-50 truncate">
                        {currentStep === "list"
                            ? "Cours d'Apologetique"
                            : currentStep === "quiz"
                                ? "Quiz"
                                : currentStep === "flashcards"
                                    ? "Flashcards"
                                    : selectedLesson?.titre || "Lecon"}
                    </h1>
                </div>
            </div>

            {/* Content */}
            {currentStep === "list" && renderLessonsList()}
            {currentStep === "lesson" && renderLessonContent()}
            {currentStep === "quiz" && renderQuiz()}
            {currentStep === "flashcards" && renderFlashcards()}
            {currentStep === "complete" && renderComplete()}

            {/* Verse Modal */}
            <Dialog open={verseModalOpen} onOpenChange={setVerseModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            {selectedVerse?.reference}
                        </DialogTitle>
                    </DialogHeader>
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                        <CardContent className="p-4">
                            <p className="text-slate-700 dark:text-slate-300 italic">
                                "{selectedVerse?.texte}"
                            </p>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                            <Bookmark className="w-4 h-4" />
                            Bookmarker
                        </Button>
                        <Button size="sm" onClick={() => setVerseModalOpen(false)}>
                            Fermer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default ApologetiqueCoursPage;
