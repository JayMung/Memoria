import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    Lightbulb,
    AlertCircle,
    Target,
    Check,
    RotateCcw,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type ExamenStep = "intro" | "graces" | "lumieres" | "peches" | "resolution" | "complete";

const STEPS: { id: ExamenStep; title: string; icon: any; description: string; question: string }[] = [
    {
        id: "graces",
        title: "Action de grâce",
        icon: Heart,
        description: "Remercier Dieu pour les grâces reçues",
        question: "Pour quoi puis-je remercier Dieu aujourd'hui ? Quelles grâces ai-je reçues ?",
    },
    {
        id: "lumieres",
        title: "Demande de lumière",
        icon: Lightbulb,
        description: "Voir sa journée avec les yeux de Dieu",
        question: "En revoyant ma journée, qu'est-ce que l'Esprit Saint me montre ? Quels moments ont été significatifs ?",
    },
    {
        id: "peches",
        title: "Examen des actes",
        icon: AlertCircle,
        description: "Reconnaître ses manquements",
        question: "En quoi ai-je manqué d'amour envers Dieu, envers les autres, envers moi-même ? Quels péchés ai-je commis en pensée, parole, action, omission ?",
    },
    {
        id: "resolution",
        title: "Résolution",
        icon: Target,
        description: "S'engager pour demain",
        question: "Quelle résolution concrète puis-je prendre pour demain ? Comment puis-je mieux aimer ?",
    },
];

const ExamenConsciencePage = () => {
    const navigate = useNavigate();
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 = intro
    const [responses, setResponses] = useState<Record<string, string>>({
        graces: "",
        lumieres: "",
        peches: "",
        resolution: "",
    });

    const saveExamen = useMutation(api.priere.saveExamen);

    const currentStep = currentStepIndex >= 0 ? STEPS[currentStepIndex] : null;
    const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;

    const handleNext = async () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            // Complete
            await saveExamen({
                graces: responses.graces || undefined,
                lumieres: responses.lumieres || undefined,
                peches: responses.peches || undefined,
                resolution: responses.resolution || undefined,
            });
            setCurrentStepIndex(STEPS.length); // Complete state
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > -1) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleReset = () => {
        setCurrentStepIndex(-1);
        setResponses({ graces: "", lumieres: "", peches: "", resolution: "" });
    };

    // Render Intro
    const renderIntro = () => (
        <div className="space-y-6">
            <div className="text-center py-6">
                <div className="text-5xl mb-4">🪞</div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Examen de Conscience
                </h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    L'examen de conscience est une prière quotidienne recommandée par Saint Ignace
                    pour relire sa journée sous le regard de Dieu.
                </p>
            </div>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
                <CardContent className="p-6">
                    <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-3">
                        Les 4 étapes
                    </h3>
                    <div className="space-y-3">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-300">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-slate-500">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                <CardContent className="p-4 text-center">
                    <p className="text-sm text-amber-800 dark:text-amber-300 italic">
                        "Avant de commencer, fais le signe de la croix et demande à l'Esprit Saint
                        de t'éclairer sur ta journée."
                    </p>
                </CardContent>
            </Card>

            <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                onClick={() => setCurrentStepIndex(0)}
            >
                Commencer l'examen
                <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
        </div>
    );

    // Render Step
    const renderStep = () => {
        if (!currentStep) return null;

        const StepIcon = currentStep.icon;

        return (
            <div className="space-y-6">
                {/* Progress */}
                <Card className="bg-purple-50 dark:bg-purple-900/20">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <Badge className="bg-purple-500 text-white">
                                Étape {currentStepIndex + 1}/{STEPS.length}
                            </Badge>
                            <span className="text-sm text-slate-500">
                                {currentStep.title}
                            </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                    </CardContent>
                </Card>

                {/* Step Content */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <StepIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    {currentStep.title}
                                </CardTitle>
                                <p className="text-sm text-slate-500">
                                    {currentStep.description}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                            "{currentStep.question}"
                        </p>
                        <Textarea
                            placeholder="Écris tes réflexions ici... (optionnel)"
                            className="min-h-[150px] resize-none"
                            value={responses[currentStep.id]}
                            onChange={(e) => setResponses({
                                ...responses,
                                [currentStep.id]: e.target.value,
                            })}
                        />
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePrev}
                        className="flex-1"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Précédent
                    </Button>
                    <Button
                        size="lg"
                        onClick={handleNext}
                        className="flex-[2] bg-gradient-to-r from-purple-500 to-pink-600"
                    >
                        {currentStepIndex === STEPS.length - 1 ? (
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

    // Render Complete
    const renderComplete = () => (
        <div className="space-y-6 text-center py-8">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Examen terminé
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
                Merci d'avoir pris ce temps avec le Seigneur.
                Termine par un Notre Père et demande la grâce de mieux L'aimer demain.
            </p>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                <CardContent className="p-6">
                    <p className="text-green-800 dark:text-green-300 italic">
                        "Seigneur, je te confie cette journée. Pardonne mes fautes,
                        bénis le bien que tu m'as permis de faire, et donne-moi ta paix. Amen."
                    </p>
                </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Recommencer
                </Button>
                <Button onClick={() => navigate("/priere")}>
                    Retour
                </Button>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => currentStepIndex === -1 ? navigate("/priere") : handlePrev()}
                    className="shrink-0"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-50">
                        Examen de Conscience
                    </h1>
                </div>
            </div>

            {/* Content */}
            {currentStepIndex === -1 && renderIntro()}
            {currentStepIndex >= 0 && currentStepIndex < STEPS.length && renderStep()}
            {currentStepIndex >= STEPS.length && renderComplete()}
        </DashboardLayout>
    );
};

export default ExamenConsciencePage;
