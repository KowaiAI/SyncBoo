import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Shield, LogOut, Download, Copy, Eye } from "lucide-react";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export default function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleExport = () => {
    window.location.href = "/api/export";
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
              <div className="mb-8">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Settings
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account preferences and sync settings
                </p>
              </div>

              <div className="space-y-6">
                {/* Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Profile
                    </CardTitle>
                    <CardDescription>
                      Your account information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user && (
                      <div className="flex items-center space-x-4">
                        <ContextMenu>
                          <ContextMenuTrigger>
                            <img
                              className="h-16 w-16 rounded-full object-cover cursor-pointer"
                              src={user.profileImageUrl || "/api/placeholder/64/64"}
                              alt="Profile"
                            />
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onClick={() => window.open(user.profileImageUrl || "/api/placeholder/64/64", '_blank')}>
                              <Eye className="w-4 h-4 mr-2" />
                              View profile image
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => navigator.clipboard.writeText(user.profileImageUrl || "/api/placeholder/64/64")}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy image address
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => {
                              const link = document.createElement('a');
                              link.href = user.profileImageUrl || "/api/placeholder/64/64";
                              link.download = `profile-image-${user.email}.png`;
                              link.click();
                            }}>
                              <Download className="w-4 h-4 mr-2" />
                              Save image
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.firstName || user.lastName 
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : 'User'
                            }
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <Badge variant="secondary" className="mt-1">
                            Connected via Google
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sync Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sync Settings</CardTitle>
                    <CardDescription>
                      Configure how your bookmarks are synchronized
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-sync">Auto-sync</Label>
                        <p className="text-sm text-gray-500">
                          Automatically sync bookmarks in real-time
                        </p>
                      </div>
                      <Switch id="auto-sync" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sync-metadata">Sync metadata</Label>
                        <p className="text-sm text-gray-500">
                          Include website descriptions and favicons
                        </p>
                      </div>
                      <Switch id="sync-metadata" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sync-history">Sync browsing history</Label>
                        <p className="text-sm text-gray-500">
                          Track and sync visited websites (desktop app only)
                        </p>
                      </div>
                      <Switch id="sync-history" />
                    </div>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Security
                    </CardTitle>
                    <CardDescription>
                      Security and privacy settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="encrypted-sync">Encrypted sync</Label>
                        <p className="text-sm text-gray-500">
                          Encrypt bookmark data during transmission
                        </p>
                      </div>
                      <Switch id="encrypted-sync" defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="two-factor">Two-factor authentication</Label>
                        <p className="text-sm text-gray-500">
                          Managed through your Google account
                        </p>
                      </div>
                      <Badge variant="outline">Google Managed</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                      Export and manage your bookmark data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="mr-2 h-4 w-4" />
                      Export All Bookmarks
                    </Button>
                    <p className="text-sm text-gray-500">
                      Download all your bookmarks as a JSON file for backup or migration purposes.
                    </p>
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                      Account management actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
