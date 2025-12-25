import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Play,
    Pause,
    RotateCcw,
    Check,
    BookOpen,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type ViewStep = "select" | "pray";

const SERIES_INFO = {
    joyeux: {
        name: "Mystères Joyeux",
        days: "Lundi, Samedi",
        color: "from-sky-400 to-blue-500",
        bgColor: "bg-sky-50 dark:bg-sky-900/20",
        icon: "😊"
    },
    lumineux: {
        name: "Mystères Lumineux",
        days: "Jeudi",
        color: "from-amber-400 to-yellow-500",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        icon: "✨"
    },
    douloureux: {
        name: "Mystères Douloureux",
        days: "Mardi, Vendredi",
        color: "from-red-400 to-rose-500",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        icon: "💔"
    },
    glorieux: {
        name: "Mystères Glorieux",
        days: "Mercredi, Dimanche",
        color: "from-purple-400 to-indigo-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        icon: "👑"
    },
};

const RosairePage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<ViewStep>("select");
    const [selectedSerie, setSelectedSerie] = useState<string | null>(null);
    const [currentMystereIndex, setCurrentMystereIndex] = useState(0);
    const [currentBead, setCurrentBead] = useState(0); // 0 = intro, 1-10 = Ave Maria, 11 = Gloria + Fatima
    const [isPraying, setIsPraying] = useState(false);

    const allMysteres = useQuery(api.priere.listMysteres);
    const savePrayerSession = useMutation(api.priere.savePrayerSession);

    // Get mystères for selected série
    const mysteres = allMysteres?.filter(m => m.serie === selectedSerie) || [];
    const currentMystere = mysteres[currentMystereIndex];
    const serieInfo = selectedSerie ? SERIES_INFO[selectedSerie as keyof typeof SERIES_INFO] : null;

    // Calculate today's recommended série
    const getTodaysSerie = () => {
        const day = new Date().getDay();
        switch (day) {
            case 0: return "glorieux"; // Dimanche
            case 1: return "joyeux"; // Lundi
            case 2: return "douloureux"; // Mardi
            case 3: return "glorieux"; // Mercredi
            case 4: return "lumineux"; // Jeudi
            case 5: return "douloureux"; // Vendredi
            case 6: return "joyeux"; // Samedi
            default: return "joyeux";
        }
    };

    const todaysSerie = getTodaysSerie();

    const handleSelectSerie = (serie: string) => {
        setSelectedSerie(serie);
        setCurrentMystereIndex(0);
        setCurrentBead(0);
        setCurrentStep("pray");
        setIsPraying(true);
    };

    const handleNextBead = () => {
        if (currentBead < 11) {
            setCurrentBead(currentBead + 1);
        } else {
            // Move to next mystère
            if (currentMystereIndex < 4) {
                setCurrentMystereIndex(currentMystereIndex + 1);
                setCurrentBead(0);
            } else {
                // Rosary complete!
                handleComplete();
            }
        }
    };

    const handlePrevBead = () => {
        if (currentBead > 0) {
            setCurrentBead(currentBead - 1);
        } else if (currentMystereIndex > 0) {
            setCurrentMystereIndex(currentMystereIndex - 1);
            setCurrentBead(11);
        }
    };

    const handleComplete = async () => {
        await savePrayerSession({
            type: "rosaire",
            details: selectedSerie || undefined,
        });
        setIsPraying(false);
        navigate("/priere");
    };

    const handleBack = () => {
        if (currentStep === "pray") {
            setCurrentStep("select");
            setSelectedSerie(null);
            setIsPraying(false);
        } else {
            navigate("/priere");
        }
    };

    const totalBeads = 5 * 12; // 5 mystères × 12 grains chacun
    const completedBeads = currentMystereIndex * 12 + currentBead;
    const progressPercent = (completedBeads / totalBeads) * 100;

    // Get current prayer text
    const getCurrentPrayer = () => {
        if (currentBead === 0) {
            return {
                title: "Notre Père",
                text: `Notre Père, qui es aux cieux,
que ton nom soit sanctifié,
que ton règne vienne,
que ta volonté soit faite sur la terre comme au ciel.

Donne-nous aujourd'hui notre pain de ce jour.
Pardonne-nous nos offenses,
comme nous pardonnons aussi à ceux qui nous ont offensés.
Et ne nous laisse pas entrer en tentation,
mais délivre-nous du Mal.

Amen.`,
            };
        } else if (currentBead <= 10) {
            return {
                title: `Je vous salue Marie (${currentBead}/10)`,
                text: `Je vous salue, Marie, pleine de grâce,
le Seigneur est avec vous.
Vous êtes bénie entre toutes les femmes,
et Jésus, le fruit de vos entrailles, est béni.

Sainte Marie, Mère de Dieu,
priez pour nous, pauvres pécheurs,
maintenant et à l'heure de notre mort.

Amen.`,
            };
        } else {
            return {
                title: "Gloire au Père",
                text: `Gloire au Père, et au Fils, et au Saint-Esprit.
Comme il était au commencement, maintenant et toujours,
pour les siècles des siècles.

Amen.

---

Ô mon Jésus, pardonnez-nous nos péchés,
préservez-nous du feu de l'enfer
et conduisez au Ciel toutes les âmes,
surtout celles qui ont le plus besoin de votre miséricorde.

Amen.`,
            };
        }
    };

    // Render Series Selection
    const renderSeriesSelection = () => (
        <div className="space-y-6">
            <div className="text-center py-4">
                <div className="text-5xl mb-3">📿</div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    Saint Rosaire
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Choisis les mystères à méditer
                </p>
            </div>

            {/* Today's recommendation */}
            <Card className={`${SERIES_INFO[todaysSerie as keyof typeof SERIES_INFO].bgColor} border-2 border-dashed`}>
                <CardContent className="p-4 text-center">
                    <Badge className="bg-green-500 text-white mb-2">
                        ✨ Recommandé aujourd'hui
                    </Badge>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                        {SERIES_INFO[todaysSerie as keyof typeof SERIES_INFO].name}
                    </p>
                    <Button
                        className="mt-3 w-full"
                        onClick={() => handleSelectSerie(todaysSerie)}
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Commencer
                    </Button>
                </CardContent>
            </Card>

            {/* All series */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Ou choisir une autre série
                </h3>
                {Object.entries(SERIES_INFO).map(([key, info]) => (
                    <Card
                        key={key}
                        className={`cursor-pointer transition-all hover:shadow-md ${info.bgColor}`}
                        onClick={() => handleSelectSerie(key)}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                                {info.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-800 dark:text-slate-200">
                                    {info.name}
                                </h4>
                                <p className="text-xs text-slate-500">{info.days}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    // Render Praying View
    const renderPraying = () => {
        if (!currentMystere || !serieInfo) return null;

        const prayer = getCurrentPrayer();

        return (
            <div className="space-y-4">
                {/* Progress Header */}
                <Card className={`${serieInfo.bgColor}`}>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <Badge className={`bg-gradient-to-r ${serieInfo.color} text-white`}>
                                {serieInfo.name}
                            </Badge>
                            <span className="text-sm text-slate-500">
                                Mystère {currentMystereIndex + 1}/5
                            </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                    </CardContent>
                </Card>

                {/* Current Mystery */}
                <Card className="border-l-4 border-l-indigo-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-5 h-5 text-indigo-500" />
                            <span className="text-xs text-slate-500 uppercase tracking-wide">
                                {currentMystere.reference}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                            {currentMystereIndex + 1}. {currentMystere.titre}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-3">
                            "{currentMystere.meditation}"
                        </p>
                        <Badge variant="secondary" className="text-xs">
                            🌿 Fruit : {currentMystere.fruit}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Bead Visualization */}
                <div className="flex justify-center gap-1 py-2">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-all ${i <= currentBead
                                    ? i === 0 ? "bg-amber-500 w-4 h-4" : i === 11 ? "bg-purple-500" : "bg-blue-500"
                                    : "bg-slate-200 dark:bg-slate-700"
                                }`}
                        />
                    ))}
                </div>

                {/* Current Prayer */}
                <ScrollArea className="h-[280px]">
                    <Card>
                        <CardContent className="p-6">
                            <h4 className="text-lg font-bold text-center text-slate-800 dark:text-slate-200 mb-4">
                                {prayer.title}
                            </h4>
                            <p className="text-center text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {prayer.text}
                            </p>
                        </CardContent>
                    </Card>
                </ScrollArea>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePrevBead}
                        disabled={currentMystereIndex === 0 && currentBead === 0}
                        className="flex-1"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        size="lg"
                        onClick={handleNextBead}
                        className="flex-[2] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                        {currentMystereIndex === 4 && currentBead === 11 ? (
                            <>
                                <Check className="w-5 h-5 mr-2" />
                                Terminer
                            </>
                        ) : (
                            <>
                                Suivant
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    };

    if (!allMysteres) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-50 truncate">
                        {currentStep === "select" ? "Chapelet / Rosaire" : serieInfo?.name || "Rosaire"}
                    </h1>
                </div>
                {currentStep === "pray" && (
                    <Button variant="ghost" size="icon" onClick={() => {
                        setCurrentMystereIndex(0);
                        setCurrentBead(0);
                    }}>
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Content */}
            {currentStep === "select" && renderSeriesSelection()}
            {currentStep === "pray" && renderPraying()}
        </DashboardLayout>
    );
};

export default RosairePage;
