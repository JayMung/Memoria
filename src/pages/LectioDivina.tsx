import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Brain,
    Heart,
    Eye,
    Hand,
    Check,
    RotateCcw,
    Clock,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type LectioStep = "intro" | "lectio" | "meditatio" | "oratio" | "contemplatio" | "actio" | "complete";

const STEPS: { id: LectioStep; title: string; latinTitle: string; icon: any; description: string; instruction: string; placeholder: string }[] = [
    {
        id: "lectio",
        title: "Lecture",
        latinTitle: "Lectio",
        icon: BookOpen,
        description: "Lire le texte lentement, plusieurs fois",
        instruction: "Lis le passage biblique lentement, à haute voix si possible. Laisse les mots t'imprégner. Quel mot ou phrase te touche particulièrement ?",
        placeholder: "Quel mot ou phrase t'a frappé ?",
    },
    {
        id: "meditatio",
        title: "Méditation",
        latinTitle: "Meditatio",
        icon: Brain,
        description: "Réfléchir sur le sens du texte",
        instruction: "Médite sur ce que ce texte veut te dire aujourd'hui. Que signifie-t-il pour ta vie ? Pourquoi ce mot/phrase t'a-t-il touché ?",
        placeholder: "Que dit ce texte pour ta vie aujourd'hui ?",
    },
    {
        id: "oratio",
        title: "Prière",
        latinTitle: "Oratio",
        icon: Heart,
        description: "Répondre à Dieu dans la prière",
        instruction: "Parle à Dieu de ce que tu as découvert. Exprime-lui tes sentiments, tes désirs, tes questions. Laisse le texte devenir prière.",
        placeholder: "Que veux-tu dire à Dieu ?",
    },
    {
        id: "contemplatio",
        title: "Contemplation",
        latinTitle: "Contemplatio",
        icon: Eye,
        description: "Se reposer en Dieu silencieusement",
        instruction: "Reste en silence devant Dieu. Ne cherche pas à penser ou à dire, mais simplement à être avec Lui. Accueille sa présence.",
        placeholder: "Comment as-tu vécu ce moment de silence ?",
    },
    {
        id: "actio",
        title: "Action",
        latinTitle: "Actio",
        icon: Hand,
        description: "S'engager à vivre la Parole",
        instruction: "Quelle action concrète ce texte t'inspire-t-il ? Comment vas-tu vivre cette Parole aujourd'hui ?",
        placeholder: "Quelle action vas-tu poser ?",
    },
];

const SUGGESTED_PASSAGES = [
    "Jean 1:1-14",
    "Psaume 23",
    "Matthieu 5:1-12",
    "Luc 1:26-38",
    "Philippiens 4:4-9",
    "Romains 8:28-39",
    "1 Corinthiens 13:1-13",
    "Isaïe 43:1-7",
];

