import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/layout/sidebar";
import { Upload, FileText, Chrome, Globe, Smartphone, Monitor } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function UploadPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('bookmarkFile', file);
      
      const response = await fetch('/api/bookmarks/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `Imported ${data.count || 0} bookmarks successfully`,
      });
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload bookmarks file",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a bookmark file to upload",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(selectedFile);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.json'))) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload an HTML or JSON bookmark file",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload Bookmarks</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Import bookmarks from browser files</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            
            {/* Upload Instructions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  How to Export Bookmarks
                </CardTitle>
                <CardDescription>
                  Follow these steps to export bookmarks from your browser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <Chrome className="w-8 h-8 text-blue-500 mb-2" />
                    <h3 className="font-medium">Chrome</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                      Menu → Bookmarks → Bookmark Manager → Export
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <Globe className="w-8 h-8 text-orange-500 mb-2" />
                    <h3 className="font-medium">Firefox</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                      Library → Bookmarks → Export Bookmarks
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <Smartphone className="w-8 h-8 text-blue-600 mb-2" />
                    <h3 className="font-medium">Safari</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                      File → Export → Bookmarks
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <Monitor className="w-8 h-8 text-green-500 mb-2" />
                    <h3 className="font-medium">Edge</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                      Menu → Favorites → Manage → Export
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Bookmark File
                </CardTitle>
                <CardDescription>
                  Choose your exported bookmark file to import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Drag and Drop Area */}
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Drop your bookmark file here
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    or click below to browse for files
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="bookmarkFile" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Choose File</span>
                      </Button>
                    </Label>
                    <Input
                      id="bookmarkFile"
                      type="file"
                      accept=".html,.json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Selected File */}
                {selectedFile && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-blue-500" />
                          <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleUpload}
                          disabled={uploadMutation.isPending}
                        >
                          {uploadMutation.isPending ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                      
                      {uploadMutation.isPending && (
                        <Progress value={uploadProgress} className="w-full" />
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* File Format Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Supported File Types</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• HTML bookmark files (.html)</li>
                    <li>• JSON bookmark files (.json)</li>
                    <li>• Maximum file size: 10MB</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}