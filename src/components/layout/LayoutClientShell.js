"use client";

import React, { useState, useEffect } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ProjectSidebar from "@/components/features/projects/shared/ProjectSidebar";
import GitHubAuthModal from "@/components/modals/GitHubAuthModal";
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGitHubAuth } from '@/hooks/useGitHubAuth';
import { useModal } from '@/context/ModalContext';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function LayoutClientShell({ children }) {
    const [isClient, setIsClient] = useState(false);
    const pathname = usePathname();
    const { isAuthenticated, isAuthPage, isLoading } = useAuth();
    const { needsGitHubAuth, closeModal } = useGitHubAuth();
    const {
        isBugIndexModalOpen,
        bugIndexModalKey,
        actionType,
        handleOpenBugIndexModal,
        handleCloseBugIndexModal
    } = useModal();

    // Ensure we're on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Show loading spinner during hydration or auth loading
    if (!isClient || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    // Auth pages get minimal layout
    if (isAuthPage) {
        return <>{children}</>;
    }

    // Unauthenticated users get loading spinner (redirect handled by useAuth)
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    // Authenticated users get full layout
    return (
        <>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Header />
            <div className="w-full max-md:max-w-full flex-grow">
                <div className="flex max-md:flex-col max-md:items-stretch">
          <div className="w-1/7 max-md:w-full max-md:ml-0">
                        {pathname.startsWith('/projects/') && pathname !== '/projects' ?
                            <ProjectSidebar />
                            : <Sidebar />}
                    </div>
          <div className="w-6/7 max-md:w-full max-md:ml-0 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
            {/* {isBugIndexModalOpen && (
                <IndexPage
                    actionType={actionType}
                    key={bugIndexModalKey}
                    onClose={handleCloseBugIndexModal}
                />
            )} */}
            {needsGitHubAuth && (
                <GitHubAuthModal
                    isOpen={true}
                    onClose={closeModal}
                />
            )}
        </LocalizationProvider>
        </>
    );
}