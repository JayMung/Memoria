import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    Loader2,
    BookOpen,
    Lightbulb,
    Image as ImageIcon,
    ArrowRight,
    Shield,
    Heart,
    Brain,
    Sparkles,
    Clock,
    Key,
    Quote,
    Check,
    AlertCircle,
    CheckCircle2,
    Star,
} from "lucide-react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";

interface VerseData {
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

const VersePage = () => {
    const { verseId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verseData, setVerseData] = useState<VerseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [markedAsRead, setMarkedAsRead] = useState(false);
    const [memorizing, setMemorizing] = useState(false);
    const [justMemorized, setJustMemorized] = useState(false);
    const [memorizeError, setMemorizeError] = useState<string | null>(null);

    // Check authentication
    const { isSignedIn } = useUser();

    // Get source params for smart navigation
    const source = searchParams.get("source"); // "parcours" or null
    const parcoursSlug = searchParams.get("parcours");
    const etapeId = searchParams.get("etape");

    // Get saved fiche from database
    const savedFiche = useQuery(api.verseFiches.getByVerseId, verseId ? { verseId } : "skip");

    // Get all memorized chapters to check if this one is already memorized
    const allMemorized = useQuery(api.progress.getAllMemorized);

    // Check if current chapter is already memorized
    const currentChapterId = verseId ? (() => {
        const parts = verseId.split("_");
        if (parts.length < 3) return null;
        const bookId = parts.slice(0, -2).join("_");
        const chapter = parts[parts.length - 2];
        return `${bookId}_${chapter}`;
    })() : null;

    const isAlreadyMemorized = allMemorized?.some(
        (m: any) => m.chapterId === currentChapterId
    ) || false;

    // AI generation action
    const generateFiche = useAction(api.verseFiches.generateFiche);

    // Memorization mutation
    const markAsMemorized = useMutation(api.progress.markAsMemorized);

    // Read marking mutation and query
    // Read marking mutation and query
    const markAsRead = useMutation(api.progress.markVerseAsRead);
    const isRead = useQuery(api.progress.isVerseRead, verseId ? { verseId } : "skip");

    // Debug Auth
    const authDebug = useQuery(api.debug.debugAuth);
    useEffect(() => {
        if (authDebug) {
            console.log("Convex Auth Debug:", authDebug);
        }
    }, [authDebug]);

    // Load verse text from JSON
    useEffect(() => {
        if (!verseId) return;

        const parts = verseId.split("_");
        if (parts.length < 3) {
            setLoading(false);
            return;
        }

        const bookId = parts.slice(0, -2).join("_");
        const chapter = parseInt(parts[parts.length - 2]);
        const verse = parseInt(parts[parts.length - 1]);

        fetch(`/bible/${bookId}_${chapter}.json`)
            .then((res) => res.json())
            .then((data) => {
                const foundVerse = data.verses.find((v: { v: number }) => v.v === verse);
                if (foundVerse) {
                    setVerseData({
                        book: data.book,
                        chapter: chapter,
                        verse: verse,
                        text: foundVerse.t,
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [verseId]);

    // Auto-generate on first visit if no saved fiche
    useEffect(() => {
        if (verseData && savedFiche === null && !generating && verseId) {
            handleGenerate();
        }
    }, [verseData, savedFiche]);

    const handleGenerate = async () => {
        if (!verseData || !verseId) return;

        setGenerating(true);
        setError(null);

        try {
            await generateFiche({
                verseId,
                book: verseData.book,
                chapter: verseData.chapter,
                verse: verseData.verse,
                verseText: verseData.text,
            });
        } catch (err: any) {
            setError(err.message || "Erreur lors de la generation");
            console.error("Generation error:", err);
        } finally {
            setGenerating(false);
        }
    };

    const handleMarkAsRead = async () => {
        if (!verseId) return;

        if (!isSignedIn) {
            navigate("/sign-in");
            return;
        }

        try {
            await markAsRead({ verseId });
            setMarkedAsRead(true);
            setTimeout(() => {
                handleBack();
            }, 1000);
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    // Get chapter ID for memorization
    const getChapterId = () => {
        if (!verseId) return null;
        const parts = verseId.split("_");
        if (parts.length < 3) return null;
        const bookId = parts.slice(0, -2).join("_");
        const chapter = parts[parts.length - 2];
        return `${bookId}_${chapter}`;
    };

    const handleMemorize = async () => {
        const chapterId = getChapterId();
        if (!chapterId) return;

        if (!isSignedIn) {
            setMemorizeError("Veuillez vous connecter pour mémoriser des chapitres");
            return;
        }

        setMemorizing(true);
        setMemorizeError(null);
        try {
            await markAsMemorized({ chapterId });
            setJustMemorized(true);
        } catch (err: any) {
            console.error("Error memorizing:", err);
            if (err.message?.includes("Not authenticated")) {
                setMemorizeError("Veuillez vous connecter pour mémoriser des chapitres");
            } else {
                setMemorizeError("Erreur lors de la mémorisation. Réessayez.");
            }
        } finally {
            setMemorizing(false);
        }
    };

    const handleBack = () => {
        if (source === "parcours" && parcoursSlug) {
            navigate(`/parcours`);
        } else {
            navigate(-1);
        }
    };

    const getBackLabel = () => {
        if (source === "parcours") {
            return "Retour au parcours";
        }
        return "Retour";
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            </DashboardLayout>
        );
    }

    if (!verseData) {
        return (
            <DashboardLayout>
                <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Verset non trouve</h2>
                    <Button variant="outline" onClick={() => navigate("/bible")} className="mt-4">
                        Retour a la Bible
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    // Show loading state while generating
    if (generating || savedFiche === undefined) {
        return (
            <DashboardLayout>
                <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Generation de la fiche MEMORIA FIDEI...
                    </p>
                    <p className="text-sm text-slate-500">
                        L'IA analyse {verseData.book} {verseData.chapter}:{verseData.verse}
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    // Show error state
    if (error && !savedFiche) {
        return (
            <DashboardLayout>
                <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <p className="text-lg text-slate-600 dark:text-slate-400">Erreur de generation</p>
                    <p className="text-sm text-red-500 max-w-md text-center">{error}</p>
                    <Button onClick={handleGenerate} className="mt-4 gap-2">
                        Reessayer
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    // No fiche yet - show simple verse display
    if (!savedFiche) {
        return (
            <DashboardLayout>
                {/* Navigation */}
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <span className="text-slate-600 dark:text-slate-400">{getBackLabel()}</span>
                </div>

                {/* Simple verse display */}
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 mb-6">
                    <CardContent className="p-6">
                        <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-4">
                            {verseData.book} {verseData.chapter}:{verseData.verse}
                        </h1>
                        <blockquote className="text-xl font-serif italic text-slate-700 dark:text-slate-200">
                            "{verseData.text}"
                        </blockquote>
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 gap-2"
                        onClick={handleMarkAsRead}
                    >
                        <Check className="w-5 h-5" />
                        Marquer comme lu
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    // Display the saved fiche
    const fiche = savedFiche;

    return (
        <DashboardLayout>
            {/* Navigation */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <span className="text-slate-600 dark:text-slate-400">{getBackLabel()}</span>
                {markedAsRead && (
                    <Badge className="bg-green-600 text-white gap-1 ml-auto">
                        <CheckCircle2 className="w-3 h-3" />
                        Lu
                    </Badge>
                )}
            </div>

            {/* TITRE */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-3">
                    {fiche.book} {fiche.chapter}:{fiche.verse}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-blue-600 text-white">Periode : {fiche.periodeHistoireSalut}</Badge>
                    <Badge className="bg-purple-600 text-white">Famille : {fiche.familleTheologique}</Badge>
                </div>
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200">
                    <CardContent className="p-6">
                        <blockquote className="text-xl md:text-2xl font-serif italic text-slate-700 dark:text-slate-200">
                            "{fiche.verseText}"
                        </blockquote>
                        <p className="text-right mt-3 text-amber-700 dark:text-amber-400 font-semibold">
                            — {fiche.book} {fiche.chapter}:{fiche.verse}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8">
                {/* IDEE CENTRALE */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-600" />
                        🎯 IDEE CENTRALE
                    </h2>
                    <Card className="border-l-4 border-amber-500">
                        <CardContent className="p-4">
                            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                                {fiche.ideeCentrale}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* CONTEXTE ESSENTIEL */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        🧠 CONTEXTE ESSENTIEL
                    </h2>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {fiche.contexteEssentiel}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* IMAGE MENTALE */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-green-600" />
                        🖼️ IMAGE MENTALE MAITRESSE
                    </h2>
                    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                        <CardContent className="p-6">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line italic leading-relaxed">
                                {fiche.imageMentale}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* TYPOLOGIE */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-indigo-600" />
                        ✝️ LECTURE TYPOLOGIQUE (AT → NT)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-t-4 border-slate-400">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-slate-600 dark:text-slate-400">📜 Ancien Testament</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{fiche.typologieAT}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-t-4 border-amber-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-amber-600 dark:text-amber-400">✝️ Accomplissement</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{fiche.typologieNT}</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* VERSETS CLES */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Key className="w-5 h-5 text-yellow-600" />
                        🔑 VERSETS CLES A MEMORISER
                    </h2>
                    <div className="space-y-3">
                        {fiche.versetsCles.map((v: string, i: number) => (
                            <Card key={i} className="border-l-4 border-yellow-500">
                                <CardContent className="p-4 flex gap-3">
                                    <Quote className="w-5 h-5 text-yellow-600 shrink-0 mt-1" />
                                    <p className="text-slate-700 dark:text-slate-300 italic">{v}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* APOLOGETIQUE */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        🛡️ SECTION APOLOGETIQUE
                    </h2>
                    <div className="space-y-4">
                        <Card className="border-l-4 border-green-500">
                            <CardContent className="p-4">
                                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">🧩 Verite catholique affirmee</p>
                                <p className="text-slate-700 dark:text-slate-300">{fiche.apologetiqueVerite}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-blue-500">
                            <CardContent className="p-4">
                                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">📌 Versets d'appui</p>
                                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300">
                                    {fiche.apologetiqueVersetsAppui.map((v: string, i: number) => (
                                        <li key={i}>{v}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-red-500">
                            <CardContent className="p-4">
                                <p className="font-semibold text-red-700 dark:text-red-400 mb-1">❓ Objection frequente</p>
                                <p className="text-slate-700 dark:text-slate-300">{fiche.apologetiqueObjection}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-emerald-500">
                            <CardContent className="p-4">
                                <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">✅ Reponse biblique catholique</p>
                                <p className="text-slate-700 dark:text-slate-300">{fiche.apologetiqueReponse}</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* PLACE DANS L'HISTOIRE */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        🕰️ PLACE DANS L'HISTOIRE DU SALUT
                    </h2>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                {fiche.placeHistoireSalut}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* APPLICATION SPIRITUELLE */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-600" />
                        🙏 APPLICATION SPIRITUELLE
                    </h2>
                    <Card className="bg-pink-50 dark:bg-pink-900/20 border-pink-200">
                        <CardContent className="p-4">
                            <p className="text-lg text-slate-700 dark:text-slate-300 italic">
                                {fiche.applicationSpirituelle}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* RESUME MEMORIEL */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                        🧩 RESUME MEMORIEL
                    </h2>
                    <Card className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-300">
                        <CardContent className="p-6 text-center">
                            <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                                {fiche.resumeMemoriel}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* ASTUCE MEMOIRE */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        🧠 ASTUCE MEMOIRE
                    </h2>
                    <Card className="bg-purple-50 dark:bg-purple-900/20">
                        <CardContent className="p-6">
                            <p className="text-slate-700 dark:text-slate-300 mb-2">
                                Quand tu penses a {fiche.book} {fiche.chapter}:{fiche.verse}, dis :
                            </p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 italic">
                                « {fiche.astuceMemoire} »
                            </p>
                            <p className="mt-3 text-sm text-slate-500">👉 Le verset revient immediatement.</p>
                        </CardContent>
                    </Card>
                </section>
            </div>

            {/* Actions - Memorize and Mark as Read */}
            <div className="mt-10 space-y-4">
                {/* Memorization Card */}
                <Card className={`${justMemorized || isAlreadyMemorized ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-400' : 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200'}`}>
                    <CardContent className="p-6 text-center">
                        {justMemorized ? (
                            <>
                                <Star className="w-12 h-12 mx-auto mb-3 text-amber-500 fill-amber-500" />
                                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">
                                    Chapitre mémorisé ! 🎉
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Ce chapitre a été ajouté à ta liste de révisions.
                                    Reviens demain pour consolider ta mémoire !
                                </p>
                            </>
                        ) : isAlreadyMemorized ? (
                            <>
                                <Star className="w-12 h-12 mx-auto mb-3 text-amber-500 fill-amber-500" />
                                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">
                                    ✅ Déjà mémorisé !
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                                    Ce chapitre fait partie de ton système de révision.
                                </p>
                                <Button
                                    variant="outline"
                                    className="border-amber-400 text-amber-700 hover:bg-amber-50"
                                    onClick={() => navigate("/memoire")}
                                >
                                    Voir mes révisions
                                </Button>
                            </>
                        ) : (
                            <>
                                <Brain className="w-10 h-10 mx-auto mb-3 text-purple-600" />
                                <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-2">
                                    Mémoriser ce chapitre ?
                                </h3>
                                <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
                                    Active la répétition espacée pour ancrer {verseData?.book} {verseData?.chapter} dans ta mémoire à long terme.
                                </p>
                                {memorizeError && (
                                    <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                                        ⚠️ {memorizeError}
                                        {!isSignedIn && (
                                            <Button
                                                variant="link"
                                                className="text-red-700 dark:text-red-400 underline ml-2 p-0 h-auto"
                                                onClick={() => navigate("/sign-in")}
                                            >
                                                Se connecter
                                            </Button>
                                        )}
                                    </div>
                                )}
                                <Button
                                    size="lg"
                                    onClick={handleMemorize}
                                    disabled={memorizing}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-8 gap-2"
                                >
                                    {memorizing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Star className="w-5 h-5" />
                                    )}
                                    {memorizing ? "Mémorisation..." : "Mémoriser ce chapitre"}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Mark as Read Button */}
                <div className="flex justify-center">
                    {markedAsRead ? (
                        <Button
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 gap-2"
                            disabled
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Lu ✓
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50 font-bold px-8 gap-2"
                            onClick={handleMarkAsRead}
                        >
                            <Check className="w-5 h-5" />
                            Marquer comme lu
                        </Button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VersePage;
