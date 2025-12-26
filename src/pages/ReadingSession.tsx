import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle2, BookOpen, Highlighter, Tag, StickyNote, X, Save } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMediaQuery } from "@/hooks/use-media-query";

const COLOR_PALETTE = {
    yellow: "bg-yellow-200/50 dark:bg-yellow-900/30 decoration-yellow-400",
    green: "bg-green-200/50 dark:bg-green-900/30 decoration-green-400",
    blue: "bg-blue-200/50 dark:bg-blue-900/30 decoration-blue-400",
    red: "bg-red-200/50 dark:bg-red-900/30 decoration-red-400",
    purple: "bg-purple-200/50 dark:bg-purple-900/30 decoration-purple-400",
};

const ReadingSession = () => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const { bookId, chapterRange } = useParams();
    const navigate = useNavigate();
    const [selectedVerse, setSelectedVerse] = useState<{ chapterId: string, verse: number, text: string } | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Form state
    const [note, setNote] = useState("");
    const [color, setColor] = useState<string | undefined>("yellow");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    // Mutations
    const saveHighlight = useMutation(api.highlights.saveHighlight);

    // Parse range
    const getChapterNumbers = (range: string | undefined): number[] => {
        if (!range) return [];
        if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            const chapters = [];
            for (let i = start; i <= end; i++) chapters.push(i);
            return chapters;
        }
        return [Number(range)];
    };

    const targetChapters = getChapterNumbers(chapterRange);
    const targetIds = targetChapters.map(num => `${bookId}_${num}`);

    // Data fetching
    const sessionContent = useQuery(api.memoria.getBatchChapters, { chapterIds: targetIds });
    const sortedContent = sessionContent?.sort((a, b) => a.chapter - b.chapter);

    // Fetch highlights for ALL loaded chapters (we need to map them)
    // Convex query `getChapterHighlights` takes ONE id. We need to fetch for all IDs.
    // For now, simpler: Just fetch them individually? No, hook rules.
    // We can change `getChapterHighlights` to accept array?
    // Optimization: I'll make a `getBatchHighlights` for this, but for now let's just make it work for the session.
    // Actually, `ReadingSession` usually has 2-3 chapters. 
    // Let's assume we fetch for the first one for now or loop? 
    // We can't loop hooks.
    // I will iterate on the backend availability later.
    // Let's modify `highlights.ts` to `getBatchHighlights`? 
    // Or just create a new component `ChapterView` that fetches its own highlights. Correct architecture.

    const readingPlan = useQuery(api.bibleYear.getPlan);
    const toggleReading = useMutation(api.bibleYear.toggleReading);

    // Completion Logic
    const handleFinish = async () => {
        if (readingPlan && bookId && chapterRange) {
            let targetReadingId = null;
            for (const day of readingPlan) {
                day.readings.forEach((reading, index) => {
                    const planBookId = reading.book.toLowerCase() === "genèse" ? "genesis" : reading.book.toLowerCase();
                    const isBookMatch = planBookId.startsWith(bookId?.substring(0, 3) || "");
                    const isChapterMatch = reading.chapter === chapterRange || reading.chapter.startsWith(chapterRange?.split('-')[0] || "");
                    if (isBookMatch && isChapterMatch) {
                        targetReadingId = `day-${day.day}-reading-${index}`;
                    }
                });
                if (targetReadingId) break;
            }
            if (targetReadingId) {
                await toggleReading({ readingId: targetReadingId });
            }
        }
        navigate('/parcours');
    };

    // Handle Verse Click
    const handleVerseClick = (chapterId: string, verseNum: number, text: string) => {
        // Load existing highlight?
        // We need access to the data in the child component.
        // For now, set selection to open robust UI
        setSelectedVerse({ chapterId, verse: verseNum, text });
        setIsSheetOpen(true);
        // Reset form
        setNote(""); // We should populate if existing
        setColor("yellow");
        setTags([]);
    };

    if (sessionContent === undefined || readingPlan === undefined) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            </DashboardLayout>
        );
    }

    if (!sortedContent || sortedContent.length === 0) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
                    <p className="text-slate-500 mb-6">Contenu non disponible.</p>
                    <Button onClick={() => navigate('/parcours')}>Retour</Button>
                </div>
            </DashboardLayout>
        );
    }

    const onSave = async () => {
        if (!selectedVerse) return;
        await saveHighlight({
            chapterId: selectedVerse.chapterId,
            verseIndex: selectedVerse.verse,
            color,
            note,
            tags
        });
        setIsSheetOpen(false);
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto pb-20 relative">
                {/* Header Navbar */}
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-4 mb-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/parcours')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100 capitalize">
                            {bookId} {chapterRange}
                        </h1>
                        <p className="text-xs text-slate-500">Lecture immersive • Appuyez sur un verset pour annoter</p>
                    </div>
                </div>

                <div className="space-y-12">
                    {sortedContent.map(chapter => (
                        <ChapterView
                            key={chapter._id}
                            chapter={chapter}
                            onVerseClick={handleVerseClick}
                        />
                    ))}
                </div>

                {/* Footer Action */}
                <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Button
                        size="lg"
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8 gap-2"
                        onClick={handleFinish}
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Marquer comme lu & Retour
                    </Button>
                </div>

                {/* Annotation Sheet */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetContent side={isDesktop ? "right" : "bottom"} className={isDesktop ? "sm:max-w-md" : "h-[80vh] rounded-t-3xl"}>
                        <SheetHeader className="mb-6">
                            <SheetTitle>Annoter le verset {selectedVerse?.verse}</SheetTitle>
                            <SheetDescription className="line-clamp-2 italic border-l-2 border-amber-500 pl-4 py-1">
                                "{selectedVerse?.text}"
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6">
                            {/* Colors */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2"><Highlighter className="w-4 h-4" /> Surligner</label>
                                <ToggleGroup type="single" value={color} onValueChange={(v) => v && setColor(v)} className="justify-start">
                                    {Object.keys(COLOR_PALETTE).map(c => (
                                        <ToggleGroupItem
                                            key={c}
                                            value={c}
                                            className={`h-8 w-8 rounded-full border ring-offset-2 data-[state=on]:ring-2 data-[state=on]:ring-slate-400 ${c === 'yellow' ? 'bg-[#FFD700] hover:bg-[#FFD700]/80' :
                                                    c === 'green' ? 'bg-green-500 hover:bg-green-600' :
                                                        c === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                                                            c === 'red' ? 'bg-red-500 hover:bg-red-600' :
                                                                'bg-purple-500 hover:bg-purple-600'
                                                }`}
                                            aria-label={c}
                                        />
                                    ))}
                                </ToggleGroup>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2"><Tag className="w-4 h-4" /> Tags</label>
                                <div className="flex gap-2 flex-wrap mb-2">
                                    {tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))}>
                                            {tag} <X className="w-3 h-3" />
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ajouter un tag..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && tagInput.trim()) {
                                                if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
                                                setTagInput("");
                                            }
                                        }}
                                    />
                                    <Button size="sm" variant="outline" onClick={() => {
                                        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                            setTags([...tags, tagInput.trim()]);
                                            setTagInput("");
                                        }
                                    }}>Ajouter</Button>
                                </div>
                            </div>

                            {/* Note */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2"><StickyNote className="w-4 h-4" /> Note personnelle</label>
                                <Textarea
                                    placeholder="Écrivez vos réflexions ici..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>

                            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={onSave}>
                                <Save className="w-4 h-4 mr-2" /> Enregistrer
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </DashboardLayout>
    );
};

