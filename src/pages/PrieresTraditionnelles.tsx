import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ChevronLeft,
    Loader2,
    BookOpen,
    Languages,
    X,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const CATEGORIES = [
    { id: "base", name: "Prières de base", icon: "🙏" },
    { id: "marie", name: "Prières mariales", icon: "🌹" },
    { id: "saints", name: "Prières aux saints", icon: "⚔️" },
    { id: "liturgie", name: "Prières liturgiques", icon: "🔔" },
];

const PrieresTraditionnellesPage = () => {
    const navigate = useNavigate();
    const [selectedPriere, setSelectedPriere] = useState<any>(null);
    const [showLatin, setShowLatin] = useState(false);

    const prieres = useQuery(api.priere.listPrieres);
    const savePrayerSession = useMutation(api.priere.savePrayerSession);

    const handleOpenPriere = async (priere: any) => {
        setSelectedPriere(priere);
        setShowLatin(false);
        // Save session when opening a prayer
        await savePrayerSession({
            type: "priere",
            details: priere.slug,
        });
    };

    const prieresParCategorie = CATEGORIES.map(cat => ({
        ...cat,
        prieres: prieres?.filter(p => p.categorie === cat.id) || [],
    }));

    if (!prieres) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate("/priere")} className="shrink-0">
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-50">
                        Prières Traditionnelles
                    </h1>
                    <p className="text-sm text-slate-500">
                        {prieres.length} prières disponibles
                    </p>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="space-y-6 pr-2">
                    {prieresParCategorie.map((category) => (
                        category.prieres.length > 0 && (
                            <section key={category.id}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">{category.icon}</span>
                                    <h2 className="font-bold text-slate-800 dark:text-slate-200">
                                        {category.name}
                                    </h2>
                                    <Badge variant="secondary" className="ml-auto">
                                        {category.prieres.length}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    {category.prieres.map((priere: any) => (
                                        <Card
                                            key={priere._id}
                                            className="cursor-pointer transition-all hover:shadow-md hover:border-amber-300"
                                            onClick={() => handleOpenPriere(priere)}
                                        >
                                            <CardContent className="p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center text-xl">
                                                    {priere.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-slate-800 dark:text-slate-200">
                                                        {priere.titre}
                                                    </h4>
                                                    {priere.texteLatinOptional && (
                                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Languages className="w-3 h-3" />
                                                            Latin disponible
                                                        </p>
                                                    )}
                                                </div>
                                                <BookOpen className="w-5 h-5 text-slate-400" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )
                    ))}

                    {prieres.length === 0 && (
                        <Card className="p-8 text-center">
                            <p className="text-slate-500">
                                Aucune prière chargée. Utilisez le bouton "Seed" sur la page Prière.
                            </p>
                        </Card>
                    )}
                </div>
            </ScrollArea>

            {/* Prayer Modal */}
            <Dialog open={!!selectedPriere} onOpenChange={() => setSelectedPriere(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">{selectedPriere?.icon}</span>
                            {selectedPriere?.titre}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPriere?.texteLatinOptional && (
                        <div className="flex gap-2 pb-2">
                            <Button
                                variant={!showLatin ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowLatin(false)}
                            >
                                Français
                            </Button>
                            <Button
                                variant={showLatin ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowLatin(true)}
                            >
                                <Languages className="w-4 h-4 mr-1" />
                                Latin
                            </Button>
                        </div>
                    )}

                    <ScrollArea className="flex-1 pr-4">
                        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200">
                            <CardContent className="p-6">
                                <p className="text-lg text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-serif">
                                    {showLatin && selectedPriere?.texteLatinOptional
                                        ? selectedPriere.texteLatinOptional
                                        : selectedPriere?.texte}
                                </p>
                            </CardContent>
                        </Card>
                    </ScrollArea>

                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setSelectedPriere(null)}
                    >
                        Fermer
                    </Button>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default PrieresTraditionnellesPage;
