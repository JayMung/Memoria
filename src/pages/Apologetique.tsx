import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
    Shield,
    ChevronLeft,
    ChevronRight,
    Loader2,
    BookOpen,
    CheckCircle2,
    MessageCircle,
    Sparkles,
    Quote,
    Bot,
    Send,
    History
} from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

type ViewStep = "categories" | "list" | "fiche" | "assistant";

const CATEGORIES = [
    { id: "sacrements", name: "Sacrements", icon: "🍞", color: "purple" },
    { id: "marie", name: "Marie", icon: "🌹", color: "pink" },
    { id: "eglise", name: "Eglise", icon: "⛪", color: "blue" },
    { id: "ecriture", name: "Ecriture", icon: "📖", color: "amber" },
    { id: "pratiques", name: "Pratiques", icon: "🙏", color: "green" },
    { id: "doctrines", name: "Doctrines", icon: "✝️", color: "red" },
];

const ApologetiquePage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<ViewStep>("categories");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedFiche, setSelectedFiche] = useState<any>(null);

    // AI Assistant State
    const [aiQuery, setAiQuery] = useState("");
    const [aiResponse, setAiResponse] = useState<any>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const askApologist = useAction(api.aiApologetics.askApologist);

    // Queries
    const allFiches = useQuery(api.apologetique.list);
    const seedApologetique = useMutation(api.apologetique.seed);

    // Auto-seed if no fiches exist
    useEffect(() => {
        if (allFiches && allFiches.length === 0) {
            seedApologetique();
        }
    }, [allFiches]);

    const getCategoryCount = (categoryId: string) => {
        if (!allFiches) return 0;
        return allFiches.filter((f) => f.category === categoryId).length;
    };

    const getFichesForCategory = () => {
        if (!allFiches || !selectedCategory) return [];
        return allFiches.filter((f) => f.category === selectedCategory);
    };

    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setCurrentStep("list");
    };

    const handleSelectFiche = (fiche: any) => {
        setSelectedFiche(fiche);
        setCurrentStep("fiche");
    };

    const handleBack = () => {
        switch (currentStep) {
            case "list":
                setSelectedCategory(null);
                setCurrentStep("categories");
                break;
            case "fiche":
                setSelectedFiche(null);
                setCurrentStep("list");
                break;
            case "assistant":
                setCurrentStep("categories");
                setAiResponse(null);
                setAiQuery("");
                break;
        }
    };

    const handleAskAi = async () => {
        if (!aiQuery.trim()) return;
        setIsAiLoading(true);
        setAiResponse(null);

        try {
            const result = await askApologist({ query: aiQuery });
            if (result.success) {
                setAiResponse(result.data);
            } else {
                console.error(result.error);
                // Handle error
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsAiLoading(false);
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case "categories":
                return "Apologétique";
            case "list":
                const cat = CATEGORIES.find((c) => c.id === selectedCategory);
                return cat ? `${cat.icon} ${cat.name}` : "Fiches";
            case "fiche":
                return selectedFiche?.title || "Fiche";
            case "assistant":
                return "Assistant Apologète";
        }
    };

    // Render Assistant
    const renderAssistant = () => (
        <div className="space-y-6 h-full flex flex-col">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                            <Bot className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 dark:text-blue-100">Votre Apologète Personnel</h3>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Posez n'importe quelle question sur la foi catholique.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Response Area */}
            <ScrollArea className="flex-1 -mx-4 px-4">
                {isAiLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                        <p>Recherche des arguments...</p>
                        <p className="text-xs">Consultation des Pères de l'Église...</p>
                    </div>
                ) : aiResponse ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                        {/* Direct Answer */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-green-500" /> Réponse
                            </h4>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {aiResponse.directAnswer}
                            </p>
                        </div>

                        {/* Explanation */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-500" /> Explication Théologique
                            </h4>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                                {aiResponse.explanation}
                            </p>
                        </div>

                        {/* Bible Quotes */}
                        {aiResponse.biblicalQuotes?.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 px-1">
                                    <Quote className="w-4 h-4 text-amber-500" /> Écritures Saintes
                                </h4>
                                {aiResponse.biblicalQuotes.map((q: any, i: number) => (
                                    <Card key={i} className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10">
                                        <CardContent className="p-3">
                                            <p className="font-bold text-xs text-amber-800 dark:text-amber-400 mb-1">
                                                {q.reference}
                                            </p>
                                            <p className="text-sm italic text-slate-700 dark:text-slate-300">
                                                "{q.text}"
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Tradition Quotes */}
                        {aiResponse.traditionQuotes?.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 px-1">
                                    <Shield className="w-4 h-4 text-purple-500" /> Tradition & Magistère
                                </h4>
                                {aiResponse.traditionQuotes.map((q: any, i: number) => (
                                    <Card key={i} className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/10">
                                        <CardContent className="p-3">
                                            <p className="font-bold text-xs text-purple-800 dark:text-purple-400 mb-1">
                                                {q.source}
                                            </p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                {q.text}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Key Takeaway */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-4 shadow-lg">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm text-slate-200 mb-1 uppercase tracking-wider">L'essentiel</p>
                                    <p className="font-serif text-lg leading-relaxed">
                                        "{aiResponse.keyTakeaway}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-50">
                        <Shield className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
                        <p className="text-sm text-slate-500 text-center max-w-xs">
                            "Soyez toujours prêts à défendre l'espérance qui est en vous." <br />
                            <span className="text-xs font-bold">- 1 Pierre 3:15</span>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-8 w-full max-w-md">
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 py-2 justify-center" onClick={() => setAiQuery("Le Purgatoire est-il biblique ?")}>
                                🔥 Le Purgatoire
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 py-2 justify-center" onClick={() => setAiQuery("Pourquoi prier Marie ?")}>
                                🌹 Prier Marie
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 py-2 justify-center" onClick={() => setAiQuery("La présence réelle dans l'Eucharistie")}>
                                🍞 L'Eucharistie
                            </Badge>
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 py-2 justify-center" onClick={() => setAiQuery("Pourquoi faut-il se confesser à un prêtre ?")}>
                                ✝️ La Confession
                            </Badge>
                        </div>
                    </div>
                )}
            </ScrollArea>

            {/* Input Area */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky bottom-0">
                <div className="flex gap-2">
                    <Textarea
                        placeholder="Posez votre question (ex: Pourquoi le Pape ?)..."
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        className="resize-none min-h-[50px]"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAskAi();
                            }
                        }}
                    />
                    <Button
                        onClick={handleAskAi}
                        disabled={!aiQuery.trim() || isAiLoading}
                        className="h-auto aspect-square"
                    >
                        {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );

    // Render Categories
    const renderCategories = () => (
        <div className="space-y-4">
            {/* Header */}
            <div className="text-center py-4">
                <Shield className="w-12 h-12 mx-auto mb-3 text-red-600" />
                <p className="text-slate-500">
                    Défendre la foi catholique avec la Bible
                </p>
            </div>

            {/* AI Assistant Banner */}
            <Card
                className="cursor-pointer hover:border-blue-500 transition-all bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 mb-4"
                onClick={() => setCurrentStep("assistant")}
            >
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                Assistant Apologète
                            </h3>
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px] py-0 h-5">IA</Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                            Réponses immédiates pour vos débats
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                </CardContent>
            </Card>

            {/* Course Button */}
            <Card
                className="cursor-pointer hover:border-amber-500 transition-all bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 mb-4"
                onClick={() => navigate("/apologetique/cours")}
            >
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl shrink-0">
                        📖
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            Cours d'Apologétique
                        </h3>
                        <p className="text-xs text-slate-500">
                            8 leçons interactives avec quiz et flashcards
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                </CardContent>
            </Card>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => {
                    const count = getCategoryCount(category.id);
                    return (
                        <Card
                            key={category.id}
                            className="cursor-pointer hover:border-amber-500 transition-all active:scale-98 overflow-hidden"
                            onClick={() => handleSelectCategory(category.id)}
                        >
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl mb-2">{category.icon}</div>
                                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                    {category.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    {count} fiche{count > 1 ? "s" : ""}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Loading indicator or Refresh */}
            {!allFiches ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                </div>
            ) : (
                <div className="flex justify-center mt-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-400 gap-2"
                        onClick={async () => {
                            if (confirm("Mettre a jour le contenu ? Cela va recharger la page.")) {
                                const res = await seedApologetique();
                                alert(res);
                                window.location.reload();
                            }
                        }}
                    >
                        🔄 Actualiser le contenu
                    </Button>
                </div>
            )}
        </div>
    );

    // Render Fiches List
    const renderFichesList = () => {
        const fiches = getFichesForCategory();

        if (fiches.length === 0) {
            return (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-slate-500">Chargement...</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {fiches.map((fiche: any) => (
                    <Card
                        key={fiche._id}
                        className="cursor-pointer hover:border-amber-500 transition-all overflow-hidden"
                        onClick={() => handleSelectFiche(fiche)}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="text-2xl shrink-0">{fiche.icon}</div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                                    {fiche.title}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-1">
                                    {fiche.veriteCatholique.substring(0, 60)}...
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    // Render Fiche Detail
    const renderFicheDetail = () => {
        if (!selectedFiche) return null;

        return (
            <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-6 pr-2">
                    {/* Header */}
                    <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 overflow-hidden">
                        <CardContent className="p-4 text-center">
                            <div className="text-4xl mb-2">{selectedFiche.icon}</div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                {selectedFiche.title}
                            </h2>
                        </CardContent>
                    </Card>

                    {/* Verite Catholique */}
                    <section>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            Verite catholique
                        </h3>
                        <Card className="border-l-4 border-green-500">
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {selectedFiche.veriteCatholique}
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Explication */}
                    <section>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Explication
                        </h3>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {selectedFiche.explication}
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Typologie Biblique (si presente) */}
                    {selectedFiche.typologie && (
                        <section>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                                <span className="text-xl">🔄</span>
                                Typologie Biblique
                            </h3>
                            <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3 text-sm">
                                        <div className="text-center flex-1">
                                            <p className="font-bold text-slate-500 uppercase text-xs">Ancien Testament</p>
                                            <p className="font-serif font-bold text-amber-800 dark:text-amber-400">
                                                {selectedFiche.typologie.type}
                                            </p>
                                        </div>
                                        <div className="px-2 text-slate-400">➡️</div>
                                        <div className="text-center flex-1">
                                            <p className="font-bold text-slate-500 uppercase text-xs">Nouveau Testament</p>
                                            <p className="font-serif font-bold text-amber-800 dark:text-amber-400">
                                                {selectedFiche.typologie.antitype}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-slate-500 italic mb-2">
                                        {selectedFiche.typologie.reference}
                                    </p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 border-t border-amber-200/50 pt-2 mt-2">
                                        {selectedFiche.typologie.explication}
                                    </p>
                                </CardContent>
                            </Card>
                        </section>
                    )}

                    {/* Versets d'appui */}
                    <section>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                            <Quote className="w-5 h-5 text-amber-600" />
                            Versets d'appui
                        </h3>
                        <div className="space-y-2">
                            {selectedFiche.versetsAppui.map((v: any, i: number) => (
                                <Card key={i} className="border-l-4 border-amber-500">
                                    <CardContent className="p-3">
                                        <p className="font-semibold text-xs text-amber-700 dark:text-amber-400">
                                            {v.reference}
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                            "{v.texte}"
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Objections et Reponses */}
                    <section>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-red-600" />
                            Objections & Reponses
                        </h3>
                        <div className="space-y-4">
                            {selectedFiche.objections.map((obj: any, i: number) => (
                                <div key={i} className="space-y-2">
                                    <Card className="border-l-4 border-red-400 bg-red-50 dark:bg-red-900/20">
                                        <CardContent className="p-3">
                                            <p className="font-semibold text-xs text-red-700 dark:text-red-400 mb-1">
                                                ❓ Objection
                                            </p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                "{obj.question}"
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-l-4 border-green-400 bg-green-50 dark:bg-green-900/20">
                                        <CardContent className="p-3">
                                            <p className="font-semibold text-xs text-green-700 dark:text-green-400 mb-1">
                                                ✅ Reponse
                                            </p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                {obj.reponse}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Resume Memoriel */}
                    <section>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            Resume memoriel
                        </h3>
                        <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-300">
                            <CardContent className="p-4 text-center">
                                <p className="text-lg font-bold text-purple-800 dark:text-purple-300">
                                    {selectedFiche.resumeMemoriel}
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Versets cles */}
                    <section>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                            🔑 Versets cles a memoriser
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedFiche.versetsCles.map((v: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                    {v}
                                </Badge>
                            ))}
                        </div>
                    </section>
                </div>
            </ScrollArea>
        );
    };

    return (
        <DashboardLayout>
            {/* Header with Back Button */}
            <div className="flex items-center gap-3 mb-6">
                {currentStep !== "categories" && (
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
                    <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-50 truncate">
                        {getStepTitle()}
                    </h1>
                </div>
            </div>

            {/* Content */}
            {currentStep === "categories" && renderCategories()}
            {currentStep === "list" && renderFichesList()}
            {currentStep === "fiche" && renderFicheDetail()}
            {currentStep === "assistant" && renderAssistant()}
        </DashboardLayout>
    );
};

export default ApologetiquePage;
