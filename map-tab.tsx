import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Calendar, Images, Globe, Plus } from "lucide-react";
import WorldMap from "@/components/world-map";
import PostcardModal from "@/components/postcard-modal";
import CountryActionsModal from "@/components/country-actions-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Country } from "@shared/schema";

export default function MapTab() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showPostcardsModal, setShowPostcardsModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use regular endpoint with auth disabled
  const { data: countries = [], isLoading: countriesLoading } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
    retry: false,
  });
  

  
  // Debug countries data and ensure full initialization
  useEffect(() => {
    console.log('🌍 Countries loaded:', countries.length, 'countries');
    if (countries.length > 0 && countries.length < 100) {
      console.warn('⚠️ Only', countries.length, 'countries loaded - should be 195+');
    }
    if (countries.length > 0) {
      const indiaCountry = countries.find(c => c.code === 'IN');
      const southAfricaCountry = countries.find(c => c.code === 'ZA');
      console.log('🇮🇳 India found:', indiaCountry?.name, 'ID:', indiaCountry?.id);
      console.log('🇿🇦 South Africa found:', southAfricaCountry?.name, 'ID:', southAfricaCountry?.id);
      
      // Clear any residual selected state
      console.log('🧹 Clearing selectedCountry state on countries load');
      setSelectedCountry(null);
      
      // Test if South Africa is somehow auto-selected
      const firstCountry = countries[0];
      console.log('First country in array:', firstCountry?.name, firstCountry?.id);
    }
  }, [countries]);

  const { data: stats } = useQuery<{
    visitedCount: number;
    upcomingCount: number;
    postcardsCount: number;
    totalCountries: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const markAsVisitedMutation = useMutation({
    mutationFn: async (countryId: number) => {
      return apiRequest("PATCH", `/api/countries/${countryId}`, {
        status: "visited",
        visitedDate: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Country marked as visited!",
        description: `${selectedCountry?.name} has been added to your visited countries.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark country as visited.",
        variant: "destructive",
      });
    },
  });

  const addToUpcomingMutation = useMutation({
    mutationFn: async (countryId: number) => {
      return apiRequest("PATCH", `/api/countries/${countryId}`, {
        status: "upcoming",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Country added to upcoming trips!",
        description: `${selectedCountry?.name} has been added to your upcoming destinations.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add country to upcoming trips.",
        variant: "destructive",
      });
    },
  });

  const handleCountryClick = (country: Country) => {
    try {
      console.log('Country clicked:', country.name);
      
      // Check if this is the same country already selected
      if (selectedCountry && selectedCountry.id === country.id) {
        setShowActionsModal(true);
        return;
      }
      
      // First click - just select the country
      setSelectedCountry(country);
      setShowActionsModal(false);
    } catch (error) {
      console.error('Error in handleCountryClick:', error);
    }
  };

  const handleCountryDoubleClick = (country: Country) => {
    try {
      console.log('Country double-clicked:', country.name);
      
      // Simple double-click handling without complex state manipulation
      setSelectedCountry(country);
      setShowActionsModal(true);
      setShowPostcardsModal(false);
    } catch (error) {
      console.error('Error in handleCountryDoubleClick:', error);
    }
  };

  const handlePostcardClick = (country: Country) => {
    console.log('handlePostcardClick called with country:', country);
    setSelectedCountry(country);
    console.log('Setting showPostcardsModal to true');
    setShowPostcardsModal(true);
  };

  const handleViewPostcards = (country: Country) => {
    console.log('=== MAP-TAB handleViewPostcards ===');
    console.log('View postcards setting selected country to:', country.name, country.code);
    setSelectedCountry(country);
    setShowPostcardsModal(true);
  };

  const handleMarkAsVisited = () => {
    if (selectedCountry) {
      markAsVisitedMutation.mutate(selectedCountry.id);
    }
  };

  const handleAddToUpcoming = () => {
    if (selectedCountry) {
      addToUpcomingMutation.mutate(selectedCountry.id);
    }
  };



  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Globe className="text-travel-blue mr-3" />
              Explore the World
            </h2>

          </div>
          
          {/* Map Container */}
          <div className="relative bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl overflow-hidden min-h-[500px]">
            {countriesLoading ? (
              <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                <p>Loading map...</p>
              </div>
            ) : (
              <WorldMap 
                countries={countries}
                onCountryClick={handleCountryClick}
                onCountryDoubleClick={handleCountryDoubleClick}
                onPostcardClick={handlePostcardClick}
                selectedCountry={selectedCountry}
              />
            )}
            
            {!countries.length && !countriesLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-travel-blue bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                    <Globe className="text-travel-blue text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Loading Map</h3>
                    <p className="text-sm text-gray-500 max-w-md">Preparing your travel exploration experience...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="flex justify-center space-x-2 text-xs mt-4">
              <Badge className="bg-visited-light text-travel-green">
                {stats.visitedCount} Visited
              </Badge>
              <Badge className="bg-upcoming-light text-yellow-700">
                {stats.upcomingCount} Upcoming
              </Badge>
              <Badge className="bg-gray-100 text-gray-600">
                {stats.totalCountries - stats.visitedCount - stats.upcomingCount} To Explore
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Country Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Country Info */}
        <Card>
          <CardContent className="p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">Selected Country</h3>
            {selectedCountry ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{selectedCountry.flag}</span>
                  <div>
                    <h4 className="font-semibold text-lg">{selectedCountry.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      Status: {selectedCountry.status}
                    </p>
                    {selectedCountry.visitedDate && (
                      <p className="text-sm text-gray-500">
                        Visited: {selectedCountry.visitedDate}
                      </p>
                    )}
                  </div>
                </div>
                <Badge 
                  className={
                    selectedCountry.status === 'visited' 
                      ? 'bg-visited-light text-travel-green'
                      : selectedCountry.status === 'upcoming'
                      ? 'bg-upcoming-light text-yellow-700'
                      : 'bg-gray-100 text-gray-600'
                  }
                >
                  {selectedCountry.status === 'visited' ? 'Visited' : 
                   selectedCountry.status === 'upcoming' ? 'Upcoming' : 'Unvisited'}
                </Badge>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Globe className="mx-auto text-2xl mb-2" />
                <p className="text-sm">Click on a country to view details</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                className="w-full bg-travel-green hover:bg-green-600 text-white"
                disabled={!selectedCountry || selectedCountry.status === 'visited'}
                onClick={handleMarkAsVisited}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark as Visited
              </Button>
              <Button 
                className="w-full bg-travel-yellow hover:bg-yellow-400 text-gray-800"
                disabled={!selectedCountry || selectedCountry.status !== 'unvisited'}
                onClick={handleAddToUpcoming}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Add to Upcoming
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                disabled={!selectedCountry}
                onClick={() => {
                  if (selectedCountry) {
                    handleViewPostcards(selectedCountry);
                  }
                }}
              >
                <Images className="mr-2 h-4 w-4" />
                View Postcards
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Postcard Modal */}
      <PostcardModal
        open={showPostcardsModal && Boolean(selectedCountry)}
        onOpenChange={(open) => {
          setShowPostcardsModal(open);
          if (!open) {
            setSelectedCountry(null); // Reset selected country on close
          }
        }}
        country={selectedCountry}
      />

      {/* Country Actions Modal */}
      <CountryActionsModal
        open={showActionsModal}
        onOpenChange={(open) => {
          setShowActionsModal(open);
        }}
        country={selectedCountry}
        onViewPostcards={handleViewPostcards}
      />
    </div>
  );
}
