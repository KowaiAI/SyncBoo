import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bookmark, LayoutDashboard, Upload, FolderOpen, Monitor, Settings, Download, LogOut, Copy, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { name: "Import", href: "/import", icon: Upload },
    { name: "Export", href: "/export", icon: Download },
    { name: "Organize", href: "/organize", icon: FolderOpen },
    { name: "Devices", href: "/devices", icon: Monitor },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-900">SyncBoo</h1>
          </div>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer`}
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 border-t border-gray-200">
          {user && (
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div>
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <img
                        className="inline-block h-9 w-9 rounded-full object-cover cursor-pointer"
                        src={user.profileImageUrl || "/api/placeholder/36/36"}
                        alt="User profile"
                      />
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => window.open(user.profileImageUrl || "/api/placeholder/36/36", '_blank')}>
                        <Eye className="w-4 h-4 mr-2" />
                        View profile image
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => navigator.clipboard.writeText(user.profileImageUrl || "/api/placeholder/36/36")}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy image address
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => window.location.href = '/settings'}>
                        <Settings className="w-4 h-4 mr-2" />
                        Profile settings
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName || user.lastName 
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : 'User'
                    }
                  </p>
                  <p className="text-xs font-medium text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = "/api/logout"}
                className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
