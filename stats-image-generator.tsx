import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";
import type { Country } from "@shared/schema";

interface Stats {
  visitedCount: number;
  upcomingCount: number;
  postcardsCount: number;
  totalCountries: number;
}

interface StatsImageGeneratorProps {
  stats: Stats;
  visitedCountries: Country[];
  onImageGenerated: (imageUrl: string) => void;
}

export default function StatsImageGenerator({ 
  stats, 
  visitedCountries, 
  onImageGenerated 
}: StatsImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateStatsImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Create clean background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);

    // Header background
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 800, 120);

    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('My Travel Journey', 400, 70);

    // Main content area
    const progressPercentage = Math.round((stats.visitedCount / stats.totalCountries) * 100);

    // World Explored Section - Top Center
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 72px Arial';
    ctx.fillText(`${progressPercentage}%`, 400, 200);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = '#4b5563';
    ctx.fillText('of the world explored', 400, 230);

    // Countries Visited Section
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(`${stats.visitedCount}`, 400, 290);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#4b5563';
    ctx.fillText(`countries visited out of ${stats.totalCountries}`, 400, 320);

    // Countries List Section
    if (visitedCountries.length > 0) {
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('Countries I\'ve Visited:', 400, 370);
      
      // Split countries into multiple lines for better readability
      const countryNames = visitedCountries.map(c => c.name);
      const maxPerLine = 4;
      let yPos = 400;
      
      for (let i = 0; i < countryNames.length; i += maxPerLine) {
        const line = countryNames.slice(i, i + maxPerLine).join(' • ');
        ctx.font = '18px Arial';
        ctx.fillStyle = '#374151';
        ctx.fillText(line, 400, yPos);
        yPos += 30;
        
        // Limit to 4 lines maximum
        if (yPos > 490) break;
      }
    }

    // Bottom branding section
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 520, 800, 80);
    
    // Branding line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 520);
    ctx.lineTo(600, 520);
    ctx.stroke();
    
    // "visited" branding - simple and clean
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    
    // Draw the whole word in one color for clean spacing
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText('visited', 400, 560);
    
    // Tagline
    ctx.font = '14px Arial';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Track your global adventures', 400, 585);

    // Convert to image
    const imageUrl = canvas.toDataURL('image/png');
    onImageGenerated(imageUrl);
  };

  const downloadImage = async () => {
    await generateStatsImage();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'my-travel-stats.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const shareWithFriends = async () => {
    await generateStatsImage();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const progressPercentage = Math.round((stats.visitedCount / stats.totalCountries) * 100);
    const visitedCountriesList = visitedCountries.slice(0, 5).map(c => c.name).join(', ');
    
    const message = `🌍 My Travel Journey with visited!

✈️ Countries Visited: ${stats.visitedCount}/${stats.totalCountries} (${progressPercentage}%)
📅 Upcoming Adventures: ${stats.upcomingCount}
📸 Travel Memories: ${stats.postcardsCount} photos
🗺️ Recent destinations: ${visitedCountriesList}

I've created a visual summary of my travels! Download the image and share it with this message.

Track your travels: ${window.location.origin}`;

    try {
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Check if we're on mobile and can use native sharing
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile && navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], 'travel-stats.png', { type: 'image/png' });
            
            // Check if files are supported
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'My Travel Journey',
                text: message,
                files: [file]
              });
              return;
            }
          } catch (shareError) {
            console.log('Native mobile share failed, trying clipboard');
          }
        }

        // Try clipboard API for desktop browsers
        if (navigator.clipboard && window.ClipboardItem && !isMobile) {
          try {
            const clipboardItem = new ClipboardItem({
              'image/png': blob
            });
            await navigator.clipboard.write([clipboardItem]);
            
            // Open WhatsApp Web with message
            const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(message + '\n\n📎 Image copied to clipboard - paste it in the chat (Ctrl+V)')}`;
            window.open(whatsappWebUrl, '_blank');
            
            alert('✅ Image copied to clipboard!\n\nWhatsApp Web is opening. Paste the image in your chat with Ctrl+V or Cmd+V');
            return;
          } catch (clipboardError) {
            console.log('Clipboard failed, using download method');
          }
        }

        // Fallback: Download image and open WhatsApp
        const link = document.createElement('a');
        link.download = 'my-travel-stats.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Add instruction about manual attachment
        const downloadMessage = message + '\n\n📎 Image downloaded! Attach the downloaded image to your WhatsApp message.';
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(downloadMessage)}`;
        window.open(whatsappUrl, '_blank');

      }, 'image/png', 0.9);
    } catch (error) {
      console.error('Share failed:', error);
      
      // Emergency fallback
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'my-travel-stats.png';
      link.href = dataUrl;
      link.click();
      
      alert('Image downloaded! Manually attach it to WhatsApp.');
    }
  };

  return (
    <div className="space-y-4">
      <canvas 
        ref={canvasRef} 
        className="hidden"
        width={800} 
        height={600}
      />
      
      <Button 
        onClick={shareWithFriends}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
      >
        <Share2 className="w-4 h-4" />
        Share with Friends
      </Button>
    </div>
  );
}