import { Link, useLocation } from "react-router-dom";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, LayoutDashboard, Menu } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 text-slate-900 dark:bg-slate-950/95 dark:text-slate-50 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 font-serif font-bold text-xl text-amber-600 dark:text-amber-500 hover:opacity-90 transition-opacity">
                        <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white text-sm">M</div>
                        <span className="hidden sm:inline-block">MEMORIA FIDEI</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link
                            to="/"
                            className={`flex items-center gap-2 transition-colors hover:text-amber-600 ${isActive("/") ? "text-amber-600" : "text-slate-600 dark:text-slate-400"}`}
                        >
                            <Home className="w-4 h-4" /> Accueil
                        </Link>
                        <SignedIn>
                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-2 transition-colors hover:text-amber-600 ${isActive("/dashboard") ? "text-amber-600" : "text-slate-600 dark:text-slate-400"}`}
                            >
                                <LayoutDashboard className="w-4 h-4" /> Tableau de bord
                            </Link>
                        </SignedIn>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <Link to="/sign-in">
                            <Button variant="outline" size="sm">Se connecter</Button>
                        </Link>
                        <Link to="/sign-up">
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Créer un compte</Button>
                        </Link>
                    </SignedOut>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link to="/" className="cursor-pointer">Accueil</Link>
                                </DropdownMenuItem>
                                <SignedIn>
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard" className="cursor-pointer">Tableau de bord</Link>
                                    </DropdownMenuItem>
                                </SignedIn>
                                <SignedOut>
                                    <DropdownMenuItem asChild>
                                        <Link to="/sign-in" className="cursor-pointer">Se connecter</Link>
                                    </DropdownMenuItem>
                                </SignedOut>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
