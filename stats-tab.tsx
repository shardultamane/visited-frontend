import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Flag, Calendar, Images, Trophy, Plus, Plane, Upload, Share2 } from "lucide-react";
import { useState } from "react";
import CountriesModal from "@/components/countries-modal";
import PostcardModal from "@/components/postcard-modal";
import MasterPhotoGrid from "@/components/master-photo-grid";
import StatsImageGenerator from "@/components/stats-image-generator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Country, Trip } from "@shared/schema";

interface Stats {
  visitedCount: number;
  upcomingCount: number;
  postcardsCount: number;
  totalCountries: number;
}

export default function StatsTab() {
  const [showCountriesModal, setShowCountriesModal] = useState(false);
  const [showPostcardsModal, setShowPostcardsModal] = useState(false);
  const [showMasterPhotoGrid, setShowMasterPhotoGrid] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: countries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const { data: trips } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  const visitedCountries = countries?.filter(c => c.status === "visited") || [];
  const allTrips = trips || [];

  const progressPercentage = stats ? Math.round((stats.visitedCount / stats.totalCountries) * 100) : 0;

  // WhatsApp sharing functionality
  const shareToWhatsApp = () => {
    if (!stats) return;
    
    const visitedCountriesList = visitedCountries.slice(0, 5).map(c => c.name).join(', ');
    const moreCountries = visitedCountries.length > 5 ? ` and ${visitedCountries.length - 5} more` : '';
    
    // Generate achievement badges
    const achievements = [];
    if (stats.visitedCount >= 10) achievements.push('🏆 Globetrotter');
    if (stats.visitedCount >= 25) achievements.push('🌟 World Explorer');
    if (stats.visitedCount >= 50) achievements.push('👑 Travel Master');
    if (stats.postcardsCount >= 20) achievements.push('📸 Photo Collector');
    if (progressPercentage >= 10) achievements.push('🗺️ Map Conqueror');
    
    const achievementText = achievements.length > 0 ? `\n🏅 Achievements: ${achievements.join(', ')}\n` : '';
    
    const message = `🌍 My Travel Journey with visited!

✈️ Countries Visited: ${stats.visitedCount}/${stats.totalCountries} (${progressPercentage}%)
📅 Upcoming Adventures: ${stats.upcomingCount}
📸 Travel Memories: ${stats.postcardsCount} photos${achievementText}
🗺️ Recent destinations: ${visitedCountriesList}${moreCountries}

Join me in tracking amazing travels: ${window.location.origin}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Share link opened!",
      description: "Your travel stats are ready to share on WhatsApp.",
    });
  };

  const handleOpenPostcards = (country: Country) => {
    setSelectedCountry(country);
    setShowPostcardsModal(true);
  };

  // Add Trip form component
  const AddTripForm = ({ countries }: { countries: Country[] | undefined }) => {
    const [formData, setFormData] = useState({
      countryId: "",
      status: "upcoming"
    });
    const [open, setOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const addTripMutation = useMutation({
      mutationFn: async (tripData: any) => {
        // Update country status based on trip status
        const countryStatus = tripData.status === "completed" ? "visited" : "upcoming";
        
        // Update the country status
        await apiRequest("PATCH", `/api/countries/${tripData.countryId}`, {
          status: countryStatus,
          ...(countryStatus === "visited" ? { visitedDate: new Date().toISOString().split('T')[0] } : {})
        });

        return { countryId: tripData.countryId, status: tripData.status };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        toast({
          title: "Trip added successfully!",
          description: "Country status has been updated on the map.",
        });
        setFormData({ countryId: "", status: "upcoming" });
        setSelectedFiles(null);
        
        // Upload postcards if files were selected
        if (selectedFiles && selectedFiles.length > 0) {
          uploadPostcards(parseInt(formData.countryId));
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add trip.",
          variant: "destructive",
        });
      },
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.countryId) {
        toast({
          title: "Missing country",
          description: "Please select a country.",
          variant: "destructive",
        });
        return;
      }
      addTripMutation.mutate(formData);
    };

    const uploadPostcards = async (countryId: number) => {
      if (!selectedFiles) return;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('postcard', file);

        try {
          const response = await fetch(`/api/countries/${countryId}/postcards`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Upload failed');
          }
        } catch (error) {
          console.error('Failed to upload postcard:', error);
          toast({
            title: "Postcard upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/postcards"] });
      toast({
        title: "Postcards uploaded!",
        description: `Successfully uploaded ${selectedFiles.length} postcard${selectedFiles.length > 1 ? 's' : ''}.`,
      });
    };

    const handleFileSelect = (files: FileList | null) => {
      if (files) {
        const validFiles = Array.from(files).filter(file => 
          file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
        );
        
        if (validFiles.length !== files.length) {
          toast({
            title: "Invalid files",
            description: "Some files were skipped. Only images under 10MB are allowed.",
            variant: "destructive",
          });
        }
        
        const dataTransfer = new DataTransfer();
        validFiles.forEach(file => dataTransfer.items.add(file));
        setSelectedFiles(dataTransfer.files);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {formData.countryId
                  ? countries?.find((country) => country.id.toString() === formData.countryId)?.name
                  : "Select country..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search countries..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries?.map((country) => (
                      <CommandItem
                        key={country.id}
                        value={`${country.name} ${country.flag}`}
                        onSelect={() => {
                          setFormData({...formData, countryId: country.id.toString()});
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.countryId === country.id.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {country.flag} {country.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming Trip</SelectItem>
              <SelectItem value="completed">Completed Trip</SelectItem>
            </SelectContent>
          </Select>
          </div>

          <Button 
            type="submit" 
            disabled={addTripMutation.isPending}
            className="bg-travel-blue hover:bg-blue-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {addTripMutation.isPending ? "Adding..." : "Add Trip"}
          </Button>
        </div>

        {/* Postcard Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Postcards (Optional)
          </label>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('postcard-upload')?.click()}
          >
            <input
              id="postcard-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            
            {selectedFiles && selectedFiles.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {Array.from(selectedFiles).map((file, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click to change or drag new files to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Drop postcard images here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports: JPG, PNG, GIF (max 10MB each)
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    );
  };

  if (statsLoading) {
    return <div className="text-center py-8">Loading stats...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Travel Stats Header with Share Option */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Travel Stats</h2>
        {stats && stats.visitedCount > 0 && (
          <StatsImageGenerator 
            stats={stats}
            visitedCountries={visitedCountries}
            onImageGenerated={(imageUrl) => {
              toast({
                title: "Stats image generated!",
                description: "Your travel stats image is ready to share.",
              });
            }}
          />
        )}
      </div>

      {/* Travel Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries Visited Card */}
        <Card 
          className="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          onClick={() => setShowCountriesModal(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-visited-light rounded-lg flex items-center justify-center">
                <Flag className="text-travel-green text-lg" />
              </div>
              <Badge className="bg-visited-light text-travel-green text-xs">VISITED</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.visitedCount || 0}
                </span>
                <span className="text-sm text-gray-500">/ {stats?.totalCountries || 0}</span>
              </div>
              <p className="text-xs text-gray-600">Countries Visited</p>
              <Progress value={progressPercentage} className="h-1.5" />
              <p className="text-xs text-gray-500">{progressPercentage}% of world explored</p>
            </div>
          </CardContent>
        </Card>



        {/* Total Postcards Card */}
        <Card 
          className="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          onClick={() => setShowMasterPhotoGrid(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Images className="text-travel-blue text-lg" />
              </div>
              <Badge className="bg-blue-50 text-travel-blue text-xs">MEMORIES</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.postcardsCount || 0}
                </span>
              </div>
              <p className="text-xs text-gray-600">Travel Postcards</p>
              <p className="text-xs text-gray-500">Click to view photo grid</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Trip Section */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="text-travel-blue mr-2 w-4 h-4" />
            Add Trip
          </h3>
          <AddTripForm countries={countries} />
        </CardContent>
      </Card>

      {/* Gamification Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Trophy className="text-yellow-500 mr-3" />
            Your Travel Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User vs Average */}
            <div className="text-center p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
              <div className="text-3xl font-bold mb-2">{stats?.visitedCount || 0}</div>
              <div className="text-sm opacity-90">Your Countries</div>
              <div className="mt-3 pt-3 border-t border-green-400">
                <div className="text-lg font-semibold">+12</div>
                <div className="text-xs opacity-75">Above Average</div>
              </div>
            </div>

            {/* Global Average */}
            <div className="text-center p-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl text-white">
              <div className="text-3xl font-bold mb-2">35</div>
              <div className="text-sm opacity-90">Global Average</div>
              <div className="mt-3 pt-3 border-t border-gray-400">
                <div className="text-lg font-semibold">📊</div>
                <div className="text-xs opacity-75">All Users</div>
              </div>
            </div>

            {/* Rank Position */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
              <div className="text-3xl font-bold mb-2">#127</div>
              <div className="text-sm opacity-90">Global Rank</div>
              <div className="mt-3 pt-3 border-t border-blue-400">
                <div className="text-lg font-semibold">Top 15%</div>
                <div className="text-xs opacity-75">Explorer Level</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Trips Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Plane className="text-travel-blue mr-3" />
              Travel Adventures
            </h2>
          </div>
          
          <div className="space-y-4">
            {allTrips.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No trips added yet</p>
            ) : (
              allTrips.map((trip) => (
                <div key={trip.id} className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-travel-blue transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{trip.title}</h3>
                    <p className="text-sm text-gray-600">{trip.description}</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span>
                        <Calendar className="inline mr-1 h-3 w-3" />
                        {trip.startDate} - {trip.endDate}
                      </span>
                      <span>{trip.duration} days</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      className={
                        trip.status === 'completed' ? 'bg-green-100 text-green-700' :
                        trip.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-blue-50 text-blue-600'
                      }
                    >
                      {trip.status === 'completed' ? 'Completed' : 
                       trip.status === 'confirmed' ? 'Confirmed' : 'Planning'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CountriesModal 
        open={showCountriesModal} 
        onOpenChange={setShowCountriesModal}
        countries={visitedCountries}
        onViewPostcards={handleOpenPostcards}
      />
      
      <PostcardModal
        open={showPostcardsModal}
        onOpenChange={setShowPostcardsModal}
        country={selectedCountry}
      />

      <MasterPhotoGrid
        open={showMasterPhotoGrid}
        onOpenChange={setShowMasterPhotoGrid}
      />
    </div>
  );
}
