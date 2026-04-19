"use client"

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { usePageLoading } from "@/hooks/usePageLoading";

const NO_SIDEBAR_PATHS = ["/", "/login"];

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
            <div className="flex">
                {showSidebar && <Sidebar />}
                <main className="flex-1">{children}</main>
            </div>
        </>
    );
}
