import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, BookOpen, Brain, Shield, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedRhythm, setSelectedRhythm] = useState<string | null>(null);
  const navigate = useNavigate();

  const goals = [
    { id: "understand", icon: BookOpen, title: "Comprendre la Bible", desc: "Saisir le sens global de l'Histoire du Salut" },
    { id: "memorize", icon: Brain, title: "Mémoriser", desc: "Retenir durablement les versets clés" },
    { id: "defend", icon: Shield, title: "Défendre la foi", desc: "Acquérir des arguments apologétiques solides" },
  ];

  const rhythms = [
    { id: "light", icon: Clock, title: "Léger", desc: "5 min / jour", time: 5 },
    { id: "normal", icon: Clock, title: "Normal", desc: "10 min / jour", time: 10 },
    { id: "deep", icon: Clock, title: "Approfondi", desc: "15-20 min / jour", time: 20 },
  ];

  const handleNext = () => {
    if (step === 1 && selectedGoal) {
      setStep(2);
    } else if (step === 2 && selectedRhythm) {
      // In a real app, save to backend/Convex here
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <div className={`h-2 w-12 rounded-full ${step >= 1 ? "bg-amber-600" : "bg-slate-200 dark:bg-slate-700"}`} />
            <div className={`h-2 w-12 rounded-full ${step >= 2 ? "bg-amber-600" : "bg-slate-200 dark:bg-slate-700"}`} />
          </div>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-serif text-slate-900 dark:text-slate-50">
              {step === 1 ? "Quel est votre objectif ?" : "Choisissez votre rythme"}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? "Nous adapterons le parcours selon votre besoin." 
                : "La régularité est la clé de la mémorisation."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 ? (
              <div className="grid gap-3">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-4 ${
                      selectedGoal === goal.id
                        ? "border-amber-600 bg-amber-50 dark:bg-amber-950/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      selectedGoal === goal.id ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}>
                      <goal.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{goal.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{goal.desc}</p>
                    </div>
                    {selectedGoal === goal.id && <Check className="ml-auto h-5 w-5 text-amber-600" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {rhythms.map((rhythm) => (
                  <button
                    key={rhythm.id}
                    onClick={() => setSelectedRhythm(rhythm.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                      selectedRhythm === rhythm.id
                        ? "border-amber-600 bg-amber-50 dark:bg-amber-950/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      selectedRhythm === rhythm.id ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}>
                      <rhythm.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{rhythm.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{rhythm.desc}</p>
                    </div>
                    {selectedRhythm === rhythm.id && <Check className="h-5 w-5 text-amber-600" />}
                  </button>
                ))}
              </div>
            )}

            <div className="pt-6 flex justify-end">
              <Button 
                onClick={handleNext}
                disabled={step === 1 ? !selectedGoal : !selectedRhythm}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {step === 2 ? "Commencer" : "Continuer"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;