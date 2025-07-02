import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Images, MapPin, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { forceRefreshAllData } from "@/lib/cacheUtils";
import type { Country } from "@shared/schema";

interface CountryActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: Country | null;
  onViewPostcards: (country: Country) => void;
}

export default function CountryActionsModal({ 
  open, 
  onOpenChange, 
  country, 
  onViewPostcards 
}: CountryActionsModalProps) {
  if (!country) return null;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markAsVisitedMutation = useMutation({
    mutationFn: async (countryId: number) => {
      return apiRequest("PATCH", `/api/countries/${countryId}`, {
        status: "visited",
        visitedDate: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      forceRefreshAllData();
      toast({
        title: "Country marked as visited!",
        description: `${country?.name} has been added to your visited countries.`,
      });
      onOpenChange(false);
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
      forceRefreshAllData();
      toast({
        title: "Country added to upcoming trips!",
        description: `${country?.name} has been added to your upcoming destinations.`,
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add country to upcoming trips.",
        variant: "destructive",
      });
    },
  });

  const unmarkAsVisitedMutation = useMutation({
    mutationFn: async (countryId: number) => {
      return apiRequest("PATCH", `/api/countries/${countryId}`, {
        status: "unvisited",
        visitedDate: null,
      });
    },
    onSuccess: () => {
      forceRefreshAllData();
      toast({
        title: "Country unmarked as visited",
        description: `${country?.name} has been removed from your visited countries.`,
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unmark country as visited.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsVisited = () => {
    if (country) {
      markAsVisitedMutation.mutate(country.id);
    }
  };

  const handleAddToUpcoming = () => {
    if (country) {
      addToUpcomingMutation.mutate(country.id);
    }
  };

  const handleUnmarkAsVisited = () => {
    if (country) {
      unmarkAsVisitedMutation.mutate(country.id);
    }
  };

  const handleViewPostcards = () => {
    if (country) {
      onViewPostcards(country);
      onOpenChange(false);
    }
  };

  if (!country) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>{country.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Status:</span>
            <Badge 
              className={
                country.status === 'visited' ? 'bg-green-100 text-green-700' :
                country.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-gray-100 text-gray-600'
              }
            >
              {country.status === 'visited' ? 'Visited' : 
               country.status === 'upcoming' ? 'Upcoming' : 'Unvisited'}
            </Badge>
          </div>

          <div className="space-y-3">
            {country.status !== 'visited' && (
              <Button 
                onClick={handleMarkAsVisited}
                disabled={markAsVisitedMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                {markAsVisitedMutation.isPending ? "Marking..." : "Mark as Visited"}
              </Button>
            )}

            {country.status === 'visited' && (
              <Button 
                onClick={handleUnmarkAsVisited}
                disabled={unmarkAsVisitedMutation.isPending}
                variant="outline"
                className="w-full border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                {unmarkAsVisitedMutation.isPending ? "Unmarking..." : "Unmark as Visited"}
              </Button>
            )}

            {country.status !== 'upcoming' && country.status !== 'visited' && (
              <Button 
                onClick={handleAddToUpcoming}
                disabled={addToUpcomingMutation.isPending}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {addToUpcomingMutation.isPending ? "Adding..." : "Add to Upcoming"}
              </Button>
            )}

            <Button 
              onClick={handleViewPostcards}
              variant="outline"
              className="w-full border-blue-200 hover:bg-blue-50"
            >
              <Images className="w-4 h-4 mr-2" />
              View/Upload Postcards
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}