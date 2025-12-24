import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, ChevronRight, Book, FileText, Loader2, Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface BibleBook {
    id: string;
    name: string;
    abbr: string;
    chapters: number;
    deuterocanonical?: boolean;
}

interface BooksData {
    at: BibleBook[];
    nt: BibleBook[];
}

const BiblePage = () => {
    const [booksData, setBooksData] = useState<BooksData | null>(null);
    const [selectedTestament, setSelectedTestament] = useState<"at" | "nt">("at");
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [chapterContent, setChapterContent] = useState<{ verses: { v: number; t: string }[] } | null>(null);
    const [loadingChapter, setLoadingChapter] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Get available Memoria Fidei content
    const memoriaContent = useQuery(api.memoria.listChapters) ?? [];

    // Load books.json on mount
    useEffect(() => {
        fetch("/bible/books.json")
            .then((res) => res.json())
            .then((data) => setBooksData(data))
            .catch((err) => console.error("Failed to load books:", err));
    }, []);

    // Load chapter content when selected
    useEffect(() => {
        if (selectedBook && selectedChapter) {
            setLoadingChapter(true);
            const chapterId = `${selectedBook.id}_${selectedChapter}`;
            fetch(`/bible/${chapterId}.json`)
                .then((res) => res.json())
                .then((data) => {
                    setChapterContent(data);
                    setLoadingChapter(false);
                })
                .catch(() => {
                    setChapterContent(null);
                    setLoadingChapter(false);
                });
        }
    }, [selectedBook, selectedChapter]);

    // Check if Memoria Fidei content exists for a chapter
    const hasMemoriaContent = (bookId: string, chapter: number) => {
        const chapterId = `${bookId}_${chapter}`;
        return memoriaContent.some((c) => c.chapterId === chapterId);
    };

    const currentBooks = booksData ? booksData[selectedTestament] : [];

    // Filter books by search query
    const filteredBooks = currentBooks.filter((book) =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.abbr.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Also search across all books if there's a query
    const allBooksFiltered = searchQuery && booksData
        ? [...booksData.at, ...booksData.nt].filter((book) =>
            book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.abbr.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : null;

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-amber-600" />
                    Bible Catholique
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    73 livres • Navigue et découvre les fiches Memoria Fidei
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Books List */}
                <div className="lg:col-span-4">
                    <Card className="h-fit">
                        <CardHeader className="pb-3 space-y-3">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Rechercher un livre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <Tabs value={selectedTestament} onValueChange={(v) => { setSelectedTestament(v as "at" | "nt"); setSelectedBook(null); setSelectedChapter(null); }}>
                                <TabsList className="w-full">
                                    <TabsTrigger value="at" className="flex-1">AT ({booksData?.at.length || 0})</TabsTrigger>
                                    <TabsTrigger value="nt" className="flex-1">NT ({booksData?.nt.length || 0})</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px] lg:h-[500px]">
                                {!booksData ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                                    </div>
                                ) : searchQuery && allBooksFiltered ? (
                                    // Show all matching books across testaments when searching
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {allBooksFiltered.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500">
                                                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                                <p>Aucun livre trouvé pour "{searchQuery}"</p>
                                            </div>
                                        ) : (
                                            allBooksFiltered.map((book) => (
                                                <button
                                                    key={book.id}
                                                    onClick={() => { setSelectedBook(book); setSelectedChapter(null); setChapterContent(null); setSearchQuery(""); }}
                                                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedBook?.id === book.id ? "bg-amber-50 dark:bg-amber-900/20" : ""}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Book className={`w-4 h-4 ${selectedBook?.id === book.id ? "text-amber-600" : "text-slate-400"}`} />
                                                        <span className={`text-sm font-medium ${selectedBook?.id === book.id ? "text-amber-700 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                            {book.name}
                                                        </span>
                                                        {book.deuterocanonical && (
                                                            <Badge variant="outline" className="text-xs py-0 px-1">DC</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-400">{book.chapters} ch.</span>
                                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredBooks.map((book) => (

                                            <button
                                                key={book.id}
                                                onClick={() => { setSelectedBook(book); setSelectedChapter(null); setChapterContent(null); }}
                                                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedBook?.id === book.id ? "bg-amber-50 dark:bg-amber-900/20" : ""
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Book className={`w-4 h-4 ${selectedBook?.id === book.id ? "text-amber-600" : "text-slate-400"}`} />
                                                    <span className={`text-sm font-medium ${selectedBook?.id === book.id ? "text-amber-700 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                        {book.name}
                                                    </span>
                                                    {book.deuterocanonical && (
                                                        <Badge variant="outline" className="text-xs py-0 px-1">DC</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">{book.chapters} ch.</span>
                                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Chapters & Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Chapter Selection */}
                    {selectedBook && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-amber-600" />
                                    {selectedBook.name}
                                    <span className="text-sm font-normal text-slate-500">— {selectedBook.chapters} chapitres</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => {
                                        const hasFiche = hasMemoriaContent(selectedBook.id, chapter);
                                        return (
                                            <Button
                                                key={chapter}
                                                variant={selectedChapter === chapter ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedChapter(chapter)}
                                                className={`w-10 h-10 p-0 relative ${selectedChapter === chapter
                                                    ? "bg-amber-600 hover:bg-amber-700"
                                                    : hasFiche
                                                        ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20"
                                                        : ""
                                                    }`}
                                            >
                                                {chapter}
                                                {hasFiche && selectedChapter !== chapter && (
                                                    <Star className="w-3 h-3 absolute -top-1 -right-1 text-amber-500 fill-amber-500" />
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Chapter Content */}
                    {selectedChapter && selectedBook && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-lg">
                                    {selectedBook.name} {selectedChapter}
                                </CardTitle>
                                {hasMemoriaContent(selectedBook.id, selectedChapter) && (
                                    <Link to={`/chapter/${selectedBook.id}_${selectedChapter}`}>
                                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                                            <Star className="w-4 h-4" />
                                            Voir la fiche Memoria Fidei
                                        </Button>
                                    </Link>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loadingChapter ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                                    </div>
                                ) : chapterContent ? (
                                    <ScrollArea className="h-[400px]">
                                        <div className="space-y-2 font-serif text-lg leading-relaxed text-slate-700 dark:text-slate-300 pr-4">
                                            {chapterContent.verses.map((verse) => (
                                                <Link
                                                    key={verse.v}
                                                    to={`/verse/${selectedBook.id}_${selectedChapter}_${verse.v}`}
                                                    className="flex gap-4 hover:bg-amber-100 dark:hover:bg-amber-900/30 p-3 rounded-lg transition-all cursor-pointer group border border-transparent hover:border-amber-300 dark:hover:border-amber-700"
                                                >
                                                    <span className="text-amber-600 text-sm font-sans font-bold w-6 shrink-0 pt-1 group-hover:scale-110 transition-transform">
                                                        {verse.v}
                                                    </span>
                                                    <span className="group-hover:text-slate-900 dark:group-hover:text-slate-100 flex-1">
                                                        {verse.t}
                                                    </span>
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 text-xs self-center whitespace-nowrap">
                                                        Ouvrir fiche →
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                        <p className="font-medium">Contenu non disponible</p>
                                        <p className="text-sm mt-1">Le texte de ce chapitre n'a pas encore été ajouté.</p>
                                        {hasMemoriaContent(selectedBook.id, selectedChapter) && (
                                            <Link to={`/chapter/${selectedBook.id}_${selectedChapter}`} className="mt-4 inline-block">
                                                <Button size="sm" variant="outline" className="gap-2">
                                                    <Star className="w-4 h-4 text-amber-500" />
                                                    Mais la fiche Memoria Fidei existe !
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {!selectedBook && (
                        <Card className="p-12 text-center">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 text-amber-200" />
                            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Sélectionne un livre
                            </h3>
                            <p className="text-slate-500">
                                Choisis un livre dans la liste pour voir ses chapitres et son contenu.
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BiblePage;
