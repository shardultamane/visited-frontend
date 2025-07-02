import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Images } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Country, Postcard } from "@shared/schema";

interface CountriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countries: Country[];
  onViewPostcards: (country: Country) => void;
}

export default function CountriesModal({ 
  open, 
  onOpenChange, 
  countries, 
  onViewPostcards 
}: CountriesModalProps) {
  const { data: allPostcards = [] } = useQuery<Postcard[]>({
    queryKey: ["/api/postcards"],
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getCountryPostcards = (countryId: number) => {
    return allPostcards.filter(p => p.countryId === countryId).slice(0, 3);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Countries Visited ({countries.length})</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {countries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No countries visited yet. Start exploring the world!
            </div>
          ) : (
            countries.map((country) => {
              const countryPostcards = getCountryPostcards(country.id);
              return (
                <div
                  key={country.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-travel-green transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{country.name}</span>
                      <p className="text-sm text-gray-500">
                        Visited: {formatDate(country.visitedDate)}
                      </p>
                      {/* Postcard Thumbnails */}
                      {countryPostcards.length > 0 && (
                        <div className="flex items-center mt-2 space-x-1">
                          {countryPostcards.map((postcard, index) => (
                            <div
                              key={postcard.id}
                              className="w-8 h-8 rounded border border-gray-200 overflow-hidden bg-gray-100 relative"
                              style={{ marginLeft: index > 0 ? '-4px' : '0' }}
                              title={postcard.originalName}
                            >
                              <img
                                src={postcard.filename && postcard.filename.startsWith('http') ? postcard.filename : `/uploads/${postcard.filename || 'placeholder.jpg'}`}
                                alt={`Postcard from ${country.name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const parent = (e.target as HTMLImageElement).parentElement;
                                  if (parent) {
                                    parent.style.backgroundColor = `hsl(${(postcard.id * 40) % 360}, 60%, 70%)`;
                                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-xs font-semibold">${index + 1}</div>`;
                                  }
                                }}
                              />
                            </div>
                          ))}
                          {countryPostcards.length > 2 && (
                            <span className="text-xs text-gray-500 ml-1">
                              +{Math.max(0, allPostcards.filter(p => p.countryId === country.id).length - 3)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-visited-light text-travel-green">
                      Visited
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewPostcards(country)}
                      className="text-travel-blue hover:text-blue-700"
                    >
                      <Images className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
