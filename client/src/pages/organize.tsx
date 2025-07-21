import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FolderOpen, Plus, Edit, Trash2, Globe, Move } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  id: number;
  name: string;
  color: string;
  description?: string;
  bookmarkCount?: number;
}

interface Bookmark {
  id: number;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  collectionId?: number;
  collection?: Collection;
}

export default function OrganizePage() {
  const [selectedBookmarks, setSelectedBookmarks] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState("#3B82F6");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ["/api/collections"],
  });

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useQuery({
    queryKey: ["/api/bookmarks"],
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; description?: string }) => {
      return await apiRequest("/api/collections", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      setIsCreateDialogOpen(false);
      setNewCollectionName("");
      setNewCollectionColor("#3B82F6");
      toast({
        title: "Collection Created",
        description: "Your new collection has been created successfully.",
      });
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Collection> }) => {
      return await apiRequest(`/api/collections/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      setEditingCollection(null);
      toast({
        title: "Collection Updated",
        description: "Collection has been updated successfully.",
      });
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/collections/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "Collection Deleted",
        description: "Collection has been deleted successfully.",
      });
    },
  });

  const moveBookmarksMutation = useMutation({
    mutationFn: async ({ bookmarkIds, collectionId }: { bookmarkIds: number[]; collectionId: number | null }) => {
      return await Promise.all(
        bookmarkIds.map(id => 
          apiRequest(`/api/bookmarks/${id}`, {
            method: "PATCH",
            body: { collectionId },
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      setSelectedBookmarks([]);
      toast({
        title: "Bookmarks Moved",
        description: "Selected bookmarks have been moved successfully.",
      });
    },
  });

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    
    createCollectionMutation.mutate({
      name: newCollectionName.trim(),
      color: newCollectionColor,
    });
  };

  const handleUpdateCollection = () => {
    if (!editingCollection || !newCollectionName.trim()) return;
    
    updateCollectionMutation.mutate({
      id: editingCollection.id,
      data: {
        name: newCollectionName.trim(),
        color: newCollectionColor,
      },
    });
  };

  const handleSelectBookmark = (bookmarkId: number) => {
    setSelectedBookmarks(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleMoveSelected = (collectionId: number | null) => {
    if (selectedBookmarks.length === 0) return;
    
    moveBookmarksMutation.mutate({
      bookmarkIds: selectedBookmarks,
      collectionId,
    });
  };

  const getBookmarksByCollection = (collectionId: number | null) => {
    return bookmarks.filter((bookmark: Bookmark) => 
      collectionId === null ? !bookmark.collectionId : bookmark.collectionId === collectionId
    );
  };

  const uncategorizedBookmarks = getBookmarksByCollection(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Organize Bookmarks</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Create collections and organize your bookmarks
                  </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Collection
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Collection</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="collection-name">Collection Name</Label>
                        <Input
                          id="collection-name"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          placeholder="Enter collection name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="collection-color">Color</Label>
                        <div className="flex gap-2 mt-2">
                          {["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#F97316"].map((color) => (
                            <button
                              key={color}
                              className={`w-8 h-8 rounded-full border-2 ${
                                newCollectionColor === color ? "border-gray-400" : "border-gray-200"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewCollectionColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                      <Button onClick={handleCreateCollection} disabled={createCollectionMutation.isPending}>
                        {createCollectionMutation.isPending ? "Creating..." : "Create Collection"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Bulk Actions */}
              {selectedBookmarks.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      {selectedBookmarks.length} bookmark(s) selected
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveSelected(null)}
                        disabled={moveBookmarksMutation.isPending}
                      >
                        <Move className="mr-1 h-3 w-3" />
                        Remove from Collections
                      </Button>
                      {collections.map((collection: Collection) => (
                        <Button
                          key={collection.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveSelected(collection.id)}
                          disabled={moveBookmarksMutation.isPending}
                          style={{ borderColor: collection.color }}
                        >
                          Move to {collection.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Uncategorized Bookmarks */}
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-600">
                      <FolderOpen className="mr-2 h-5 w-5" />
                      Uncategorized ({uncategorizedBookmarks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 min-h-32">
                    {uncategorizedBookmarks.map((bookmark: Bookmark) => (
                      <div
                        key={bookmark.id}
                        className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={selectedBookmarks.includes(bookmark.id)}
                            onCheckedChange={() => handleSelectBookmark(bookmark.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {bookmark.title}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {bookmark.url}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {uncategorizedBookmarks.length === 0 && (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        No uncategorized bookmarks
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Collections */}
                {collections.map((collection: Collection) => {
                  const collectionBookmarks = getBookmarksByCollection(collection.id);
                  return (
                    <Card key={collection.id} className="h-fit">
                      <CardHeader style={{ borderTopColor: collection.color }} className="border-t-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center text-gray-900">
                            <FolderOpen className="mr-2 h-5 w-5" style={{ color: collection.color }} />
                            {collection.name} ({collectionBookmarks.length})
                          </CardTitle>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCollection(collection);
                                setNewCollectionName(collection.name);
                                setNewCollectionColor(collection.color);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCollectionMutation.mutate(collection.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 min-h-32">
                        {collectionBookmarks.map((bookmark: Bookmark) => (
                          <div
                            key={bookmark.id}
                            className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-2">
                              <Checkbox
                                checked={selectedBookmarks.includes(bookmark.id)}
                                onCheckedChange={() => handleSelectBookmark(bookmark.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {bookmark.title}
                                </h4>
                                <p className="text-xs text-gray-500 truncate">
                                  {bookmark.url}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {collectionBookmarks.length === 0 && (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            No bookmarks in this collection
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Edit Collection Dialog */}
              <Dialog open={!!editingCollection} onOpenChange={() => setEditingCollection(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-collection-name">Collection Name</Label>
                      <Input
                        id="edit-collection-name"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Enter collection name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-collection-color">Color</Label>
                      <div className="flex gap-2 mt-2">
                        {["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#F97316"].map((color) => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-full border-2 ${
                              newCollectionColor === color ? "border-gray-400" : "border-gray-200"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewCollectionColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleUpdateCollection} disabled={updateCollectionMutation.isPending}>
                      {updateCollectionMutation.isPending ? "Updating..." : "Update Collection"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}