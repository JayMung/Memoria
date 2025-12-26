import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Star,
    Book,
    Search,
    X,
    Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery, useAction } from "convex/react";
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

interface SearchResult {
    bookId: string;
    bookName: string;
    chapter: number;
    verse: number;
    text: string;
    highlight: string;
}

interface AISearchResult {
    reference: string;
    text: string;
    explanation: string;
}

type ViewStep = "testament" | "books" | "chapters" | "verses" | "search" | "ai-search";

const BiblePage = () => {
    const navigate = useNavigate();
    const [booksData, setBooksData] = useState<BooksData | null>(null);
    const [currentStep, setCurrentStep] = useState<ViewStep>("testament");
    const [selectedTestament, setSelectedTestament] = useState<"at" | "nt" | null>(null);
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [chapterContent, setChapterContent] = useState<{ verses: { v: number; t: string }[] } | null>(null);
    const [loadingChapter, setLoadingChapter] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Search state
    const [globalSearchQuery, setGlobalSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // AI Search state
    const [aiSearchQuery, setAiSearchQuery] = useState("");
    const [aiResults, setAiResults] = useState<AISearchResult[]>([]);
    const [isAISearching, setIsAISearching] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [cameFromSearch, setCameFromSearch] = useState<"ai-search" | "search" | null>(null);
    const searchBibleAI = useAction(api.aiSearch.searchBibleAI);

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

    // Global search function
    const performGlobalSearch = useCallback(async (query: string) => {
        if (!query.trim() || !booksData) return;

        setIsSearching(true);
        setSearchResults([]);
        setSearchPerformed(true);

        const allBooks = [...booksData.at, ...booksData.nt];
        const results: SearchResult[] = [];
        const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

        // Limit search to avoid performance issues
        const maxResults = 100;
        let searchedChapters = 0;
        const maxChapters = 200; // Limit chapters to search

        for (const book of allBooks) {
            if (results.length >= maxResults || searchedChapters >= maxChapters) break;

            for (let chapter = 1; chapter <= book.chapters; chapter++) {
                if (results.length >= maxResults || searchedChapters >= maxChapters) break;

                try {
                    const response = await fetch(`/bible/${book.id}_${chapter}.json`);
                    if (!response.ok) continue;

                    const data = await response.json();
                    searchedChapters++;

                    for (const verse of data.verses || []) {
                        const verseLower = verse.t.toLowerCase();
                        const matchesAll = searchTerms.every(term => verseLower.includes(term));

                        if (matchesAll) {
                            // Create highlighted text
                            let highlight = verse.t;
                            searchTerms.forEach(term => {
                                const regex = new RegExp(`(${term})`, 'gi');
                                highlight = highlight.replace(regex, '**$1**');
                            });

                            results.push({
                                bookId: book.id,
                                bookName: book.name,
                                chapter,
                                verse: verse.v,
                                text: verse.t,
                                highlight,
                            });

                            if (results.length >= maxResults) break;
                        }
                    }
                } catch (e) {
                    // Skip failed fetches
                }
            }
        }

        setSearchResults(results);
        setIsSearching(false);
    }, [booksData]);

    // Quick search - search by reference (e.g., "Jean 3:16")
    const parseReference = (query: string): { book: string; chapter?: number; verse?: number } | null => {
        // Pattern: "BookName Chapter:Verse" or "BookName Chapter" or just "BookName"
        const patterns = [
            /^(.+?)\s+(\d+)\s*:\s*(\d+)$/i, // "Jean 3:16"
            /^(.+?)\s+(\d+)\s*,\s*(\d+)$/i, // "Jean 3,16"
            /^(.+?)\s+(\d+)$/i, // "Jean 3"
            /^(\d+)\s*(.+?)\s+(\d+)\s*:\s*(\d+)$/i, // "1 Jean 3:16"
            /^(\d+)\s*(.+?)\s+(\d+)$/i, // "1 Jean 3"
        ];

        for (const pattern of patterns) {
            const match = query.match(pattern);
            if (match) {
                if (pattern.source.includes('(\\d+)\\s*(.+?)')) {
                    // Pattern with leading number (1 Jean, 2 Corinthiens, etc.)
                    const prefix = match[1];
                    const bookBase = match[2];
                    const fullBook = `${prefix}${bookBase}`;
                    return {
                        book: fullBook,
                        chapter: parseInt(match[3]),
                        verse: match[4] ? parseInt(match[4]) : undefined,
                    };
                } else {
                    return {
                        book: match[1],
                        chapter: parseInt(match[2]),
                        verse: match[3] ? parseInt(match[3]) : undefined,
                    };
                }
            }
        }

        // Just a book name
        if (query.trim().length > 0 && !query.includes(' ')) {
            return { book: query.trim() };
        }

        return null;
    };

    // Handle search submit
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!globalSearchQuery.trim()) return;

        // Try to parse as reference first
        const ref = parseReference(globalSearchQuery);
        if (ref && booksData) {
            const allBooks = [...booksData.at, ...booksData.nt];
            const matchedBook = allBooks.find(b =>
                b.name.toLowerCase().includes(ref.book.toLowerCase()) ||
                b.abbr.toLowerCase() === ref.book.toLowerCase() ||
                b.id.toLowerCase().includes(ref.book.toLowerCase().replace(/\s/g, ''))
            );

            if (matchedBook) {
                setSelectedBook(matchedBook);
                if (ref.chapter) {
                    setSelectedChapter(ref.chapter);
                    setCurrentStep("verses");
                } else {
                    setCurrentStep("chapters");
                }
                return;
            }
        }

        // Otherwise, perform keyword search
        setCurrentStep("search");
        performGlobalSearch(globalSearchQuery);
    };

    // Handle AI search submit
    const handleAISearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!aiSearchQuery.trim()) return;

        setIsAISearching(true);
        setAiError(null);
        setAiResults([]);
        setCurrentStep("ai-search");

        try {
            const result = await searchBibleAI({ query: aiSearchQuery });

            if (result.success) {
                setAiResults(result.results);
            } else {
                setAiError(result.error || "Erreur lors de la recherche IA");
            }
        } catch (error) {
            setAiError("Erreur de connexion. Vérifiez votre connexion internet.");
        } finally {
            setIsAISearching(false);
        }
    };

    // Navigation handlers
    const handleSelectTestament = (testament: "at" | "nt") => {
        setSelectedTestament(testament);
        setCurrentStep("books");
    };

    const handleSelectBook = (book: BibleBook) => {
        setSelectedBook(book);
        setCurrentStep("chapters");
    };

    const handleSelectChapter = (chapter: number) => {
        setSelectedChapter(chapter);
        setCurrentStep("verses");
    };

    const handleSelectVerse = (verse: number) => {
        if (selectedBook && selectedChapter) {
            navigate(`/verse/${selectedBook.id}_${selectedChapter}_${verse}`);
        }
    };

    const handleSelectSearchResult = (result: SearchResult) => {
        // Navigate to chapter view within Bible page
        if (!booksData) return;

        const allBooks = [...booksData.at, ...booksData.nt];
        const matchedBook = allBooks.find(b => b.id === result.bookId);

        if (matchedBook) {
            setCameFromSearch("search"); // Remember we came from keyword search
            setSelectedBook(matchedBook);
            setSelectedChapter(result.chapter);
            setCurrentStep("verses");
        }
    };

    // Handle AI search result click - parse reference and navigate to chapter view
    const handleSelectAIResult = (result: AISearchResult) => {
        if (!booksData) return;

        // Parse reference like "Genèse 15:9-10" or "1 Corinthiens 3:15"
        const ref = result.reference;

        // Extract book name, chapter, and verse(s)
        const patterns = [
            /^(\d+\s*)?(.+?)\s+(\d+)\s*[:\s,]\s*(\d+)(?:\s*-\s*\d+)?$/i,  // "1 Corinthiens 3:15" or "Genèse 15:9-10"
            /^(\d+\s*)?(.+?)\s+(\d+)$/i,  // "Genèse 15"
        ];

        let bookName = "";
        let chapter = 1;

        for (const pattern of patterns) {
            const match = ref.match(pattern);
            if (match) {
                const prefix = match[1]?.trim() || "";
                bookName = (prefix + match[2]).trim();
                chapter = parseInt(match[3]) || 1;
                break;
            }
        }

        if (!bookName) {
            console.error("Could not parse reference:", ref);
            return;
        }

        // Find matching book in our data
        const allBooks = [...booksData.at, ...booksData.nt];
        const normalizedSearch = bookName.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/\s+/g, "");

        const matchedBook = allBooks.find(b => {
            const normalizedName = b.name.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "");
            const normalizedId = b.id.toLowerCase();

            return normalizedName.includes(normalizedSearch) ||
                normalizedSearch.includes(normalizedName) ||
                normalizedId.includes(normalizedSearch) ||
                normalizedSearch.includes(normalizedId);
        });

        if (matchedBook) {
            // Navigate to chapter view within Bible page
            setCameFromSearch("ai-search"); // Remember we came from AI search
            setSelectedBook(matchedBook);
            setSelectedChapter(chapter);
            setCurrentStep("verses");
        } else {
            console.error("Book not found:", bookName);
        }
    };

    const handleBack = () => {
        switch (currentStep) {
            case "search":
                setCurrentStep("testament");
                setGlobalSearchQuery("");
                setSearchResults([]);
                setSearchPerformed(false);
                setCameFromSearch(null);
                break;
            case "ai-search":
                setCurrentStep("testament");
                // Keep the AI results so user can see them if they navigate back
                break;
            case "books":
                setSelectedTestament(null);
                setCurrentStep("testament");
                setSearchQuery("");
                break;
            case "chapters":
                setSelectedBook(null);
                setCurrentStep("books");
                setCameFromSearch(null);
                break;
            case "verses":
                setSelectedChapter(null);
                setChapterContent(null);
                // If we came from a search, go back to those results
                if (cameFromSearch === "ai-search") {
                    setCurrentStep("ai-search");
                    setSelectedBook(null);
                    setCameFromSearch(null);
                } else if (cameFromSearch === "search") {
                    setCurrentStep("search");
                    setSelectedBook(null);
                    setCameFromSearch(null);
                } else {
                    setCurrentStep("chapters");
                }
                break;
        }
    };

    const clearGlobalSearch = () => {
        setGlobalSearchQuery("");
        setSearchResults([]);
        setSearchPerformed(false);
        if (currentStep === "search") {
            setCurrentStep("testament");
        }
    };

    // Check if Memoria Fidei content exists
    const hasMemoriaContent = (bookId: string, chapter: number) => {
        const chapterId = `${bookId}_${chapter}`;
        return memoriaContent.some((c) => c.chapterId === chapterId);
    };

    // Filter books by search
    const getFilteredBooks = () => {
        if (!booksData || !selectedTestament) return [];
        const books = booksData[selectedTestament];
        if (!searchQuery) return books;
        return books.filter(
            (book) =>
                book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.abbr.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // Get step title
    const getStepTitle = () => {
        switch (currentStep) {
            case "testament":
                return "Bible Catholique";
            case "search":
                return "Recherche";
            case "ai-search":
                return "Recherche IA";
            case "books":
                return selectedTestament === "at" ? "Ancien Testament" : "Nouveau Testament";
            case "chapters":
                return selectedBook?.name || "";
            case "verses":
                return `${selectedBook?.name} ${selectedChapter}`;
        }
    };

    // Render Global Search Bar
    const renderGlobalSearchBar = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Keyword Search */}
            <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                    <form onSubmit={handleSearchSubmit}>
                        <div className="flex items-center gap-2 mb-3">
                            <Search className="w-5 h-5 text-amber-600" />
                            <h3 className="font-bold text-amber-800 dark:text-amber-300">Recherche par mots-clés</h3>
                        </div>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Jean 3:16, amour, résurrection..."
                                value={globalSearchQuery}
                                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                                className="pr-10 bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-700 focus:border-amber-500"
                            />
                            {globalSearchQuery && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                    onClick={clearGlobalSearch}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-amber-100" onClick={() => setGlobalSearchQuery("Jean 3:16")}>
                                Jean 3:16
                            </Badge>
                            <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-amber-100" onClick={() => setGlobalSearchQuery("amour")}>
                                amour
                            </Badge>
                            <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-amber-100" onClick={() => setGlobalSearchQuery("Psaume 23")}>
                                Psaume 23
                            </Badge>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* AI Search */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                    <form onSubmit={handleAISearchSubmit}>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <h3 className="font-bold text-purple-800 dark:text-purple-300">Recherche IA</h3>
                            <Badge className="bg-purple-500 text-white text-xs">Nouveau</Badge>
                        </div>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Le verset qui parle d'être sauvé par le feu..."
                                value={aiSearchQuery}
                                onChange={(e) => setAiSearchQuery(e.target.value)}
                                className="pr-12 bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-700 focus:border-purple-500"
                            />
                            <Button
                                type="submit"
                                disabled={!aiSearchQuery.trim() || isAISearching}
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                            >
                                {isAISearching ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-purple-100 border-purple-300" onClick={() => setAiSearchQuery("le verset sur être sauvé au travers le feu")}>
                                🔥 sauvé par le feu
                            </Badge>
                            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-purple-100 border-purple-300" onClick={() => setAiSearchQuery("versets sur la confession")}>
                                ✝️ confession
                            </Badge>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    // Render AI Search Results
    const renderAISearchResults = () => (
        <div className="space-y-4">
            {isAISearching ? (
                <div className="flex flex-col items-center py-12">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
                        <Sparkles className="w-6 h-6 text-purple-400 absolute top-0 right-0 animate-pulse" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mt-4 font-medium">L'IA analyse votre question...</p>
                    <p className="text-xs text-slate-500 mt-1">Recherche des versets les plus pertinents</p>
                </div>
            ) : aiError ? (
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-700 dark:text-red-400 mb-4">❌ {aiError}</p>
                        <Button variant="outline" onClick={() => setCurrentStep("testament")}>
                            Retour
                        </Button>
                    </CardContent>
                </Card>
            ) : aiResults.length === 0 ? (
                <Card className="p-8 text-center">
                    <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">Aucun verset trouvé pour cette recherche.</p>
                </Card>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {aiResults.length} verset{aiResults.length > 1 ? 's' : ''} trouvé{aiResults.length > 1 ? 's' : ''}
                        </Badge>
                        <span className="text-xs text-slate-500">pour "{aiSearchQuery}"</span>
                    </div>
                    <ScrollArea className="h-[calc(100vh-340px)]">
                        <div className="space-y-3 pr-2">
                            {aiResults.map((result, index) => (
                                <Card
                                    key={index}
                                    className="border-l-4 border-l-purple-500 hover:shadow-lg hover:border-l-indigo-600 transition-all cursor-pointer"
                                    onClick={() => handleSelectAIResult(result)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                                                📖 {result.reference}
                                            </Badge>
                                            <ChevronRight className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <p className="text-slate-800 dark:text-slate-200 font-serif text-base leading-relaxed mb-3 italic">
                                            "{result.text}"
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                                            💡 {result.explanation}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </>
            )}
        </div>
    );

    // Render Search Results
    const renderSearchResults = () => (
        <div className="space-y-4">
            {isSearching ? (
                <div className="flex flex-col items-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-600 mb-4" />
                    <p className="text-slate-500">Recherche en cours dans la Bible...</p>
                    <p className="text-xs text-slate-400">Cela peut prendre quelques secondes</p>
                </div>
            ) : searchPerformed && searchResults.length === 0 ? (
                <div className="text-center py-12">
                    <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Aucun résultat trouvé
                    </h3>
                    <p className="text-slate-500 text-sm mb-4">
                        Essayez avec d'autres mots-clés ou une référence précise
                    </p>
                    <Button variant="outline" onClick={clearGlobalSearch}>
                        Nouvelle recherche
                    </Button>
                </div>
            ) : (
                <>
                    {searchResults.length > 0 && (
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-amber-100 text-amber-800">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                            </Badge>
                            <p className="text-xs text-slate-400">
                                Cliquez pour ouvrir la fiche
                            </p>
                        </div>
                    )}
                    <ScrollArea className="h-[calc(100vh-340px)]">
                        <div className="space-y-2 pr-2">
                            {searchResults.map((result, index) => (
                                <Card
                                    key={`${result.bookId}_${result.chapter}_${result.verse}_${index}`}
                                    className="cursor-pointer hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                                    onClick={() => handleSelectSearchResult(result)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Badge variant="outline" className="shrink-0 bg-slate-50">
                                                {result.bookName} {result.chapter}:{result.verse}
                                            </Badge>
                                            <p
                                                className="text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed flex-1"
                                                dangerouslySetInnerHTML={{
                                                    __html: result.highlight.replace(/\*\*(.+?)\*\*/g, '<mark class="bg-amber-200 dark:bg-amber-800 px-0.5 rounded">$1</mark>')
                                                }}
                                            />
                                            <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </>
            )}
        </div>
    );

    // Render Testament Selection
    const renderTestamentSelection = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                    className="cursor-pointer hover:border-amber-500 transition-all active:scale-98"
                    onClick={() => handleSelectTestament("at")}
                >
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <Book className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                                    Ancien Testament
                                </h3>
                                <p className="text-sm text-slate-500">{booksData?.at.length || 46} livres</p>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-400" />
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:border-amber-500 transition-all active:scale-98"
                    onClick={() => handleSelectTestament("nt")}
                >
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                <Book className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                                    Nouveau Testament
                                </h3>
                                <p className="text-sm text-slate-500">{booksData?.nt.length || 27} livres</p>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-400" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    // Render Books List
    const renderBooksList = () => {
        const filteredBooks = getFilteredBooks();

        return (
            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Rechercher un livre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Books */}
                <ScrollArea className="h-[calc(100vh-340px)]">
                    <div className="space-y-2">
                        {filteredBooks.map((book) => (
                            <Card
                                key={book.id}
                                className="cursor-pointer hover:border-amber-500 transition-all active:scale-98"
                                onClick={() => handleSelectBook(book)}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                            {book.name}
                                        </span>
                                        {book.deuterocanonical && (
                                            <Badge variant="outline" className="text-xs">DC</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-400">{book.chapters} ch.</span>
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        );
    };

    // Render Chapters Grid
    const renderChaptersGrid = () => {
        if (!selectedBook) return null;

        return (
            <div className="space-y-4">
                <p className="text-sm text-slate-500 text-center">
                    {selectedBook.chapters} chapitres
                </p>

                <ScrollArea className="h-[calc(100vh-340px)]">
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 p-1">
                        {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => {
                            const hasFiche = hasMemoriaContent(selectedBook.id, chapter);
                            return (
                                <Button
                                    key={chapter}
                                    variant="outline"
                                    className={`h-12 w-full relative ${hasFiche
                                        ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20"
                                        : ""
                                        }`}
                                    onClick={() => handleSelectChapter(chapter)}
                                >
                                    {chapter}
                                    {hasFiche && (
                                        <Star className="w-3 h-3 absolute -top-1 -right-1 text-amber-500 fill-amber-500" />
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        );
    };

    // Render Verses List
    const renderVersesList = () => {
        if (loadingChapter) {
            return (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            );
        }

        if (!chapterContent) {
            return (
                <div className="text-center py-12 text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Contenu non disponible</p>
                </div>
            );
        }

        return (
            <ScrollArea className="h-[calc(100vh-340px)]">
                <div className="space-y-1 pr-2">
                    {chapterContent.verses.map((verse) => (
                        <Card
                            key={verse.v}
                            className="cursor-pointer hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all active:scale-98"
                            onClick={() => handleSelectVerse(verse.v)}
                        >
                            <CardContent className="p-4 flex gap-3">
                                <span className="text-amber-600 font-bold text-sm w-6 shrink-0">
                                    {verse.v}
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 font-serif text-sm leading-relaxed flex-1">
                                    {verse.t}
                                </p>
                                <ChevronRight className="w-5 h-5 text-slate-300 shrink-0 self-center" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        );
    };

    return (
        <DashboardLayout>
            {/* Global Search Bar - Always visible on testament view */}
            {currentStep === "testament" && renderGlobalSearchBar()}

            {/* Header with Back Button */}
            <div className="flex items-center gap-3 mb-6">
                {currentStep !== "testament" && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="shrink-0"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 truncate">
                        {getStepTitle()}
                    </h1>
                    {currentStep === "verses" && selectedBook && selectedChapter && (
                        <p className="text-sm text-slate-500">
                            Clique sur un verset pour la fiche MEMORIA FIDEI
                        </p>
                    )}
                    {currentStep === "search" && globalSearchQuery && (
                        <p className="text-sm text-slate-500">
                            Résultats pour "{globalSearchQuery}"
                        </p>
                    )}
                    {currentStep === "ai-search" && aiSearchQuery && (
                        <p className="text-sm text-purple-600 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Recherche IA: "{aiSearchQuery}"
                        </p>
                    )}
                </div>
            </div>

            {/* Content based on current step */}
            {!booksData ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            ) : (
                <>
                    {currentStep === "testament" && renderTestamentSelection()}
                    {currentStep === "search" && renderSearchResults()}
                    {currentStep === "ai-search" && renderAISearchResults()}
                    {currentStep === "books" && renderBooksList()}
                    {currentStep === "chapters" && renderChaptersGrid()}
                    {currentStep === "verses" && renderVersesList()}
                </>
            )}
        </DashboardLayout>
    );
};

export default BiblePage;
