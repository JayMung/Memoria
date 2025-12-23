import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import MemoriaFiche from "@/components/MemoriaFiche";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const ChapterPage = () => {
    const { chapterId } = useParams();
    const content = useQuery(api.memoria.getChapter, { chapterId: chapterId || "" });
    const [bibleText, setBibleText] = useState<{ verses: { v: number; t: string }[] } | null>(null);

    useEffect(() => {
        if (chapterId) {
            fetch(`/bible/${chapterId}.json`)
                .then((res) => res.json())
                .then((data) => setBibleText(data))
                .catch((err) => console.error("Failed to load bible text:", err));
        }
    }, [chapterId]);

    if (content === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    if (content === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Chapitre non trouvé</h1>
                <Link to="/dashboard">
                    <Button variant="outline">Retour au Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <Header />

            <div className="sticky top-16 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b p-4 mb-8">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ChevronLeft className="w-4 h-4" /> Retour
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{content.familleTheologique}</Badge>
                    </div>
                </div>
            </div>

            <main className="pb-24">
                <MemoriaFiche content={content} />

                {/* Static Bible Text Section */}
                {bibleText && (
                    <div className="max-w-3xl mx-auto px-4 mt-8 pb-12">
                        <h3 className="text-lg font-serif font-bold border-b pb-2 mb-4 text-slate-800 dark:text-slate-200">
                            Texte Biblique (Statique)
                        </h3>
                        <div className="space-y-4 font-serif text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                            {bibleText.verses.map((verse) => (
                                <p key={verse.v} className="flex gap-4">
                                    <span className="text-slate-400 text-sm font-sans pt-1 w-4 shrink-0">{verse.v}</span>
                                    <span>{verse.t}</span>
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm flex justify-center z-10">
                <Button className="w-full max-w-sm bg-amber-600 hover:bg-amber-700 text-white font-bold">
                    Marquer comme mémorisé
                </Button>
            </footer>
        </div>
    );
};

export default ChapterPage;
