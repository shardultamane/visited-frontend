import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, Expand, Trash2, X, RotateCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CachedImage from "@/components/CachedImage";
import type { Country, Postcard } from "@shared/schema";

interface PostcardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: Country | null;
}

export default function PostcardModal({ open, onOpenChange, country }: PostcardModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: postcards = [], isLoading } = useQuery<Postcard[]>({
    queryKey: ["/api/countries", country?.id, "postcards"],
    enabled: !!country,
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      if (!country) return [];
      const response = await fetch(`/api/countries/${country.id}/postcards`);
      if (!response.ok) throw new Error('Failed to fetch postcards');
      const data: Postcard[] = await response.json();
      console.log('Fresh postcard data for', country.name, ':', data);
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!country) throw new Error("No country selected");
      
      const formData = new FormData();
      formData.append('postcard', file);
      
      const response = await fetch(`/api/countries/${country.id}/postcards`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Clear cache completely and force fresh data
      queryClient.removeQueries({ queryKey: ["/api/countries", country?.id, "postcards"] });
      queryClient.removeQueries({ queryKey: ["/api/postcards"] });
      queryClient.removeQueries({ queryKey: ["/api/stats"] });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/countries", country?.id, "postcards"] });
        queryClient.invalidateQueries({ queryKey: ["/api/postcards"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        queryClient.refetchQueries({ queryKey: ["/api/countries", country?.id, "postcards"] });
        queryClient.refetchQueries({ queryKey: ["/api/postcards"] });
      }, 100);
      toast({
        title: "Postcard uploaded!",
        description: "Your travel memory has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postcardId: number) => {
      return apiRequest("DELETE", `/api/postcards/${postcardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/countries", country?.id, "postcards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/postcards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Postcard deleted",
        description: "The postcard has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete postcard.",
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (postcards.length >= 5) {
      toast({
        title: "Maximum postcards reached",
        description: "You can only have 5 postcards per country.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePostcard = (postcardId: number) => {
    deleteMutation.mutate(postcardId);
  };

  const rotateMutation = useMutation({
    mutationFn: async ({ postcardId, currentRotation }: { postcardId: number; currentRotation: number }) => {
      const newRotation = (currentRotation + 90) % 360;
      await apiRequest('POST', `/api/postcards/${postcardId}/rotate`, { rotation: newRotation });
      return newRotation;
    },
    onSuccess: () => {
      // Invalidate queries to refresh the postcards
      queryClient.invalidateQueries({ queryKey: ["/api/countries", country?.id, "postcards"] });
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

  const handleRotateImage = (postcardId: number, currentRotation: number = 0) => {
    rotateMutation.mutate({ postcardId, currentRotation });
  };

  if (!country) {
    console.log('PostcardModal: No country provided, returning null');
    return null;
  }

  console.log('PostcardModal: Rendering modal for country:', country.name);
  console.log('PostcardModal: Postcards data:', postcards);
  console.log('PostcardModal: Postcards length:', postcards.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">{country.flag}</span>
            <span>{country.name} Postcards</span>
            <Badge variant="secondary">{postcards.length}/3</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-8">Loading postcards...</div>
          ) : postcards.length === 0 ? (
            /* Empty State - Large Upload Area */
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive ? "border-travel-blue bg-blue-50" : "border-gray-300 hover:border-travel-blue"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CloudUpload className="mx-auto text-6xl text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Add Your First Postcard</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start building your travel memory collection! Drag & drop your photos here or click to browse.
              </p>
              <Button size="lg" onClick={handleChooseFiles} disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? "Uploading..." : "Choose Photos"}
              </Button>
              <p className="text-xs text-gray-400 mt-4">Maximum 3 photos per country • JPG, PNG supported</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            /* Postcards Grid with Subtle Add Button */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(postcards as Postcard[]).slice(0, 3).map((postcard: Postcard) => (
                <div key={postcard.id} className="relative group">
                  <div className="w-full rounded-xl overflow-hidden">
                    <img
                      src={postcard.imageUrl || `/uploads/${postcard.filename}?v=${Date.now()}`}
                      alt={postcard.originalName || 'Postcard'}
                      className="w-full h-48 object-cover rounded-xl"
                      style={{
                        transform: `rotate(${postcard.rotation || 0}deg)`
                      }}
                      crossOrigin="anonymous"
                      loading="lazy"
                      onLoad={() => {
                        console.log('Image loaded successfully for postcard:', postcard.id);
                      }}
                      onError={(e) => {
                        console.log('Image load error for postcard:', postcard.id);
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
                          errorDiv.className = 'w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm error-placeholder';
                          errorDiv.textContent = postcard.originalName || 'Image not found';
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-xl transition-opacity flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap gap-1 justify-center">
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
                        onClick={() => window.open(postcard.imageUrl || `/uploads/${postcard.filename}`, '_blank')}
                        title="View full size"
                      >
                        <Expand className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePostcard(postcard.id)}
                        disabled={deleteMutation.isPending}
                        title="Delete postcard"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Subtle Add Button in Grid */}
              {postcards.length < 3 && (
                <div
                  className={`relative h-48 border-2 border-dashed rounded-xl transition-colors cursor-pointer group ${
                    dragActive ? "border-travel-blue bg-blue-50" : "border-gray-300 hover:border-travel-blue hover:bg-gray-50"
                  }`}
                  onClick={handleChooseFiles}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-travel-blue transition-colors">
                    <CloudUpload className="text-3xl mb-2" />
                    <span className="text-sm font-medium">Add Photo</span>
                    <span className="text-xs mt-1">Drag or click</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
