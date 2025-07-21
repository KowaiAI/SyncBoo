import { Card, CardContent } from "@/components/ui/card";
import { Upload, FolderOpen, Settings } from "lucide-react";
import { Link } from "wouter";

interface QuickActionsProps {
  onImport: () => void;
}

export function QuickActions({ onImport }: QuickActionsProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onImport}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Import from Chrome</p>
                <p className="text-sm text-gray-500 truncate">Sync your Chrome bookmarks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Link href="/organize">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Organize Bookmarks</p>
                  <p className="text-sm text-gray-500 truncate">Create folders and tags</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/settings">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Sync Settings</p>
                  <p className="text-sm text-gray-500 truncate">Configure auto-sync options</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
