import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Globe, Chrome } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ExportPage() {
  const [selectedBookmarks, setSelectedBookmarks] = useState<number[]>([]);
  const [exportFormat, setExportFormat] = useState<string>("html");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const { toast } = useToast();

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["/api/bookmarks"],
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["/api/collections"],
  });

  const exportMutation = useMutation({
    mutationFn: async (data: { bookmarkIds: number[]; format: string; includeMetadata: boolean }) => {
      const response = await fetch("/api/bookmarks/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `bookmarks-export-${new Date().toISOString().split('T')[0]}.${data.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "Your bookmarks have been downloaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: "Failed to export bookmarks. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectBookmark = (bookmarkId: number) => {
    setSelectedBookmarks(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookmarks.length === bookmarks.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(bookmarks.map((b: any) => b.id));
    }
  };

  const handleExport = () => {
    if (selectedBookmarks.length === 0) {
      toast({
        title: "No Bookmarks Selected",
        description: "Please select at least one bookmark to export.",
        variant: "destructive",
      });
      return;
    }

    exportMutation.mutate({
      bookmarkIds: selectedBookmarks,
      format: exportFormat,
      includeMetadata,
    });
  };

  const exportFormats = [
    { value: "html", label: "HTML (Chrome/Firefox compatible)", icon: Globe },
    { value: "json", label: "JSON (detailed metadata)", icon: FileText },
    { value: "csv", label: "CSV (spreadsheet compatible)", icon: FileText },
    { value: "txt", label: "Plain text (simple list)", icon: FileText },
  ];

  const getCollectionName = (collectionId: number) => {
    const collection = collections.find((c: any) => c.id === collectionId);
    return collection ? collection.name : "Uncategorized";
  };

  const groupedBookmarks = bookmarks.reduce((groups: any, bookmark: any) => {
    const collectionName = bookmark.collectionId ? getCollectionName(bookmark.collectionId) : "Uncategorized";
    if (!groups[collectionName]) {
      groups[collectionName] = [];
    }
    groups[collectionName].push(bookmark);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Export Bookmarks</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Export your bookmarks in various formats for backup or transfer to other browsers
                </p>
              </div>

              <div className="grid gap-6">
                {/* Export Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Export Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Export Format
                        </label>
                        <Select value={exportFormat} onValueChange={setExportFormat}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select export format" />
                          </SelectTrigger>
                          <SelectContent>
                            {exportFormats.map((format) => (
                              <SelectItem key={format.value} value={format.value}>
                                <div className="flex items-center">
                                  <format.icon className="mr-2 h-4 w-4" />
                                  {format.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-metadata"
                          checked={includeMetadata}
                          onCheckedChange={setIncludeMetadata}
                        />
                        <label
                          htmlFor="include-metadata"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Include metadata (tags, descriptions, timestamps)
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selection Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Select Bookmarks</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          {selectedBookmarks.length === bookmarks.length ? "Deselect All" : "Select All"}
                        </Button>
                        <span className="text-sm text-gray-500">
                          {selectedBookmarks.length} of {bookmarks.length} selected
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(groupedBookmarks).map(([collectionName, bookmarks]: [string, any[]]) => (
                        <div key={collectionName} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{collectionName}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const collectionBookmarkIds = bookmarks.map(b => b.id);
                                const allSelected = collectionBookmarkIds.every(id => selectedBookmarks.includes(id));
                                if (allSelected) {
                                  setSelectedBookmarks(prev => prev.filter(id => !collectionBookmarkIds.includes(id)));
                                } else {
                                  setSelectedBookmarks(prev => [...new Set([...prev, ...collectionBookmarkIds])]);
                                }
                              }}
                            >
                              {bookmarks.every(b => selectedBookmarks.includes(b.id)) ? "Deselect Collection" : "Select Collection"}
                            </Button>
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {bookmarks.map((bookmark: any) => (
                              <div
                                key={bookmark.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedBookmarks.includes(bookmark.id)
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => handleSelectBookmark(bookmark.id)}
                              >
                                <div className="flex items-start gap-2">
                                  <Checkbox
                                    checked={selectedBookmarks.includes(bookmark.id)}
                                    onChange={() => handleSelectBookmark(bookmark.id)}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-gray-900 truncate">
                                      {bookmark.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate">
                                      {bookmark.url}
                                    </p>
                                    {bookmark.tags && bookmark.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {bookmark.tags.slice(0, 2).map((tag: string, index: number) => (
                                          <span
                                            key={index}
                                            className="inline-block px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                        {bookmark.tags.length > 2 && (
                                          <span className="text-xs text-gray-400">
                                            +{bookmark.tags.length - 2} more
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Export Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Import Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Google Chrome:</h4>
                        <p className="text-sm text-gray-600">
                          Settings → Bookmarks → Bookmark Manager → Menu (⋮) → Import bookmarks (select the exported HTML file)
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Mozilla Firefox:</h4>
                        <p className="text-sm text-gray-600">
                          Bookmarks → Manage Bookmarks → Import and Backup → Import Bookmarks from HTML
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Safari (Mac):</h4>
                        <p className="text-sm text-gray-600">
                          File → Import From → Bookmarks HTML File
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Microsoft Edge:</h4>
                        <p className="text-sm text-gray-600">
                          Settings → Profiles → Import browser data → Import from file
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleExport}
                    disabled={selectedBookmarks.length === 0 || exportMutation.isPending}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {exportMutation.isPending ? "Exporting..." : `Export ${selectedBookmarks.length} Bookmarks`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}