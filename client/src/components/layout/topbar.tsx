import { useState } from "react";
import { Search, FolderSync, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [syncStatus, setSyncStatus] = useState("synced");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSync = () => {
    setSyncStatus("syncing");
    // Simulate sync
    setTimeout(() => {
      setSyncStatus("synced");
    }, 2000);
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:border-none">
      <button className="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden">
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex-1 px-4 flex justify-between sm:px-6 lg:px-8">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Search className="h-5 w-5" />
              </div>
              <Input
                className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent bg-transparent"
                placeholder="Search bookmarks..."
                type="search"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm">
              <Badge 
                variant={syncStatus === "synced" ? "default" : "secondary"}
                className={syncStatus === "synced" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${syncStatus === "synced" ? "bg-green-500" : "bg-yellow-500"}`}></div>
                {syncStatus === "synced" ? "Synced" : "Syncing..."}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncStatus === "syncing"}
            >
              <FolderSync className={`h-5 w-5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
