import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    BookOpen,
    ChevronRight,
    Loader2,
    Trophy,
    Lock,
    CheckCircle2,
    Play,
    ChevronLeft,
    Sparkles,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type ViewStep = "list" | "detail" | "etape";

const ParcoursPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<ViewStep>("list");
    const [selectedParcours, setSelectedParcours] = useState<any>(null);
    const [selectedEtape, setSelectedEtape] = useState<any>(null);

    // Queries
    const parcoursList = useQuery(api.parcours.list);
    const seedParcours = useMutation(api.parcours.seedHistoireSalut);

    // Auto-seed if no parcours exist
    useEffect(() => {
        if (parcoursList && parcoursList.length === 0) {
            seedParcours();
        }
    }, [parcoursList]);

    const handleSelectParcours = (parcours: any) => {
        setSelectedParcours(parcours);
        setCurrentStep("detail");
    };

    const handleSelectEtape = (etape: any) => {
        setSelectedEtape(etape);
        setCurrentStep("etape");
    };

    const handleBack = () => {
        switch (currentStep) {
            case "detail":
                setSelectedParcours(null);
                setCurrentStep("list");
                break;
            case "etape":
                setSelectedEtape(null);
                setCurrentStep("detail");
                break;
        }
    };

    const handleOpenVerset = (versetId: string) => {
        const params = new URLSearchParams({
            source: "parcours",
            parcours: selectedParcours?.slug || "",
            etape: selectedEtape?.id || "",
        });
        navigate(`/verse/${versetId}?${params.toString()}`);
    };

    // Get step title
    const getStepTitle = () => {
        switch (currentStep) {
            case "list":
                return "Parcours Bibliques";
            case "detail":
                return selectedParcours?.title || "";
            case "etape":
                return selectedEtape?.title || "";
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "histoire":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case "thematique":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "doctrinal":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    // Render Parcours List
    const renderParcoursList = () => {
        if (!parcoursList) {
            return (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            );
        }

        if (parcoursList.length === 0) {
            return (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-slate-500">Chargement des parcours...</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center py-4">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-amber-600" />
                    <p className="text-slate-500">
                        Explorez la Bible de maniere structuree
                    </p>
                </div>

                {/* Parcours Grid */}
                <div className="space-y-4">
                    {parcoursList.map((parcours: any) => (
                        <Card
                            key={parcours._id}
                            className="cursor-pointer hover:border-amber-500 transition-all active:scale-98 overflow-hidden"
                            onClick={() => handleSelectParcours(parcours)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl shrink-0">{parcours.icon}</div>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 truncate">
                                            {parcours.title}
                                        </h3>
                                        <Badge className={`${getCategoryColor(parcours.category)} text-xs mt-1`}>
                                            {parcours.category}
                                        </Badge>
                                        <p className="text-sm text-slate-500 line-clamp-2 mt-2">
                                            {parcours.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="text-xs text-slate-400">
                                                {parcours.etapes.length} etapes
                                            </span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-400">
                                                {parcours.etapes.reduce(
                                                    (acc: number, e: any) => acc + e.versets.length,
                                                    0
                                                )} versets
                                            </span>
                                            {parcours.badgeIcon && (
                                                <>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-amber-600 flex items-center gap-1">
                                                        <Trophy className="w-3 h-3" />
                                                        {parcours.badgeTitle}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 shrink-0 self-center" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    // Render Parcours Detail
    const renderParcoursDetail = () => {
        if (!selectedParcours) return null;

        const totalVersets = selectedParcours.etapes.reduce(
            (acc: number, e: any) => acc + e.versets.length,
            0
        );

        return (
            <div className="space-y-4 overflow-hidden">
                {/* Header Card */}
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 overflow-hidden">
                    <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">{selectedParcours.icon}</div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                            {selectedParcours.title}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                            {selectedParcours.description}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs">
                                {selectedParcours.etapes.length} etapes
                            </Badge>
                            <Badge variant="outline" className="text-xs">{totalVersets} versets</Badge>
                        </div>
                        {selectedParcours.badgeIcon && (
                            <div className="mt-3 inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                                <Trophy className="w-4 h-4 text-amber-600" />
                                <span className="text-xs text-amber-700 dark:text-amber-400">
                                    {selectedParcours.badgeTitle}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Progress */}
                <Card className="overflow-hidden">
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Progression
                            </span>
                            <span className="text-sm text-slate-500">0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                    </CardContent>
                </Card>

                {/* Etapes */}
                <div className="space-y-2">
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                        Etapes du parcours
                    </h3>
                    {selectedParcours.etapes.map((etape: any, index: number) => (
                        <Card
                            key={etape.id}
                            className="cursor-pointer hover:border-amber-500 transition-all overflow-hidden"
                            onClick={() => handleSelectEtape(etape)}
                        >
                            <CardContent className="p-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center font-bold text-sm text-amber-600 shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                                        {etape.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 truncate">
                                        {etape.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-xs text-slate-400">
                                        {etape.versets.length}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    // Render Etape Detail
    const renderEtapeDetail = () => {
        if (!selectedEtape) return null;

        return (
            <div className="space-y-6">
                {/* Header */}
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                            {selectedEtape.title}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            {selectedEtape.description}
                        </p>
                    </CardContent>
                </Card>

                {/* Versets to explore */}
                <div className="space-y-3">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                        Versets a explorer
                    </h3>
                    <p className="text-sm text-slate-500">
                        Clique sur chaque verset pour voir sa fiche MEMORIA FIDEI
                    </p>

                    {selectedEtape.versets.map((versetId: string, index: number) => {
                        const parts = versetId.split("_");
                        const bookId = parts.slice(0, -2).join("_");
                        const chapter = parts[parts.length - 2];
                        const verse = parts[parts.length - 1];

                        // Format display name
                        const displayName = `${bookId.charAt(0).toUpperCase() + bookId.slice(1)} ${chapter}:${verse}`;

                        return (
                            <Card
                                key={versetId}
                                className="cursor-pointer hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                                onClick={() => handleOpenVerset(versetId)}
                            >
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                            {displayName}
                                        </span>
                                    </div>
                                    <Button size="sm" variant="outline" className="gap-1">
                                        <Play className="w-4 h-4" />
                                        Ouvrir
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            {/* Header with Back Button */}
            <div className="flex items-center gap-3 mb-6">
                {currentStep !== "list" && (
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
                </div>
            </div>

            {/* Content based on current step */}
            <ScrollArea className="h-[calc(100vh-200px)]">
                {currentStep === "list" && renderParcoursList()}
                {currentStep === "detail" && renderParcoursDetail()}
                {currentStep === "etape" && renderEtapeDetail()}
            </ScrollArea>
        </DashboardLayout>
    );
};

export default ParcoursPage;
