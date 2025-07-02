import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Expand, ImageOff, RotateCw } from "lucide-react";
import CachedImage from "@/components/CachedImage";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Country, Postcard } from "@shared/schema";

interface MasterPhotoGridProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CountryWithPostcards {
  country: Country;
  postcards: Postcard[];
}

export default function MasterPhotoGrid({ open, onOpenChange }: MasterPhotoGridProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: countries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const { data: allPostcards, isLoading } = useQuery<Postcard[]>({
    queryKey: ["/api/postcards"],
  });

  // Group postcards by country
  const countriesWithPostcards: CountryWithPostcards[] = countries?.map(country => ({
    country,
    postcards: allPostcards?.filter(postcard => postcard.countryId === country.id) || []
  })).filter(item => item.postcards.length > 0) || [];

  const totalPostcards = allPostcards?.length || 0;

  const rotateMutation = useMutation({
    mutationFn: async ({ postcardId, currentRotation }: { postcardId: number; currentRotation: number }) => {
      const newRotation = (currentRotation + 90) % 360;
      await apiRequest('POST', `/api/postcards/${postcardId}/rotate`, { rotation: newRotation });
      return newRotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/postcards"] });
      toast({
        title: "Image rotated",
        description: "Postcard has been rotated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Rotation error:", error);
      toast({
        title: "Rotation failed",
        description: error.message || "Failed to rotate postcard. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleViewFullImage = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const handleRotateImage = (postcardId: number, currentRotation: number = 0) => {
    rotateMutation.mutate({ postcardId, currentRotation });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold">Travel Photo Collection</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {totalPostcards} photos
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          {isLoading ? (
            <div className="text-center py-12">Loading your travel memories...</div>
          ) : countriesWithPostcards.length === 0 ? (
            <div className="text-center py-16">
              <ImageOff className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Photos Yet</h3>
              <p className="text-gray-500">Start adding postcards to your visited countries to build your collection!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {countriesWithPostcards.map(({ country, postcards }) => (
                <div key={country.id} className="space-y-4">
                  {/* Country Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-gray-900">{country.name}</h3>
                      <Badge 
                        className={
                          country.status === 'visited' 
                            ? 'bg-visited-light text-travel-green' 
                            : 'bg-upcoming-light text-yellow-700'
                        }
                      >
                        {country.status === 'visited' ? 'Visited' : 'Upcoming'}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {postcards.length} photo{postcards.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Photos Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {postcards.map((postcard) => (
                      <div key={postcard.id} className="group relative">
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                          <img
                            src={postcard.imageUrl || `/uploads/${postcard.filename}?v=${Date.now()}`}
                            alt={postcard.originalName || 'Travel photo'}
                            className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
                            style={{
                              transform: `rotate(${postcard.rotation || 0}deg)`
                            }}
                            crossOrigin="anonymous"
                            loading="lazy"
                            onLoad={() => {
                              console.log('Grid image loaded successfully for postcard:', postcard.id);
                            }}
                            onError={(e) => {
                              console.log('Grid image load error for postcard:', postcard.id);
                              console.log('Attempted URL:', postcard.imageUrl || `/uploads/${postcard.filename}`);
                              
                              // Try fallback URL if cloud URL fails
                              if (postcard.imageUrl && !e.currentTarget.src.includes('/uploads/')) {
                                console.log('Trying local fallback...');
                                e.currentTarget.src = `/uploads/${postcard.filename}?v=${Date.now()}`;
                                return;
                              }
                              
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('.error-placeholder')) {
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs error-placeholder';
                                errorDiv.textContent = postcard.originalName || 'Image not found';
                                parent.appendChild(errorDiv);
                              }
                            }}
                          />
                        </div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-opacity flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRotateImage(postcard.id, postcard.rotation || 0)}
                              disabled={rotateMutation.isPending}
                              title="Rotate image"
                            >
                              <RotateCw className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleViewFullImage(postcard.imageUrl || `/uploads/${postcard.filename}`)}
                              title="View full size"
                            >
                              <Expand className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Photo Name */}
                        <p className="mt-2 text-xs text-gray-600 truncate" title={postcard.originalName}>
                          {postcard.originalName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}