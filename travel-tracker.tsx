import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, BarChart3, Plane, MapPin } from "lucide-react";
import StatsTab from "@/components/stats-tab";
import MapTab from "@/components/map-tab";

export default function TravelTracker() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
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
                  <span className="text-blue-600">e</span>
                  <span className="text-blue-600">d</span>
                </h1>
                <p className="text-xs text-gray-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-red-500" />
                  Track your world adventures
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span>Sarah Johnson</span>
                <div className="w-8 h-8 bg-travel-green rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  SJ
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Stats Dashboard
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Interactive Map
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>
          
          <TabsContent value="map">
            <MapTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
