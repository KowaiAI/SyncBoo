import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FolderOpen, Globe, Calendar, Eye, Sparkles, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Bookmark {
  id: number;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  sourceApp?: string;
  createdAt: string;
  device?: {
    id: number;
    name: string;
    type: string;
  };
  collection?: {
    id: number;
    name: string;
    color: string;
  };
  aiSummary?: {
    description: string;
    lastVisited: string;
    visitCount: number;
    relatedSites: string[];
  };
}

export default function BookmarksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookmarks, setSelectedBookmarks] = useState<number[]>([]);
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [filterCollection, setFilterCollection] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["/api/bookmarks"],
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["/api/devices"],
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["/api/collections"],
  });

  const generateAIDescriptionMutation = useMutation({
    mutationFn: async (bookmarkId: number) => {
      return await apiRequest(`/api/bookmarks/${bookmarkId}/ai-enhance`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "AI Enhancement Complete",
        description: "Bookmark description has been enhanced with AI insights.",
      });
    },
    onError: (error) => {
      toast({
        title: "Enhancement Failed",
        description: "Failed to generate AI description. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredBookmarks = bookmarks.filter((bookmark: Bookmark) => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDevice = filterDevice === "all" || bookmark.device?.id.toString() === filterDevice;
    const matchesCollection = filterCollection === "all" || bookmark.collection?.id.toString() === filterCollection;

    return matchesSearch && matchesDevice && matchesCollection;
  });

  const handleSelectBookmark = (bookmarkId: number) => {
    setSelectedBookmarks(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookmarks.length === filteredBookmarks.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(filteredBookmarks.map(b => b.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage and organize all your saved bookmarks
                </p>
              </div>

              {/* Search and Filters */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bookmarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterDevice} onValueChange={setFilterDevice}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    {devices.map((device: any) => (
                      <SelectItem key={device.id} value={device.id.toString()}>
                        {device.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterCollection} onValueChange={setFilterCollection}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Collections</SelectItem>
                    {collections.map((collection: any) => (
                      <SelectItem key={collection.id} value={collection.id.toString()}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedBookmarks.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      {selectedBookmarks.length} bookmark(s) selected
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Move to Collection
                      </Button>
                      <Button variant="outline" size="sm">
                        Add Tags
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete Selected
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bookmarks List */}
              <div className="space-y-4">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-2 p-4 bg-white rounded-lg border">
                  <Checkbox
                    checked={selectedBookmarks.length === filteredBookmarks.length && filteredBookmarks.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    Select all ({filteredBookmarks.length} bookmarks)
                  </span>
                </div>

                {filteredBookmarks.map((bookmark: Bookmark) => (
                  <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={selectedBookmarks.includes(bookmark.id)}
                          onCheckedChange={() => handleSelectBookmark(bookmark.id)}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {bookmark.title}
                              </h3>
                              <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-flex items-center gap-1"
                              >
                                <Globe className="h-4 w-4" />
                                {bookmark.url}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              
                              {bookmark.description && (
                                <p className="text-gray-600 text-sm mb-3">
                                  {bookmark.description}
                                </p>
                              )}

                              {/* AI Summary */}
                              {bookmark.aiSummary && (
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-3 border border-purple-100">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-800">AI Insights</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">{bookmark.aiSummary.description}</p>
                                  <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Last visited: {bookmark.aiSummary.lastVisited}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {bookmark.aiSummary.visitCount} visits
                                    </div>
                                  </div>
                                  {bookmark.aiSummary.relatedSites.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-xs font-medium text-gray-700">Related sites: </span>
                                      <span className="text-xs text-gray-600">
                                        {bookmark.aiSummary.relatedSites.join(", ")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 mb-3">
                                {bookmark.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {bookmark.collection && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                    style={{ borderColor: bookmark.collection.color }}
                                  >
                                    <FolderOpen className="h-3 w-3 mr-1" />
                                    {bookmark.collection.name}
                                  </Badge>
                                )}
                                {bookmark.device && (
                                  <Badge variant="outline" className="text-xs">
                                    {bookmark.device.name} ({bookmark.device.type})
                                  </Badge>
                                )}
                                {bookmark.sourceApp && (
                                  <Badge variant="outline" className="text-xs">
                                    {bookmark.sourceApp}
                                  </Badge>
                                )}
                              </div>

                              <div className="text-xs text-gray-500">
                                Added {new Date(bookmark.createdAt).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {!bookmark.aiSummary && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateAIDescriptionMutation.mutate(bookmark.id)}
                                  disabled={generateAIDescriptionMutation.isPending}
                                  className="flex items-center gap-1"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  {generateAIDescriptionMutation.isPending ? "Enhancing..." : "AI Enhance"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredBookmarks.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Globe className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarks found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? "Try adjusting your search terms" : "Get started by importing your bookmarks"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}