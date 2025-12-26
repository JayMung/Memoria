import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    RotateCcw,
    Sparkles,
    ScrollText,
    Printer,
    ArrowRight
} from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { commandements, priereEspritSaint, acteContrition } from "@/data/commandements";

const ExamenConsciencePage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0=Intro, 1-10=Commandements, 11=Summary, 12=Generating, 13=Final
    const [selectedPeches, setSelectedPeches] = useState<Set<string>>(new Set());
    const [generatedPrayer, setGeneratedPrayer] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Mutations & Actions
    const saveExamen = useMutation(api.priere.saveExamen);
    const generatePrayerAction = useAction(api.aiPriere.generateConfessionPrayer);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Scroll to top on step change
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = 0;
        }
    }, [step]);

    const handleTogglePeche = (id: string) => {
        const newSelected = new Set(selectedPeches);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedPeches(newSelected);
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handlePrev = () => {
        setStep(prev => Math.max(0, prev - 1));
    };

    const handleGeneratePrayer = async () => {
        setStep(12); // Loading state
        setIsGenerating(true);

        try {
            // Get text of selected sins
            const pechesList = Array.from(selectedPeches).map(id => {
                // Find sin text
                for (const cmd of commandements) {
                    const peche = cmd.peches.find(p => p.id === id);
                    if (peche) return peche.text;
                }
                return "";
            }).filter(Boolean);

            const result = await generatePrayerAction({ peches: pechesList });

            if (result.success && result.prayer) {
                setGeneratedPrayer(result.prayer);
                setStep(13); // Final step

                // Save to DB immediately
                await saveExamen({
                    pechesIds: Array.from(selectedPeches),
                    generatedPrayer: result.prayer
                });
            } else {
                // Fallback if error
                console.error("AI Error:", result.error);
                setGeneratedPrayer("Seigneur, je te demande pardon pour tous mes péchés. Aide-moi à m'amender et à vivre selon ton amour.");
                setStep(13);
            }
        } catch (error) {
            console.error("Generation error:", error);
            setStep(13);
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Render Functions ---

    const renderIntro = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Examen de Conscience
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                    Prends un temps de calme pour relire ta vie à la lumière des commandements de Dieu, afin de recevoir sa miséricorde.
                </p>
            </div>

            <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
                <CardHeader>
                    <CardTitle className="text-lg text-purple-800 dark:text-purple-300">Prière à l'Esprit Saint</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="italic text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {priereEspritSaint.trim()}
                    </p>
                </CardContent>
            </Card>

            <Button
                onClick={handleNext}
                size="lg"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
                Commencer <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
    );

    const renderCommandment = (index: number) => {
        const cmd = commandements[index]; // array index 0-9

        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Commandement {cmd.numero}/10</span>
                    <span>{selectedPeches.size} péchés notés</span>
                </div>

                <Progress value={(cmd.numero / 10) * 100} className="h-2" />

                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-serif text-slate-900 dark:text-slate-100">
                            {cmd.titre}
                        </CardTitle>
                        <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                            {cmd.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cmd.peches.map((peche) => (
                            <div
                                key={peche.id}
                                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedPeches.has(peche.id)
                                        ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                                        : "bg-white border-slate-100 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900"
                                    }`}
                                onClick={() => handleTogglePeche(peche.id)}
                            >
                                <Checkbox
                                    checked={selectedPeches.has(peche.id)}
                                    // Managed by parent div click
                                    className="mt-1"
                                />
                                <label className="text-sm font-medium leading-none cursor-pointer text-slate-700 dark:text-slate-200 leading-relaxed">
                                    {peche.text}
                                </label>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={handlePrev} className="flex-1">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Retour
                    </Button>
                    <Button onClick={handleNext} className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white">
                        {index === 9 ? "Voir le résumé" : "Suivant"} <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderSummary = () => {
        const pechesList = Array.from(selectedPeches).map(id => {
            for (const cmd of commandements) {
                const peche = cmd.peches.find(p => p.id === id);
                if (peche) return { ...peche, cmdTitle: cmd.titre };
            }
            return null;
        }).filter(Boolean) as { id: string, text: string, cmdTitle: string }[];

        return (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Résumé de mon examen</h2>
                    <p className="text-slate-500 mt-2">Prêt à demander pardon ?</p>
                </div>

                <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ScrollText className="w-5 h-5 text-purple-600" />
                            Mes manquements ({pechesList.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pechesList.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                Aucun péché spécifique noté.
                                <br />"Si nous disons que nous n'avons pas de péché, nous nous abusons nous-mêmes" (1 Jean 1:8)
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {pechesList.map((p, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                        <span className="text-purple-500">•</span>
                                        <span>{p.text}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrev} className="flex-1">
                        Modifier
                    </Button>
                    <Button
                        onClick={handleGeneratePrayer}
                        className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                        <Sparkles className="w-4 h-4 mr-2" /> Générer ma prière de confession
                    </Button>
                </div>
            </div>
        );
    };

    const renderGenerating = () => (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4 animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                </div>
            </div>
            <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100">Rédaction de votre prière...</h3>
            <p className="text-slate-500 max-w-sm">
                L'IA compose un acte de contrition personnalisé basé sur votre examen.
            </p>
        </div>
    );

    const renderFinal = () => (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                    <Check className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Examen terminé</h2>
                <p className="text-slate-500">Vous pouvez réciter cette prière ou l'emporter pour votre confession.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Prière personnalisée */}
                <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-900/10">
                    <CardHeader>
                        <CardTitle className="text-purple-800 dark:text-purple-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Ma Prière Personnalisée
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-serif text-lg">
                            {generatedPrayer}
                        </p>
                    </CardContent>
                    <CardFooter className="justify-end pt-0">
                        <Button variant="ghost" size="sm" onClick={() => window.print()}>
                            <Printer className="w-4 h-4 mr-2" /> Imprimer
                        </Button>
                    </CardFooter>
                </Card>

                {/* Acte de Contrition Classique */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-slate-700 dark:text-slate-300">Acte de Contrition</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                            {acteContrition.trim()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center pt-4">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/priere")}
                    className="mr-4"
                >
                    Retour à l'accueil
                </Button>
                <Button
                    size="lg"
                    onClick={() => { setStep(0); setSelectedPeches(new Set()); setGeneratedPrayer(null); }}
                    className="bg-slate-900 text-white hover:bg-slate-800"
                >
                    <RotateCcw className="w-4 h-4 mr-2" /> Nouvel Examen
                </Button>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto px-4 py-6" ref={scrollAreaRef}>
                {step === 0 && renderIntro()}
                {step >= 1 && step <= 10 && renderCommandment(step - 1)}
                {step === 11 && renderSummary()}
                {step === 12 && renderGenerating()}
                {step === 13 && renderFinal()}
            </div>
        </DashboardLayout>
    );
};

export default ExamenConsciencePage;
