import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { ExternalLink, Tag, Copy, Download, Eye } from "lucide-react";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function RecentBookmarks() {
  const { isAuthenticated } = useAuth();
  
  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["/api/bookmarks", { limit: 10 }],
    enabled: isAuthenticated,
  });

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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-white shadow rounded-md">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-4 py-4 border-b border-gray-200 last:border-b-0">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
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
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookmarks</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your most recently added bookmarks across all devices
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/organize">
            <Button variant="ghost" className="text-primary hover:text-blue-500">
              View all →
            </Button>
          </Link>
        </div>
      </div>
      
      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ExternalLink className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarks yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Import some bookmarks to get started.
              </p>
              <Link href="/import">
                <Button className="mt-4" size="sm">
                  Import Bookmarks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {bookmarks.map((bookmark: any) => (
                  <li key={bookmark.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
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
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-primary truncate max-w-md hover:underline">
                                <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                                  {bookmark.title}
                                </a>
                              </p>
                              <div className="ml-2 flex-shrink-0">
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getBrowserColor(bookmark.sourceApp)}`}
                                >
                                  {bookmark.sourceApp || 'imported'}
                                </Badge>
                              </div>
                            </div>
                            {bookmark.description && (
                              <p className="text-sm text-gray-500 truncate max-w-lg mt-1">
                                {truncateText(bookmark.description, 120)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-lg">
                              {bookmark.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 ml-4">
                          <p>{formatTimeAgo(bookmark.createdAt)}</p>
                          {bookmark.device?.name && (
                            <p className="ml-2">• {bookmark.device.name}</p>
                          )}
                        </div>
                      </div>
                      {bookmark.tags && bookmark.tags.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            {bookmark.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="inline-flex items-center">
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                            {bookmark.tags.length > 3 && (
                              <span className="text-gray-400">
                                +{bookmark.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
