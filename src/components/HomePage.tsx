import React from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { EnvironmentIndicator } from '@/hooks/useEnvironment';

interface HomePageProps {
  children: React.ReactNode;
  handleLogout: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
  pageTitle?: string;
  username?: string;
}

function HomePage({
  children,
  handleLogout,
  onNavigate,
  activePage,
  pageTitle,
  username,
}: HomePageProps) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <SidebarProvider>
        <EnvironmentIndicator />
        <AppSidebar
          handleLogout={handleLogout}
          onNavigate={onNavigate}
          activePage={activePage}
          username={username}
        />
        <SidebarInset className="bg-gray-100">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="text-xl font-semibold">{pageTitle}</div>
          </header>
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="max-w-3xl mx-auto space-y-6">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default HomePage;
