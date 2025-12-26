import { useUser, useClerk } from "@clerk/clerk-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
    LogOut,
    Trophy,
    Flame,
    BookOpen,
    Settings,
    Moon,
    Bell,
    User,
    Mail,
    Shield
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const ProfilPage = () => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const userStats = useQuery(api.progress.getUserStats);
    const allMemorized = useQuery(api.progress.getAllMemorized);

    const handleSignOut = () => {
        signOut();
    };

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header Profile */}
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
                            {user.firstName?.charAt(0)}
                            {user.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {user.fullName}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2">
                            <Mail className="w-4 h-4" />
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                                Niveau {userStats?.level || 1}
                            </Badge>
                            <Badge variant="outline" className="border-slate-300">
                                Membre depuis {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Récemment'}
                            </Badge>
                        </div>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={handleSignOut}
                        className="gap-2 shadow-sm"
                    >
                        <LogOut className="w-4 h-4" /> Déconnexion
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Stats Cards */}
                    <Card className="md:col-span-3 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                Mes Statistiques
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                        <Flame className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                            {userStats?.streak || 0}
                                        </p>
                                        <p className="text-sm text-slate-500">Jours de suite</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                            {allMemorized?.length || 0}
                                        </p>
                                        <p className="text-sm text-slate-500">Chapitres mémorisés</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                            {userStats?.xp || 0}
                                        </p>
                                        <p className="text-sm text-slate-500">Points d'expérience</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-slate-500" />
                                Paramètres de l'application
                            </CardTitle>
                            <CardDescription>Personnalisez votre expérience Memoria</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Moon className="w-4 h-4 text-slate-500" />
                                        <label className="text-base font-medium">Mode Sombre</label>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Basculer entre le thème clair et sombre
                                    </p>
                                </div>
                                <Switch disabled checked={false} title="Bientôt disponible" />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-slate-500" />
                                        <label className="text-base font-medium">Notifications</label>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Rappels quotidiens pour vos révisions
                                    </p>
                                </div>
                                <Switch disabled checked={true} title="Activé par défaut" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-slate-500" />
                                Compte & Sécurité
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm">
                                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Fournisseur de connexion
                                </p>
                                <p className="text-slate-500 capitalize">
                                    {user.externalAccounts[0]?.provider || "Email/Password"}
                                </p>
                            </div>

                            <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://accounts.clerk.com/user', '_blank')}>
                                <User className="w-4 h-4 mr-2" />
                                Gérer mon compte Clerk
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilPage;
