import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Monitor, FolderOpen, FolderSync } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export function StatsCards() {
  const { isAuthenticated } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-5">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return "Never";
    
    const date = new Date(lastSync);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bookmark className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Bookmarks</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.totalBookmarks || 0}</dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Monitor className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Connected Devices</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.connectedDevices || 0}</dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderOpen className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Collections</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.collections || 0}</dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderSync className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Last FolderSync</dt>
                <dd className="text-lg font-medium text-green-600">
                  {formatLastSync(stats?.lastSync)}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
