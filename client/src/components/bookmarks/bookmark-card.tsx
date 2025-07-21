import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Tag, MoreVertical, Edit, Trash2, Copy, Download, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface BookmarkCardProps {
  bookmark: {
    id: number;
    title: string;
    url: string;
    description?: string;
    favicon?: string;
    tags?: string[];
    sourceApp?: string;
    createdAt: string;
    device?: {
      name: string;
    };
    collection?: {
      name: string;
      color: string;
    };
  };
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/bookmarks/${bookmark.id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bookmark Deleted",
        description: "The bookmark has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
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
        description: "Failed to delete bookmark",
        variant: "destructive",
      });
    },
  });

  const getBrowserColor = (sourceApp: string) => {
    switch (sourceApp?.toLowerCase()) {
      case 'chrome':
        return 'bg-blue-100 text-blue-800';
      case 'firefox':
        return 'bg-orange-100 text-orange-800';
      case 'edge':
        return 'bg-blue-100 text-blue-800';
      case 'opera':
        return 'bg-red-100 text-red-800';
      case 'safari':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {bookmark.favicon ? (
                <ContextMenu>
                  <ContextMenuTrigger>
                    <img 
                      className="h-8 w-8 rounded cursor-pointer" 
                      src={bookmark.favicon} 
                      alt="Favicon"
                      onError={(e) => {
                        e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`;
                      }}
                    />
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => window.open(bookmark.favicon, '_blank')}>
                      <Eye className="w-4 h-4 mr-2" />
                      View image
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => navigator.clipboard.writeText(bookmark.favicon || '')}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy image address
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => {
                      const link = document.createElement('a');
                      link.href = bookmark.favicon || '';
                      link.download = `favicon-${new URL(bookmark.url).hostname}.png`;
                      link.click();
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      Save image
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => window.open(bookmark.url, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open website
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ) : (
                <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                <a 
                  href={bookmark.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  {truncateText(bookmark.title, 60)}
                </a>
              </h4>
              {bookmark.description && (
                <p className="text-xs text-gray-500 mb-2">
                  {truncateText(bookmark.description, 100)}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {bookmark.sourceApp && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getBrowserColor(bookmark.sourceApp)}`}
                    >
                      {bookmark.sourceApp}
                    </Badge>
                  )}
                  {bookmark.collection && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: bookmark.collection.color }}
                    >
                      {bookmark.collection.name}
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-600"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {bookmark.tags.slice(0, 3).map((tag: string) => (
              <span 
                key={tag} 
                className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
              >
                <Tag className="mr-1 h-2 w-2" />
                {tag}
              </span>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{bookmark.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{formatTimeAgo(bookmark.createdAt)}</span>
          {bookmark.device?.name && <span>{bookmark.device.name}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