const LectioDivinaPage = () => {
    const navigate = useNavigate();
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 = intro
    const [passage, setPassage] = useState("");
    const [responses, setResponses] = useState<Record<string, string>>({
        lectio: "",
        meditatio: "",
        oratio: "",
        contemplatio: "",
        actio: "",
    });
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);

    const saveLectioDivina = useMutation(api.priere.saveLectioDivina);

    const currentStep = currentStepIndex >= 0 && currentStepIndex < STEPS.length ? STEPS[currentStepIndex] : null;
    const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;

    const handleNext = async () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            // Complete
            await saveLectioDivina({
                passage,
                lectio: responses.lectio || undefined,
                meditatio: responses.meditatio || undefined,
                oratio: responses.oratio || undefined,
                contemplatio: responses.contemplatio || undefined,
                actio: responses.actio || undefined,
            });
            setCurrentStepIndex(STEPS.length); // Complete state
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        } else if (currentStepIndex === 0) {
            setCurrentStepIndex(-1);
        }
    };

    const handleStart = () => {
        if (!passage.trim()) {
            alert("Veuillez entrer un passage biblique");
            return;
        }
        setCurrentStepIndex(0);
    };

    const handleReset = () => {
        setCurrentStepIndex(-1);
        setPassage("");
        setResponses({ lectio: "", meditatio: "", oratio: "", contemplatio: "", actio: "" });
    };

    // Render Intro
    const renderIntro = () => (
        <div className="space-y-6">
            <div className="text-center py-4">
                <div className="text-5xl mb-4">📖</div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Lectio Divina
                </h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    La Lectio Divina est une méthode ancienne de méditation priante de la Parole de Dieu,
                    pratiquée depuis les premiers siècles de l'Église.
                </p>
            </div>

            <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200">
                <CardContent className="p-6">
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-3">
                        Les 5 étapes
                    </h3>
                    <div className="space-y-3">
                        {STEPS.map((step, index) => {
                            const StepIcon = step.icon;
                            return (
                                <div key={step.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
                                        <StepIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700 dark:text-slate-300">
                                            {step.title} <span className="text-xs text-slate-400">({step.latinTitle})</span>
                                        </p>
                                        <p className="text-xs text-slate-500">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Passage Selection */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                        Choisis ton passage
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Ex: Jean 3:16-21"
                        value={passage}
                        onChange={(e) => setPassage(e.target.value)}
                        className="text-lg"
                    />
                    <div>
                        <p className="text-xs text-slate-500 mb-2">Suggestions :</p>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED_PASSAGES.map((p) => (
                                <Badge
                                    key={p}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                                    onClick={() => setPassage(p)}
                                >
                                    {p}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                onClick={handleStart}
                disabled={!passage.trim()}
            >
                Commencer la Lectio Divina
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
                <Card className="bg-emerald-50 dark:bg-emerald-900/20">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <Badge className="bg-emerald-500 text-white">
                                {currentStep.latinTitle}
                            </Badge>
                            <span className="text-sm text-slate-500">
                                Étape {currentStepIndex + 1}/{STEPS.length}
                            </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            📖 {passage}
                        </p>
                    </CardContent>
                </Card>

                {/* Step Content */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <StepIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    {currentStep.title}
                                    <span className="text-sm text-slate-400 ml-2">({currentStep.latinTitle})</span>
                                </CardTitle>
                                <p className="text-sm text-slate-500">
                                    {currentStep.description}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 mb-4">
                            <CardContent className="p-4">
                                <p className="text-sm text-amber-800 dark:text-amber-300 italic">
                                    💡 {currentStep.instruction}
                                </p>
                            </CardContent>
                        </Card>

                        {currentStep.id === "contemplatio" ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">🕯️</div>
                                <p className="text-slate-500 mb-4">
                                    Prends quelques minutes de silence...
                                </p>
                                <div className="flex justify-center gap-4 mb-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setTimerSeconds(180)}
                                    >
                                        <Clock className="w-4 h-4 mr-1" /> 3 min
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setTimerSeconds(300)}
                                    >
                                        <Clock className="w-4 h-4 mr-1" /> 5 min
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setTimerSeconds(600)}
                                    >
                                        <Clock className="w-4 h-4 mr-1" /> 10 min
                                    </Button>
                                </div>
                                <Textarea
                                    placeholder={currentStep.placeholder}
                                    className="min-h-[100px] resize-none"
                                    value={responses[currentStep.id]}
                                    onChange={(e) => setResponses({
                                        ...responses,
                                        [currentStep.id]: e.target.value,
                                    })}
                                />
                            </div>
                        ) : (
                            <Textarea
                                placeholder={currentStep.placeholder}
                                className="min-h-[150px] resize-none"
                                value={responses[currentStep.id]}
                                onChange={(e) => setResponses({
                                    ...responses,
                                    [currentStep.id]: e.target.value,
                                })}
                            />
                        )}
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
                        className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-600"
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
            <div className="text-6xl mb-4">🙏</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Lectio Divina terminée
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
                Tu as médité sur <span className="font-medium">{passage}</span>.
                Que cette Parole continue à travailler en toi.
            </p>

            <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200">
                <CardContent className="p-6">
                    <p className="text-emerald-800 dark:text-emerald-300 italic">
                        "Ta Parole est une lampe à mes pieds, et une lumière sur mon sentier."
                        <br />
                        <span className="text-sm">— Psaume 119:105</span>
                    </p>
                </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Nouveau passage
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
                        Lectio Divina
                    </h1>
                    {passage && currentStepIndex >= 0 && (
                        <p className="text-sm text-slate-500">{passage}</p>
                    )}
                </div>
            </div>

            {/* Content */}
            {currentStepIndex === -1 && renderIntro()}
            {currentStepIndex >= 0 && currentStepIndex < STEPS.length && renderStep()}
            {currentStepIndex >= STEPS.length && renderComplete()}
        </DashboardLayout>
    );
};

export default LectioDivinaPage;
