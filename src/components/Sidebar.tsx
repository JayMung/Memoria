import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Home,
    BookOpen,
    Brain,
    Shield,
    Heart,
    User,
    Menu,
    ChevronRight,
    Library,
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { icon: Home, label: "Accueil", href: "/dashboard" },
    { icon: Library, label: "Bible", href: "/bible" },
    { icon: BookOpen, label: "Parcours", href: "/parcours" },
    { icon: Brain, label: "Mémoire", href: "/memoire" },
    { icon: Shield, label: "Apologétique", href: "/apologetique" },
    { icon: Heart, label: "Prière", href: "/priere" },
    { icon: User, label: "Profil", href: "/profil" },
];

interface SidebarProps {
    className?: string;
}

const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => {
    const location = useLocation();

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <Link to="/" className="flex items-center gap-3" onClick={onItemClick}>
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/25">
                        M
                    </div>
                    <div>
                        <span className="font-serif font-bold text-lg text-slate-900 dark:text-slate-50">
                            MEMORIA
                        </span>
                        <span className="block text-xs text-amber-600 font-medium -mt-1">
                            FIDEI
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={onItemClick}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive && "text-amber-600")} />
                            {item.label}
                            {isActive && (
                                <ChevronRight className="w-4 h-4 ml-auto text-amber-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        ✝️ Fidélité à la Tradition
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-500 font-medium mt-1">
                        Bible catholique • 73 livres
                    </p>
                </div>
            </div>
        </div>
    );
};

// Desktop Sidebar
export const Sidebar = ({ className }: SidebarProps) => {
    return (
        <aside
            className={cn(
                "hidden lg:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0",
                className
            )}
        >
            <SidebarContent />
        </aside>
    );
};

// Mobile Sidebar (Sheet)
export const MobileSidebar = () => {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Menu"
                >
                    <Menu className="w-5 h-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <SidebarContent onItemClick={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    );
};

export default Sidebar;
