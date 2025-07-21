import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Smartphone, Monitor, FolderSync, Shield, Cloud } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">SyncBoo</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => window.location.href = "/signup"}>
                Create Account
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = "/login"}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Sync Your Bookmarks
            <span className="text-primary"> Everywhere</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Enterprise-grade bookmark synchronization across all your devices. Import from Chrome, Firefox, Edge, Opera and more.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => window.location.href = "/api/login"}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to manage bookmarks
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features designed for individuals and enterprises
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Monitor className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Multi-Browser Support</CardTitle>
                <CardDescription>
                  Import bookmarks from Chrome, Firefox, Edge, Opera, and Safari with one click
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FolderSync className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Real-time FolderSync</CardTitle>
                <CardDescription>
                  Your bookmarks are synchronized across all devices in real-time automatically
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Cross-Platform</CardTitle>
                <CardDescription>
                  Works seamlessly on Windows, macOS, Linux, iOS, and Android devices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level encryption and security features to protect your browsing data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Cloud className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Smart Organization</CardTitle>
                <CardDescription>
                  AI-powered categorization and intelligent bookmark organization
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Bookmark className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Import & Export</CardTitle>
                <CardDescription>
                  Easy import from bookmark files and export for backup purposes
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            <span className="block">Ready to sync your bookmarks?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-100">
            Join thousands of users who trust SyncBoo with their browsing data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/signup"}
            >
              Create Account
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.location.href = "/login"}
            >
              Sign In
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => window.location.href = "/api/login"}
            >
              Try Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900">SyncBoo</span>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            © 2025 SyncBoo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
