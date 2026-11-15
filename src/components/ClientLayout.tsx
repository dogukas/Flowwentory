"use client"

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { usePageLoading } from "@/hooks/usePageLoading";

const NO_SIDEBAR_PATHS = ["/", "/login", "/register", "/pricing", "/onboarding", "/privacy", "/terms"];

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isLoading = usePageLoading();
    const pathname = usePathname();
    const showSidebar = !NO_SIDEBAR_PATHS.includes(pathname);

    return (
        <>
            <LoadingOverlay isLoading={isLoading} />
            <div className="flex min-h-screen w-full overflow-x-hidden">
                {showSidebar && <Sidebar />}
                <main className="flex-1 min-w-0 w-full overflow-x-hidden pb-20 md:pb-0">{children}</main>
            </div>
        </>
    );
}
