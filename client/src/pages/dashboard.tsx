import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DeviceOverview } from "@/components/dashboard/device-overview";
import { RecentBookmarks } from "@/components/dashboard/recent-bookmarks";
import { ImportModal } from "@/components/import/import-modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Upload, Download } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopBar />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    Dashboard
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage and sync your bookmarks across all devices
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <Link href="/export">
                    <Button variant="outline" className="mr-3">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </Link>
                  <Link href="/import">
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Bookmarks
                    </Button>
                  </Link>
                </div>
              </div>

              <StatsCards />
              <QuickActions onImport={() => setShowImportModal(true)} />
              <DeviceOverview />
              <RecentBookmarks />
            </div>
          </div>
        </main>
      </div>

      <ImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
      />
    </div>
  );
}
