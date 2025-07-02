import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, MapPin, Camera, Trophy, Plane } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center relative shadow-lg">
                <Globe className="text-white text-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-black rounded-full flex items-center justify-center">
                  <Plane className="w-2 h-2 text-black" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-gray-800">visit</span>
                  <span className="text-blue-500">e</span>
                  <span className="text-blue-600">d</span>
                </h1>
                <p className="text-xs text-gray-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-red-500" />
                  Track your world adventures
                </p>
              </div>
            </div>
            <Button onClick={handleLogin} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center relative shadow-2xl">
              <Globe className="text-white text-4xl" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center animate-bounce">
                <Plane className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gray-800">visit</span>
            <span className="text-blue-600">e</span>
            <span className="text-blue-600">d</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your travel experiences into an interactive journey. Track countries, collect digital postcards, 
            and visualize your adventures on a beautiful world map.
          </p>
          
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Exploring
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-xl transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-blue-100">
                <MapPin className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive Map</h3>
              <p className="text-gray-600">
                Explore the world with our interactive map. Mark countries as visited, upcoming, or on your wishlist.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-red-100">
                <Camera className="text-red-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Digital Postcards</h3>
              <p className="text-gray-600">
                Capture memories by uploading photos from your travels. Create a beautiful collection of digital postcards.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-blue-100">
                <Trophy className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your travel achievements and see how you compare with other explorers around the world.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 w-8 h-8 bg-red-500 rounded-full opacity-20"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 bg-red-500 rounded-full opacity-30"></div>
          <h2 className="text-3xl font-bold mb-4">Ready to Start Exploring?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who are already tracking their adventures with visited.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-4 rounded-xl shadow-lg border border-red-100"
          >
            Sign Up Now
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="text-white text-sm" />
            </div>
            <span className="text-lg font-bold">
              <span className="text-gray-800">visit</span>
              <span className="text-blue-600">e</span>
              <span className="text-blue-600">d</span>
            </span>
          </div>
          <p className="text-gray-600">© 2025 visited. Track your world adventures.</p>
        </div>
      </footer>
    </div>
  );
}