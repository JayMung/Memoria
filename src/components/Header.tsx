import { Link, useLocation } from "react-router-dom";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, LayoutDashboard, Menu, Search, Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
    showLogo?: boolean;
    showNav?: boolean;
}

const Header = ({ showLogo = true, showNav = true }: HeaderProps) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 text-slate-900 dark:bg-slate-950/95 dark:text-slate-50 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-14 items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-6">
                    {showLogo && (
                        <Link to="/" className="flex items-center gap-2 font-serif font-bold text-lg text-amber-600 dark:text-amber-500 hover:opacity-90 transition-opacity">
                            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white text-sm">M</div>
                            <span className="hidden sm:inline-block">MEMORIA FIDEI</span>
                        </Link>
                    )}

                    {/* Desktop Navigation - only when showNav is true */}
                    {showNav && (
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
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Search (placeholder) */}
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                        <Search className="w-4 h-4" />
                    </Button>

                    {/* Notifications (placeholder) */}
                    <SignedIn>
                        <Button variant="ghost" size="icon" className="hidden sm:flex">
                            <Bell className="w-4 h-4" />
                        </Button>
                    </SignedIn>

                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <Link to="/sign-in">
                            <Button variant="ghost" size="sm">Se connecter</Button>
                        </Link>
                        <Link to="/sign-up" className="hidden sm:block">
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Créer un compte</Button>
                        </Link>
                    </SignedOut>

                    {/* Mobile Menu - only when showNav is true */}
                    {showNav && (
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
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
