import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export function DeviceOverview() {
  const { isAuthenticated } = useAuth();
  
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["/api/devices"],
    enabled: isAuthenticated,
  });

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getDeviceIconColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'desktop':
        return 'bg-blue-100 text-blue-600';
      case 'mobile':
        return 'bg-green-100 text-green-600';
      case 'tablet':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const formatLastSync = (lastSyncAt: string) => {
    const date = new Date(lastSyncAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Connected Devices</h3>
          <p className="mt-1 text-sm text-gray-500">
            View and manage bookmarks from all your devices
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/devices">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </Link>
        </div>
      </div>
      
      {devices.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Monitor className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No devices connected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first device to start syncing bookmarks.
              </p>
              <Link href="/devices">
                <Button className="mt-4" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Device
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {devices.slice(0, 4).map((device: any) => (
            <Card key={device.id}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getDeviceIconColor(device.type)}`}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{device.name}</h4>
                    <p className="text-sm text-gray-500">
                      Last synced {formatLastSync(device.lastSyncAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={device.isOnline ? "default" : "secondary"}
                      className={device.isOnline ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {device.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-500">
                    {device.platform} • {device.type}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {devices.length > 4 && (
        <div className="mt-4 text-center">
          <Link href="/devices">
            <Button variant="outline">View All Devices</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
