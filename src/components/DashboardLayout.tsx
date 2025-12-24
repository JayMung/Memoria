import Header from "@/components/Header";
import { Sidebar, MobileSidebar } from "@/components/Sidebar";
import { UserButton, SignedIn } from "@clerk/clerk-react";
import { ReactNode } from "react";

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Mobile Header with hamburger */}
            <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
                <MobileSidebar />
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        M
                    </div>
                    <span className="font-serif font-semibold text-slate-800 dark:text-slate-100">
                        MEMORIA FIDEI
                    </span>
                </div>
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 min-h-screen">
                    {/* Desktop Top Bar with user menu only (no nav duplication) */}
                    <div className="hidden lg:flex items-center justify-end h-14 px-6 border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur">
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>

                    {/* Page Content */}
                    <div className="p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
