import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Brain, Shield, Info, Lightbulb, History, Sprout, Quote } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";

interface MemoriaFicheProps {
    content: Doc<"memoriaContent">;
}

const MemoriaFiche = ({ content }: MemoriaFicheProps) => {
    return (
        <div className="max-w-3xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                    {content.periodeHistoireSalut}
                </Badge>
                <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-50">
                    {content.book} {content.chapter}
                </h1>
                <p className="text-xl font-medium text-amber-700 dark:text-amber-500 italic">
                    "{content.title}"
                </p>

                <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center justify-center gap-2">
                            <Info className="w-4 h-4" /> Idée Centrale
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-slate-800 dark:text-slate-200 font-medium">
                            {content.ideaCentrale}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Image Mentale Section */}
            <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-800">
                <div className="bg-slate-100 dark:bg-slate-900 h-48 flex items-center justify-center p-8 text-center border-b">
                    <p className="text-slate-500 italic">
                        [Représentation visuelle : {content.imageMentale}]
                    </p>
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" /> Image Mentale Maîtresse
                    </CardTitle>
                    <CardDescription>Visualisez cette scène pour mémoriser le chapitre.</CardDescription>
                </CardHeader>
            </Card>

            {/* Main Content Sections */}
            <div className="space-y-6">
                <section>
                    <h3 className="flex items-center gap-2 font-bold text-lg mb-3">
                        <Info className="w-5 h-5 text-blue-600" /> Contexte Essentiel
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {content.contexteEssentiel}
                    </p>
                </section>

                <Separator />

                <section>
                    <h3 className="flex items-center gap-2 font-bold text-lg mb-3 text-amber-700">
                        ✝️ Lecture Typologique (AT → NT)
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {content.typologie}
                    </p>
                </section>

                <Separator />

                <section>
                    <h3 className="flex items-center gap-2 font-bold text-lg mb-3">
                        <Quote className="w-5 h-5 text-slate-400" /> Versets Clés
                    </h3>
                    <ul className="space-y-3">
                        {content.versetsCles.map((verset, idx) => (
                            <li key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border-l-4 border-amber-500 italic">
                                {verset}
                            </li>
                        ))}
                    </ul>
                </section>

                <Separator />

                {/* Apologetics Section */}
                <section>
                    <h3 className="flex items-center gap-2 font-bold text-lg mb-3">
                        <Shield className="w-5 h-5 text-emerald-600" /> Apologétique
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-1">Vérité affirmée</h4>
                            <p className="text-slate-700 dark:text-slate-300">{content.apologetique.veriteAffirmee}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-1">Objection fréquente</h4>
                            <p className="text-slate-700 dark:text-slate-300 italic">"{content.apologetique.objection}"</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-1">Réponse biblique</h4>
                            <p className="text-slate-700 dark:text-slate-300">{content.apologetique.reponse}</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* History of Salvation / Spiritual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <History className="w-4 h-4 text-orange-500" /> Place dans l'Histoire
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 dark:text-slate-400">
                        {content.placeHistoireSalut}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-green-500" /> Application Spirituelle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 dark:text-slate-400">
                        {content.applicationSpirituelle}
                    </CardContent>
                </Card>
            </div>

            {/* Closing Memory Summary */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-slate-400 uppercase text-xs tracking-widest font-bold">Résumé Mémoriel</h4>
                    <Brain className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-xl font-serif text-center py-2">
                    "{content.resumeMemoirel}"
                </p>
                <Separator className="bg-slate-700" />
                <div className="flex items-start gap-3 text-amber-300">
                    <Lightbulb className="w-5 h-5 shrink-0" />
                    <p className="text-sm">
                        <span className="font-bold">Astuce :</span> {content.astuceMemoire}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MemoriaFiche;