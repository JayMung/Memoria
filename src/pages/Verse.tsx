import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface VerseData {
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

const VersePage = () => {
    const { verseId } = useParams(); // Format: bookId_chapter_verse (e.g., luc_9_23)
    const [verseData, setVerseData] = useState<VerseData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!verseId) return;

        const parts = verseId.split("_");
        if (parts.length < 3) {
            setLoading(false);
            return;
        }

        const bookId = parts.slice(0, -2).join("_"); // Handle book IDs like "1samuel"
        const chapter = parseInt(parts[parts.length - 2]);
        const verse = parseInt(parts[parts.length - 1]);

        // Fetch the chapter JSON
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
            .catch(() => {
                setLoading(false);
            });
    }, [verseId]);

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
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                        Verset non trouvé
                    </h2>
                    <Link to="/bible" className="mt-4 inline-block">
                        <Button variant="outline">Retour à la Bible</Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <Link to="/bible" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4">
                    <ChevronLeft className="w-4 h-4" />
                    Retour à la Bible
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-amber-600 text-white">{verseData.book} {verseData.chapter}:{verseData.verse}</Badge>
                    <Badge variant="outline">Fiche Memoria Fidei</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-slate-50">
                    Mémorise ce verset
                </h1>
            </div>

            {/* Verse Card */}
            <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                    <p className="text-xl md:text-2xl font-serif text-slate-800 dark:text-slate-100 leading-relaxed italic">
                        "{verseData.text}"
                    </p>
                    <p className="text-right mt-4 text-amber-700 dark:text-amber-400 font-semibold">
                        — {verseData.book} {verseData.chapter}:{verseData.verse}
                    </p>
                </CardContent>
            </Card>

            {/* Memoria Fidei Sections */}
            <div className="space-y-6">
                {/* 1. Idée Centrale */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Lightbulb className="w-5 h-5 text-amber-600" />
                            Idée Centrale
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 dark:text-slate-300">
                            <strong>Question :</strong> Quel est le message principal que Dieu veut me transmettre à travers ce verset ?
                        </p>
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4 border-amber-500">
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                Réfléchis et formule en une phrase l'enseignement central de ce verset...
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Image Mentale */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                            Image Mentale
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 dark:text-slate-300">
                            <strong>Visualise :</strong> Crée une image mentale forte pour ancrer ce verset dans ta mémoire.
                        </p>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">🎨 Scène</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Imagine un lieu, des personnages, une action...
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="font-medium text-purple-700 dark:text-purple-400 mb-2">🔗 Associations</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Lie cette image à des mots-clés du verset
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Lecture Typologique */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ArrowRight className="w-5 h-5 text-green-600" />
                            Lecture Typologique
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 mb-4">
                            <strong>AT → NT :</strong> Comment ce verset préfigure ou s'accomplit dans le Christ et son Église ?
                        </p>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="typologie">
                                <AccordionTrigger className="text-sm">Voir les connexions typologiques</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                        <p>• Ce verset peut préfigurer un mystère du Christ (Incarnation, Passion, Résurrection...)</p>
                                        <p>• Il peut aussi annoncer un sacrement de l'Église</p>
                                        <p>• Ou encore prophétiser la vie de grâce des fidèles</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* 4. Section Apologétique */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="w-5 h-5 text-red-600" />
                            Apologétique
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 mb-4">
                            <strong>Défendre la foi :</strong> Quelle vérité catholique ce verset affirme-t-il face aux objections ?
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="font-medium text-green-700 dark:text-green-400 mb-1">✓ Vérité affirmée</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Quelle doctrine catholique ce verset soutient-il ?
                                </p>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="font-medium text-red-700 dark:text-red-400 mb-1">✗ Objection courante</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Comment certains interprètent-ils mal ce passage ?
                                </p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">↪ Réponse catholique</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Comment répondre avec charité et vérité ?
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Application Spirituelle */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Heart className="w-5 h-5 text-pink-600" />
                            Application Spirituelle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 mb-4">
                            <strong>Vie concrète :</strong> Comment ce verset peut-il transformer ma vie aujourd'hui ?
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">🙏 Prière</p>
                                <p className="text-sm text-slate-500">Un point d'oraison</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">🎯 Action</p>
                                <p className="text-sm text-slate-500">Un geste concret</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">💪 Vertu</p>
                                <p className="text-sm text-slate-500">Une vertu à cultiver</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Astuce Mémoire */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Brain className="w-5 h-5 text-purple-600" />
                            Astuce Mémoire
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 mb-4">
                            <strong>Technique :</strong> Utilise cette astuce pour graver ce verset dans ta mémoire.
                        </p>
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <p className="font-medium text-purple-700 dark:text-purple-400 mb-2">
                                <Sparkles className="w-4 h-4 inline mr-1" />
                                Méthode des premières lettres
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Prends la première lettre de chaque mot clé du verset pour former un acronyme mémorable.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Button */}
            <div className="mt-8 flex justify-center">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8">
                    ✓ Marquer comme mémorisé
                </Button>
            </div>
        </DashboardLayout>
    );
};

export default VersePage;
