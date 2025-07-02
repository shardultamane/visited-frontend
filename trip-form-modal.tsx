import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Country } from "@shared/schema";

interface TripFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TripFormModal({ open, onOpenChange }: TripFormModalProps) {
  const [formData, setFormData] = useState({
    countryId: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "planning"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: countries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const createTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      const startDate = new Date(tripData.startDate);
      const endDate = new Date(tripData.endDate);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      return apiRequest("POST", "/api/trips", {
        ...tripData,
        countryId: parseInt(tripData.countryId),
        duration
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Trip added successfully!",
        description: "Your trip has been added to your travel log.",
      });
      onOpenChange(false);
      setFormData({
        countryId: "",
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "planning"
      });
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
    if (!formData.countryId || !formData.title || !formData.startDate || !formData.endDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createTripMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Trip</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="country">Country *</Label>
            <Select value={formData.countryId} onValueChange={(value) => setFormData({...formData, countryId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries?.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Trip Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Summer vacation in Japan"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of your trip..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Trip Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="confirmed">Confirmed/Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTripMutation.isPending}>
              {createTripMutation.isPending ? "Adding..." : "Add Trip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}