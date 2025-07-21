import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Monitor, Smartphone, Tablet, Plus, FolderSync } from "lucide-react";

export default function Devices() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceType, setNewDeviceType] = useState("");
  const [newDevicePlatform, setNewDevicePlatform] = useState("");

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

  const { data: devices = [] } = useQuery({
    queryKey: ["/api/devices"],
    enabled: isAuthenticated,
  });

  const addDeviceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/devices", {
        name: newDeviceName,
        type: newDeviceType,
        platform: newDevicePlatform,
        isOnline: true,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Device Added",
        description: "Your device has been added successfully.",
      });
      setShowAddDevice(false);
      setNewDeviceName("");
      setNewDeviceType("");
      setNewDevicePlatform("");
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to add device",
        variant: "destructive",
      });
    },
  });

  const syncDeviceMutation = useMutation({
    mutationFn: async (deviceId: number) => {
      const response = await apiRequest("PATCH", `/api/devices/${deviceId}/status`, {
        isOnline: true,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "FolderSync Triggered",
        description: "Device sync has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to sync device",
        variant: "destructive",
      });
    },
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

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'windows':
        return 'bg-blue-100 text-blue-800';
      case 'macos':
        return 'bg-gray-100 text-gray-800';
      case 'linux':
        return 'bg-orange-100 text-orange-800';
      case 'ios':
        return 'bg-blue-100 text-blue-800';
      case 'android':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    Connected Devices
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    View and manage bookmarks from all your devices
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button onClick={() => setShowAddDevice(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Device
                  </Button>
                </div>
              </div>

              {devices.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Monitor className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No devices connected</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add your first device to start syncing bookmarks.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setShowAddDevice(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Device
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {devices.map((device: any) => (
                    <Card key={device.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              device.type === 'desktop' ? 'bg-blue-100 text-blue-600' :
                              device.type === 'mobile' ? 'bg-green-100 text-green-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                              {getDeviceIcon(device.type)}
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-medium text-gray-900">
                                {device.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Last synced {device.lastSyncAt ? 
                                  new Date(device.lastSyncAt).toLocaleString() : 
                                  'Never'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={device.isOnline ? "default" : "secondary"}
                              className={device.isOnline ? 
                                "bg-green-100 text-green-800" : 
                                "bg-gray-100 text-gray-800"
                              }
                            >
                              {device.isOnline ? "Online" : "Offline"}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={getPlatformColor(device.platform)}
                            >
                              {device.platform}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Device Type: {device.type}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncDeviceMutation.mutate(device.id)}
                            disabled={syncDeviceMutation.isPending}
                          >
                            <FolderSync className="mr-2 h-3 w-3" />
                            FolderSync Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Device Dialog */}
      <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Device</DialogTitle>
            <DialogDescription>
              Add a new device to sync your bookmarks across all platforms.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g., My MacBook Pro"
              />
            </div>
            <div>
              <Label htmlFor="deviceType">Device Type</Label>
              <Select value={newDeviceType} onValueChange={setNewDeviceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="devicePlatform">Platform</Label>
              <Select value={newDevicePlatform} onValueChange={setNewDevicePlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="windows">Windows</SelectItem>
                  <SelectItem value="macos">macOS</SelectItem>
                  <SelectItem value="linux">Linux</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDevice(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => addDeviceMutation.mutate()}
              disabled={!newDeviceName.trim() || !newDeviceType || !newDevicePlatform || addDeviceMutation.isPending}
            >
              {addDeviceMutation.isPending ? "Adding..." : "Add Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
