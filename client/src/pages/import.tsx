import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Chrome, Globe, Smartphone, Tablet, Monitor } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deviceType, setDeviceType] = useState<string>("");
  const [sourceApp, setSourceApp] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await fetch("/api/bookmarks/import", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      setSelectedFile(null);
      setDeviceType("");
      setSourceApp("");
      toast({
        title: "Import Successful",
        description: "Your bookmarks have been imported successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: "Failed to import bookmarks. Please check your file format.",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile || !deviceType || !sourceApp) {
      toast({
        title: "Missing Information",
        description: "Please select a file, device type, and source application.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("deviceType", deviceType);
    formData.append("sourceApp", sourceApp);

    importMutation.mutate(formData);
  };

  const deviceTypes = [
    { value: "desktop", label: "Desktop Computer", icon: Monitor },
    { value: "mobile", label: "Mobile Phone", icon: Smartphone },
    { value: "tablet", label: "Tablet", icon: Tablet },
  ];

  const sourceApps = [
    { value: "chrome", label: "Google Chrome", icon: Chrome },
    { value: "firefox", label: "Mozilla Firefox", icon: Globe },
    { value: "safari", label: "Safari", icon: Globe },
    { value: "edge", label: "Microsoft Edge", icon: Globe },
    { value: "opera", label: "Opera", icon: Globe },
    { value: "brave", label: "Brave Browser", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Import Bookmarks</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Import bookmarks from your browsers and devices
                </p>
              </div>

              <div className="grid gap-6">
                {/* File Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Select Bookmark File
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-blue-400 bg-blue-50"
                          : selectedFile
                          ? "border-green-400 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      {selectedFile ? (
                        <div>
                          <p className="text-lg font-medium text-green-600">
                            File Selected: {selectedFile.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Size: {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            Drag and drop your bookmark file here
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            or click to browse files
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".html,.json,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload">
                        <Button variant="outline" className="cursor-pointer">
                          Browse Files
                        </Button>
                      </Label>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      <p className="font-medium mb-2">Supported file formats:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>HTML bookmark files (Chrome, Firefox, Safari, Edge)</li>
                        <li>JSON bookmark exports</li>
                        <li>Plain text bookmark lists</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Device and Source Selection */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Device Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={deviceType} onValueChange={setDeviceType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device type" />
                        </SelectTrigger>
                        <SelectContent>
                          {deviceTypes.map((device) => (
                            <SelectItem key={device.value} value={device.value}>
                              <div className="flex items-center">
                                <device.icon className="mr-2 h-4 w-4" />
                                {device.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Source Application</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={sourceApp} onValueChange={setSourceApp}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select browser or app" />
                        </SelectTrigger>
                        <SelectContent>
                          {sourceApps.map((app) => (
                            <SelectItem key={app.value} value={app.value}>
                              <div className="flex items-center">
                                <app.icon className="mr-2 h-4 w-4" />
                                {app.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </div>

                {/* Import Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle>How to Export Bookmarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Google Chrome:</h4>
                        <p className="text-sm text-gray-600">
                          Settings → Bookmarks → Bookmark Manager → Menu (⋮) → Export bookmarks
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Mozilla Firefox:</h4>
                        <p className="text-sm text-gray-600">
                          Bookmarks → Manage Bookmarks → Import and Backup → Export Bookmarks to HTML
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Safari (Mac):</h4>
                        <p className="text-sm text-gray-600">
                          File → Export Bookmarks
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Safari (iOS):</h4>
                        <p className="text-sm text-gray-600">
                          Settings → Safari → Advanced → Website Data → Export
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Microsoft Edge:</h4>
                        <p className="text-sm text-gray-600">
                          Settings → Profiles → Import browser data → Export to file
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Import Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile || !deviceType || !sourceApp || importMutation.isPending}
                    size="lg"
                  >
                    {importMutation.isPending ? "Importing..." : "Import Bookmarks"}
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