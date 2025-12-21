import { ReactNode } from "react";
import { TopNavBar } from "./TopNavBar";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  showNav?: boolean;
  showBottomNav?: boolean;
}

export function AppLayout({ 
  children, 
  title, 
  showNav = true,
  showBottomNav = true 
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNav && <TopNavBar title={title} />}
      <main className={`flex-1 ${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
