import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/ui/file-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Upload, Chrome, Earth, Globe } from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importMethod, setImportMethod] = useState<'file' | 'browser' | null>(null);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("bookmarkFile", file);
      
      const response = await apiRequest("POST", "/api/import/file", formData);
      return response.json();
    },
    onSuccess: (data) => {
      setIsImporting(false);
      setImportProgress(0);
      setImportMethod(null);
      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.imported} bookmarks${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onClose();
    },
    onError: (error) => {
      setIsImporting(false);
      setImportProgress(0);
      setImportMethod(null);
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
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    setIsImporting(true);
    setImportProgress(25);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await importMutation.mutateAsync(file);
      setImportProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
    }
  };

  const handleBrowserImport = (browser: string) => {
    toast({
      title: "Browser Import",
      description: `${browser} import functionality will be available in the desktop application. For now, please export bookmarks from ${browser} and upload the file.`,
    });
  };

  const handleClose = () => {
    if (!isImporting) {
      setImportMethod(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5 text-primary" />
            Import Bookmarks
          </DialogTitle>
          <DialogDescription>
            Choose a browser to import bookmarks from, or upload a bookmark file.
          </DialogDescription>
        </DialogHeader>

        {isImporting ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Importing bookmarks...</div>
            <Progress value={importProgress} className="w-full" />
            <div className="text-xs text-gray-500">{importProgress}% complete</div>
          </div>
        ) : (
          <div className="space-y-4">
            {!importMethod ? (
              <>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleBrowserImport("Chrome")}
                  >
                    <div className="w-5 h-5 mr-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <Chrome className="w-3 h-3 text-white" />
                    </div>
                    Import from Chrome
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleBrowserImport("Earth")}
                  >
                    <div className="w-5 h-5 mr-3 bg-orange-500 rounded-full flex items-center justify-center">
                      <Earth className="w-3 h-3 text-white" />
                    </div>
                    Import from Earth
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleBrowserImport("Edge")}
                  >
                    <div className="w-5 h-5 mr-3 bg-blue-600 rounded-full flex items-center justify-center">
                      <Globe className="w-3 h-3 text-white" />
                    </div>
                    Import from Edge
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleBrowserImport("Opera")}
                  >
                    <div className="w-5 h-5 mr-3 bg-red-500 rounded-full"></div>
                    Import from Opera
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or upload file</span>
                  </div>
                </div>

                <FileUpload
                  onFileSelect={handleFileUpload}
                  accept=".html,.json"
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </>
            ) : (
              <div>
                {/* File upload content would go here if needed */}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
          >
            {isImporting ? "Importing..." : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
