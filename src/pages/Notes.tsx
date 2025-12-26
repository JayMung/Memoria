import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader2, Search, Trash2, ExternalLink, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const COLOR_PALETTE = {
    yellow: "bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300",
    green: "bg-green-200 dark:bg-green-900/50 border-green-300",
    blue: "bg-blue-200 dark:bg-blue-900/50 border-blue-300",
    red: "bg-red-200 dark:bg-red-900/50 border-red-300",
    purple: "bg-purple-200 dark:bg-purple-900/50 border-purple-300",
};

export default function NotesPage() {
    const highlights = useQuery(api.highlights.getAllUserHighlights);
    const removeHighlight = useMutation(api.highlights.removeHighlight);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredHighlights = highlights?.filter(h => {
        const matchesSearch =
            h.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
            h.chapterId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (highlights === undefined) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-2">
                    Mes Notes & Recherches
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Retrouvez tous vos versets annotés, surlignés et vos réflexions personnelles.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Rechercher dans vos notes, tags ou références..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredHighlights && filteredHighlights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHighlights.map((highlight) => (
                        <Card key={highlight._id} className="group relative hover:shadow-md transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="capitalize">
                                        {highlight.chapterId.replace('_', ' ')} : v{highlight.verseIndex}
                                    </Badge>
                                    <div className={`w-4 h-4 rounded-full ${COLOR_PALETTE[highlight.color as keyof typeof COLOR_PALETTE] || 'bg-slate-200'}`} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Note Text */}
                                {highlight.note && (
                                    <blockquote className="border-l-2 border-amber-500 pl-4 italic text-slate-700 dark:text-slate-300">
                                        "{highlight.note}"
                                    </blockquote>
                                )}

                                {/* Tags */}
                                {highlight.tags && highlight.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {highlight.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs gap-1">
                                                <Tag className="w-3 h-3" /> {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
                                    <Link to={`/lecture/${highlight.chapterId.replace('_', '/')}`}>
                                        <Button variant="ghost" size="sm" className="gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                            <ExternalLink className="w-4 h-4" /> Voir le contexte
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => confirm('Supprimer cette note ?') && removeHighlight({ highlightId: highlight._id })}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500">Aucune note trouvée.</p>
                </div>
            )}
        </DashboardLayout>
    );
}