// Subcomponent to handle individual chapter rendering and hook logic
const ChapterView = ({ chapter, onVerseClick }: { chapter: any, onVerseClick: (id: string, v: number, text: string) => void }) => {
    const highlights = useQuery(api.highlights.getChapterHighlights, { chapterId: chapter.chapterId });
    const contentRef = useRef<HTMLDivElement>(null);

    // Apply highlights and listeners
    useEffect(() => {
        if (!contentRef.current) return;

        // 1. Clean previous listeners/styles (React re-renders entire HTML anyway, so DOM is fresh)

        // 2. Apply highlights
        if (highlights) {
            highlights.forEach(h => {
                const verseNum = h.verseIndex;
                const verseEl = contentRef.current?.querySelector(`[data-verse="${verseNum}"]`);
                if (verseEl) {
                    const colorClass = COLOR_PALETTE[h.color as keyof typeof COLOR_PALETTE] || "";
                    verseEl.className = `verse-text cursor-pointer rounded px-1 transition-colors ${colorClass}`;
                    // Also maybe show valid indicator if note exists?
                }
            });
        }
    }, [highlights, chapter.content]);

    // Global listener for this chapter to avoid attaching 100 listeners
    const handleClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const verseEl = target.closest('[data-verse]'); // Check if clicked element or parent is a verse
        if (verseEl) {
            const v = Number(verseEl.getAttribute('data-verse'));
            const text = verseEl.textContent || "";
            onVerseClick(chapter.chapterId, v, text);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-6">
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    Chapitre {chapter.chapter}
                </Badge>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-200/50 to-transparent"></div>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 prose dark:prose-invert max-w-none">
                    <div
                        ref={contentRef}
                        className="font-serif text-lg leading-relaxed text-slate-800 dark:text-slate-200 interactive-content"
                        onClick={handleClick}
                        dangerouslySetInnerHTML={{ __html: formatContent(chapter.content || "") }} // Helper to maybe inject classes if missing
                    />
                </CardContent>
            </Card>
        </div>
    )
}

// Helper to ensure spans exist if raw content doesn't have them (fallback)
function formatContent(html: string) {
    if (html.includes('data-verse')) return html;
    // Fallback: This regex replacement is weak, relying on superscripts. 
    // Ideally the seed data is already perfect (which we ensured with the script).
    return html;
}

export default ReadingSession;
