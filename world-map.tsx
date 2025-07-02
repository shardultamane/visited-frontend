import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Country, Postcard } from "@shared/schema";

interface WorldMapProps {
  countries: Country[];
  onCountryClick: (country: Country) => void;
  onCountryDoubleClick?: (country: Country) => void;
  onPostcardClick?: (country: Country) => void;
  selectedCountry: Country | null;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function WorldMap({ countries, onCountryClick, onCountryDoubleClick, onPostcardClick, selectedCountry }: WorldMapProps) {
  
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [countryPolygons, setCountryPolygons] = useState<Map<string, any>>(new Map());
  const [postcardMarkers, setPostcardMarkers] = useState<Map<number, {marker: any, overlay: any}>>(new Map());
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showMobileCountryPicker, setShowMobileCountryPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  // Remove complex touch handling - let Google Maps handle clicks naturally

  const { data: allPostcards = [] } = useQuery<Postcard[]>({
    queryKey: ["/api/postcards"],
  });

  // Enhanced country coordinates for better mobile touch detection (renamed to avoid conflicts)
  const getCountryCoordinates = (countryCode: string): {lat: number, lng: number} => {
    const coords: Record<string, {lat: number, lng: number}> = {
      'US': { lat: 39.8283, lng: -98.5795 },
      'CA': { lat: 56.1304, lng: -106.3468 },
      'GB': { lat: 54.3781, lng: -3.4360 },
      'FR': { lat: 46.2276, lng: 2.2137 },
      'DE': { lat: 51.1657, lng: 10.4515 },
      'IT': { lat: 41.8719, lng: 12.5674 },
      'ES': { lat: 40.4637, lng: -3.7492 },
      'RU': { lat: 61.5240, lng: 105.3188 },
      'CN': { lat: 35.8617, lng: 104.1954 },
      'JP': { lat: 36.2048, lng: 138.2529 },
      'IN': { lat: 20.5937, lng: 78.9629 },
      'AU': { lat: -25.2744, lng: 133.7751 },
      'BR': { lat: -14.2350, lng: -51.9253 },
      'AR': { lat: -38.4161, lng: -63.6167 },
      'ZA': { lat: -30.5595, lng: 22.9375 },
      'EG': { lat: 26.8206, lng: 30.8025 },
      'NG': { lat: 9.0820, lng: 8.6753 },
      'KE': { lat: -0.0236, lng: 37.9062 },
      'TH': { lat: 13.7563, lng: 100.5018 },
      'SG': { lat: 1.3521, lng: 103.8198 },
      'MY': { lat: 4.2105, lng: 101.9758 },
      'ID': { lat: -0.7893, lng: 113.9213 },
      'PH': { lat: 12.8797, lng: 121.7740 },
      'VN': { lat: 14.0583, lng: 108.2772 },
      'MX': { lat: 23.6345, lng: -102.5528 },
      'CL': { lat: -35.6751, lng: -71.5430 },
      'PE': { lat: -9.1900, lng: -75.0152 },
      'CO': { lat: 4.5709, lng: -74.2973 },
      'VE': { lat: 6.4238, lng: -66.5897 },
      'TR': { lat: 38.9637, lng: 35.2433 },
      'SA': { lat: 23.8859, lng: 45.0792 },
      'IR': { lat: 32.4279, lng: 53.6880 },
      'IQ': { lat: 33.2232, lng: 43.6793 },
      'AF': { lat: 33.9391, lng: 67.7100 },
      'PK': { lat: 30.3753, lng: 69.3451 },
      'BD': { lat: 23.6850, lng: 90.3563 },
      'LK': { lat: 7.8731, lng: 80.7718 },
      'MM': { lat: 21.9162, lng: 95.9560 },
      'KH': { lat: 12.5657, lng: 104.9910 },
      'LA': { lat: 19.8563, lng: 102.4955 },
      'NP': { lat: 28.3949, lng: 84.1240 },
      'BT': { lat: 27.5142, lng: 90.4336 },
      'MN': { lat: 46.8625, lng: 103.8467 },
      'KZ': { lat: 48.0196, lng: 66.9237 },
      'UZ': { lat: 41.3775, lng: 64.5853 },
      'KG': { lat: 41.2044, lng: 74.7661 },
      'TJ': { lat: 38.8610, lng: 71.2761 },
      'TM': { lat: 38.9697, lng: 59.5563 },
      'GE': { lat: 42.3154, lng: 43.3569 },
      'AM': { lat: 40.0691, lng: 45.0382 },
      'AZ': { lat: 40.1431, lng: 47.5769 },
      'BY': { lat: 53.7098, lng: 27.9534 },
      'UA': { lat: 48.3794, lng: 31.1656 },
      'MD': { lat: 47.4116, lng: 28.3699 },
      'RO': { lat: 45.9432, lng: 24.9668 },
      'BG': { lat: 42.7339, lng: 25.4858 },
      'GR': { lat: 39.0742, lng: 21.8243 },
      'AL': { lat: 41.1533, lng: 20.1683 },
      'MK': { lat: 41.6086, lng: 21.7453 },
      'ME': { lat: 42.7087, lng: 19.3744 },
      'RS': { lat: 44.0165, lng: 21.0059 },
      'BA': { lat: 43.9159, lng: 17.6791 },
      'HR': { lat: 45.1000, lng: 15.2000 },
      'SI': { lat: 46.1512, lng: 14.9955 },
      'SK': { lat: 48.6690, lng: 19.6990 },
      'CZ': { lat: 49.8175, lng: 15.4730 },
      'PL': { lat: 51.9194, lng: 19.1451 },
      'LT': { lat: 55.1694, lng: 23.8813 },
      'LV': { lat: 56.8796, lng: 24.6032 },
      'EE': { lat: 58.5953, lng: 25.0136 },
      'FI': { lat: 61.9241, lng: 25.7482 },
      'SE': { lat: 60.1282, lng: 18.6435 },
      'NO': { lat: 60.4720, lng: 8.4689 },
      'DK': { lat: 56.2639, lng: 9.5018 },
      'NL': { lat: 52.1326, lng: 5.2913 },
      'BE': { lat: 50.5039, lng: 4.4699 },
      'LU': { lat: 49.8153, lng: 6.1296 },
      'CH': { lat: 46.8182, lng: 8.2275 },
      'AT': { lat: 47.5162, lng: 14.5501 },
      'HU': { lat: 47.1625, lng: 19.5033 },
      'PT': { lat: 39.3999, lng: -8.2245 },
      'IE': { lat: 53.4129, lng: -8.2439 },
      'IS': { lat: 64.9631, lng: -19.0208 },
      'MT': { lat: 35.9375, lng: 14.3754 },
      'CY': { lat: 35.1264, lng: 33.4299 },
      'MA': { lat: 31.7917, lng: -7.0926 },
      'DZ': { lat: 28.0339, lng: 1.6596 },
      'TN': { lat: 33.8869, lng: 9.5375 },
      'LY': { lat: 26.3351, lng: 17.2283 },
      'SD': { lat: 12.8628, lng: 30.2176 },
      'ET': { lat: 9.1450, lng: 40.4897 },
      'SO': { lat: 5.1521, lng: 46.1996 },
      'DJ': { lat: 11.8251, lng: 42.5903 },
      'ER': { lat: 15.1794, lng: 39.7823 },
      'SS': { lat: 6.8770, lng: 31.3070 },
      'CF': { lat: 6.6111, lng: 20.9394 },
      'TD': { lat: 15.4542, lng: 18.7322 },
      'NE': { lat: 17.6078, lng: 8.0817 },
      'ML': { lat: 17.5707, lng: -3.9962 },
      'BF': { lat: 12.2383, lng: -1.5616 },
      'CI': { lat: 7.5400, lng: -5.5471 },
      'GH': { lat: 7.9465, lng: -1.0232 },
      'TG': { lat: 8.6195, lng: 0.8248 },
      'BJ': { lat: 9.3077, lng: 2.3158 },
      'CM': { lat: 7.3697, lng: 12.3547 },
      'GQ': { lat: 1.6508, lng: 10.2679 },
      'GA': { lat: -0.8037, lng: 11.6094 },
      'CG': { lat: -0.2280, lng: 15.8277 },
      'CD': { lat: -4.0383, lng: 21.7587 },
      'AO': { lat: -11.2027, lng: 17.8739 },
      'ZM': { lat: -13.1339, lng: 27.8493 },
      'ZW': { lat: -19.0154, lng: 29.1549 },
      'BW': { lat: -22.3285, lng: 24.6849 },
      'NA': { lat: -22.9576, lng: 18.4904 },
      'SZ': { lat: -26.5225, lng: 31.4659 },
      'LS': { lat: -29.6100, lng: 28.2336 },
      'MW': { lat: -13.2543, lng: 34.3015 },
      'MZ': { lat: -18.6657, lng: 35.5296 },
      'TZ': { lat: -6.3690, lng: 34.8888 },
      'UG': { lat: 1.3733, lng: 32.2903 },
      'RW': { lat: -1.9403, lng: 29.8739 },
      'BI': { lat: -3.3731, lng: 29.9189 },
      'MG': { lat: -18.7669, lng: 46.8691 },
      'MU': { lat: -20.3484, lng: 57.5522 },
      'SC': { lat: -4.6796, lng: 55.4920 },
      'KM': { lat: -11.8750, lng: 43.8722 },
      'CV': { lat: 16.5388, lng: -24.0132 },
      'ST': { lat: 0.1864, lng: 6.6131 },
      'LR': { lat: 6.4281, lng: -9.4295 },
      'SL': { lat: 8.4606, lng: -11.7799 },
      'GN': { lat: 9.9456, lng: -9.6966 },
      'GW': { lat: 11.8037, lng: -15.1804 },
      'SN': { lat: 14.4974, lng: -14.4524 },
      'GM': { lat: 13.4432, lng: -15.3101 },
      'MR': { lat: 21.0079, lng: -10.9408 },
      'NZ': { lat: -40.9006, lng: 174.8860 },
      'FJ': { lat: -16.5780, lng: 179.4144 },
      'SB': { lat: -9.6457, lng: 160.1562 },
      'VU': { lat: -15.3767, lng: 166.9592 },
      'NC': { lat: -20.9043, lng: 165.6180 },
      'PG': { lat: -6.3149, lng: 143.9555 },
      'TO': { lat: -21.1789, lng: -175.1982 },
      'WS': { lat: -13.7590, lng: -172.1046 },
      'KI': { lat: -3.3704, lng: -168.7340 },
      'TV': { lat: -7.1095, lng: 177.6493 },
      'NR': { lat: -0.5228, lng: 166.9315 },
      'PW': { lat: 7.5150, lng: 134.5825 },
      'FM': { lat: 7.4256, lng: 150.5508 },
      'MH': { lat: 7.1315, lng: 171.1845 }
    };
    const result = coords[countryCode] || { lat: 0, lng: 0 };
    console.log(`Coordinates for ${countryCode}:`, result);
    return result;
  };

  const getCountryColor = (country: Country) => {
    switch (country.status) {
      case "visited":
        return "#22C55E"; // travel-green
      case "upcoming":
        return "#FCD34D"; // travel-yellow
      default:
        return "#E5E7EB"; // gray-200
    }
  };

  const getCountryOpacity = (country: Country) => {
    if (selectedCountry?.id === country.id) {
      return 0.9;
    }
    return 0.6;
  };

  // Comprehensive country name mapping for GeoJSON data
  const nameMapping: Record<string, string> = {
    // North America
    "United States of America": "US",
    "USA": "US",
    "Canada": "CA",
    "Mexico": "MX",
    "Guatemala": "GT",
    "El Salvador": "SV",
    "Honduras": "HN",
    "Nicaragua": "NI",
    "Costa Rica": "CR",
    "Panama": "PA",
    
    // South America
    "Brazil": "BR",
    "Argentina": "AR",
    "Chile": "CL",
    "Peru": "PE",
    "Colombia": "CO",
    "Venezuela": "VE",
    "Ecuador": "EC",
    "Bolivia": "BO",
    "Paraguay": "PY",
    "Uruguay": "UY",
    "Guyana": "GY",
    "Suriname": "SR",
    "French Guiana": "GF",
    
    // Europe
    "United Kingdom": "GB",
    "France": "FR",
    "Germany": "DE",
    "Italy": "IT",
    "Spain": "ES",
    "Portugal": "PT",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Switzerland": "CH",
    "Austria": "AT",
    "Norway": "NO",
    "Sweden": "SE",
    "Denmark": "DK",
    "Finland": "FI",
    "Iceland": "IS",
    "Ireland": "IE",
    "Poland": "PL",
    "Czech Republic": "CZ",
    "Slovakia": "SK",
    "Hungary": "HU",
    "Romania": "RO",
    "Bulgaria": "BG",
    "Croatia": "HR",
    "Slovenia": "SI",
    "Serbia": "RS",
    "Republic of Serbia": "RS",
    "Bosnia and Herzegovina": "BA",
    "Montenegro": "ME",
    "Albania": "AL",
    "Macedonia": "MK",
    "Greece": "GR",
    "Turkey": "TR",
    "Cyprus": "CY",
    "Malta": "MT",
    "Estonia": "EE",
    "Latvia": "LV",
    "Lithuania": "LT",
    "Belarus": "BY",
    "Ukraine": "UA",
    "Moldova": "MD",
    "Monaco": "MC",
    "Luxembourg": "LU",
    "Liechtenstein": "LI",
    "San Marino": "SM",
    "Vatican": "VA",
    "Andorra": "AD",
    
    // Asia
    "Russia": "RU",
    "China": "CN",
    "India": "IN",
    "Japan": "JP",
    "South Korea": "KR",
    "North Korea": "KP",
    "Thailand": "TH",
    "Vietnam": "VN",
    "Cambodia": "KH",
    "Laos": "LA",
    "Myanmar": "MM",
    "Malaysia": "MY",
    "Singapore": "SG",
    "Indonesia": "ID",
    "Philippines": "PH",
    "Brunei": "BN",
    "East Timor": "TL",
    "Mongolia": "MN",
    "Kazakhstan": "KZ",
    "Uzbekistan": "UZ",
    "Turkmenistan": "TM",
    "Tajikistan": "TJ",
    "Kyrgyzstan": "KG",
    "Afghanistan": "AF",
    "Pakistan": "PK",
    "Bangladesh": "BD",
    "Sri Lanka": "LK",
    "Maldives": "MV",
    "Nepal": "NP",
    "Bhutan": "BT",
    "Taiwan": "TW",
    "Hong Kong": "HK",
    "Macau": "MO",
    
    // Middle East
    "Iran": "IR",
    "Iraq": "IQ",
    "Syria": "SY",
    "Lebanon": "LB",
    "Jordan": "JO",
    "Israel": "IL",
    "Palestine": "PS",
    "West Bank": "PS",
    "Saudi Arabia": "SA",
    "Yemen": "YE",
    "Oman": "OM",
    "United Arab Emirates": "AE",
    "Qatar": "QA",
    "Bahrain": "BH",
    "Kuwait": "KW",
    "Georgia": "GE",
    "Armenia": "AM",
    "Azerbaijan": "AZ",
    
    // Africa
    "Egypt": "EG",
    "Libya": "LY",
    "Tunisia": "TN",
    "Algeria": "DZ",
    "Morocco": "MA",
    "Western Sahara": "EH",
    "Sudan": "SD",
    "South Sudan": "SS",
    "Ethiopia": "ET",
    "Eritrea": "ER",
    "Djibouti": "DJ",
    "Somalia": "SO",
    "Somaliland": "SO",
    "Kenya": "KE",
    "Uganda": "UG",
    "Tanzania": "TZ",
    "United Republic of Tanzania": "TZ",
    "Rwanda": "RW",
    "Burundi": "BI",
    "Democratic Republic of the Congo": "CD",
    "Republic of the Congo": "CG",
    "Central African Republic": "CF",
    "Chad": "TD",
    "Cameroon": "CM",
    "Nigeria": "NG",
    "Niger": "NE",
    "Mali": "ML",
    "Burkina Faso": "BF",
    "Ivory Coast": "CI",
    "Ghana": "GH",
    "Togo": "TG",
    "Benin": "BJ",
    "Senegal": "SN",
    "Gambia": "GM",
    "Guinea-Bissau": "GW",
    "Guinea": "GN",
    "Sierra Leone": "SL",
    "Liberia": "LR",
    "Mauritania": "MR",
    "Cape Verde": "CV",
    "Madagascar": "MG",
    "Mauritius": "MU",
    "Seychelles": "SC",
    "Comoros": "KM",
    "Mayotte": "YT",
    "Réunion": "RE",
    "South Africa": "ZA",
    "Lesotho": "LS",
    "Swaziland": "SZ",
    "Botswana": "BW",
    "Namibia": "NA",
    "Angola": "AO",
    "Zambia": "ZM",
    "Zimbabwe": "ZW",
    "Malawi": "MW",
    "Mozambique": "MZ",
    "Gabon": "GA",
    "Equatorial Guinea": "GQ",
    "São Tomé and Príncipe": "ST",
    
    // Oceania
    "Australia": "AU",
    "New Zealand": "NZ",
    "Fiji": "FJ",
    "Papua New Guinea": "PG",
    "Solomon Islands": "SB",
    "Vanuatu": "VU",
    "New Caledonia": "NC",
    "French Polynesia": "PF",
    "Samoa": "WS",
    "Tonga": "TO",
    "Kiribati": "KI",
    "Tuvalu": "TV",
    "Nauru": "NR",
    "Palau": "PW",
    "Marshall Islands": "MH",
    "Micronesia": "FM",
    "Cook Islands": "CK",
    "Niue": "NU",
    
    // Caribbean
    "Cuba": "CU",
    "Jamaica": "JM",
    "Haiti": "HT",
    "Dominican Republic": "DO",
    "Puerto Rico": "PR",
    "Trinidad and Tobago": "TT",
    "Barbados": "BB",
    "Saint Lucia": "LC",
    "Grenada": "GD",
    "Saint Vincent and the Grenadines": "VC",
    "Antigua and Barbuda": "AG",
    "Dominica": "DM",
    "Saint Kitts and Nevis": "KN",
    "Bahamas": "BS",
    "Belize": "BZ",
    "Antarctica": "AQ"
  };

  // Load Google Maps API with error handling
  useEffect(() => {
    const loadGoogleMaps = () => {
      console.log('🗺️ Attempting to load Google Maps...');
      
      if (window.google && window.google.maps && window.google.maps.Map) {
        console.log('✅ Google Maps already loaded');
        setIsGoogleMapsLoaded(true);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      console.log('🔑 API Key status:', apiKey ? 'Present' : 'Missing');
      
      // If no API key or invalid key, don't attempt to load Google Maps
      if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.error('❌ Google Maps API key not configured');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=initMap&loading=async`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          console.log('✅ Google Maps API loaded successfully');
          setIsGoogleMapsLoaded(true);
        } else {
          console.error('Google Maps API loaded but missing required objects');
          setIsGoogleMapsLoaded(false);
        }
      };
      
      // Handle script loading errors
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps API');
        setIsGoogleMapsLoaded(false);
      };
      
      console.log('📡 Loading Google Maps script...');
      document.head.appendChild(script);
    };

    setTimeout(loadGoogleMaps, 100);
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current) {
      console.log('🔄 Waiting for Google Maps...', { isGoogleMapsLoaded, hasMapRef: !!mapRef.current });
      return;
    }

    console.log('🗺️ Initializing Google Maps instance...');

    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      console.error('Google Maps API not properly loaded');
      return;
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 2,
      center: { lat: 20, lng: 0 },
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      disableDoubleClickZoom: true,
      clickableIcons: false,

      styles: [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#93C5FD" }]
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#F8F9FA" }]
        },
        {
          featureType: "administrative.country",
          elementType: "geometry.fill",
          stylers: [{ color: "#E5E7EB" }]
        },
        {
          featureType: "administrative.country",
          elementType: "geometry.stroke",
          stylers: [{ color: "#FFFFFF", weight: 1 }]
        }
      ]
    });

    console.log('✅ Map instance created successfully');
    
    // CRITICAL: Ensure NO map-level click listeners exist
    console.log('🚫 Ensuring no map-level click listeners...');
    
    setMap(mapInstance);
  }, [isGoogleMapsLoaded]);

  // Country coordinates mapping (simplified for major countries)
  const getCountryBounds = (countryCode: string) => {
    const coordinates: Record<string, { lat: number; lng: number; bounds?: any }> = {
      "US": { lat: 39.8283, lng: -98.5795 },
      "CA": { lat: 56.1304, lng: -106.3468 },
      "MX": { lat: 23.6345, lng: -102.5528 },
      "FR": { lat: 46.6034, lng: 1.8883 },
      "DE": { lat: 51.1657, lng: 10.4515 },
      "IT": { lat: 41.8719, lng: 12.5674 },
      "ES": { lat: 40.4637, lng: -3.7492 },
      "GB": { lat: 55.3781, lng: -3.4360 },
      "RU": { lat: 61.5240, lng: 105.3188 },
      "CN": { lat: 35.8617, lng: 104.1954 },
      "JP": { lat: 36.2048, lng: 138.2529 },
      "IN": { lat: 20.5937, lng: 78.9629 },
      "BR": { lat: -14.2350, lng: -51.9253 },
      "AU": { lat: -25.2744, lng: 133.7751 },
      "ZA": { lat: -30.5595, lng: 22.9375 },
      "EG": { lat: 26.0975, lng: 31.2357 },
      "NG": { lat: 9.0820, lng: 8.6753 },
      "AR": { lat: -38.4161, lng: -63.6167 },
      "SA": { lat: 23.8859, lng: 45.0792 },
      "TR": { lat: 38.9637, lng: 35.2433 },
      "ID": { lat: -0.7893, lng: 113.9213 },
      "TH": { lat: 15.8700, lng: 100.9925 },
      "PH": { lat: 12.8797, lng: 121.7740 },
      "VN": { lat: 14.0583, lng: 108.2772 },
      "MY": { lat: 4.2105, lng: 101.9758 },
      "SG": { lat: 1.3521, lng: 103.8198 },
      "KR": { lat: 35.9078, lng: 127.7669 },
      "NZ": { lat: -40.9006, lng: 174.8860 },
      "IS": { lat: 64.9631, lng: -19.0208 },
      "NO": { lat: 60.4720, lng: 8.4689 },
      "SE": { lat: 60.1282, lng: 18.6435 },
      "DK": { lat: 56.2639, lng: 9.5018 },
      "FI": { lat: 61.9241, lng: 25.7482 },
      "PL": { lat: 51.9194, lng: 19.1451 },
      "NL": { lat: 52.1326, lng: 5.2913 },
      "BE": { lat: 50.5039, lng: 4.4699 },
      "CH": { lat: 46.8182, lng: 8.2275 },
      "AT": { lat: 47.5162, lng: 14.5501 },
      "CZ": { lat: 49.8175, lng: 15.4730 },
      "HU": { lat: 47.1625, lng: 19.5033 },
      "HR": { lat: 45.1000, lng: 15.2000 },
      "GR": { lat: 39.0742, lng: 21.8243 },
      "PT": { lat: 39.3999, lng: -8.2245 },
      "IL": { lat: 31.0461, lng: 34.8516 },
      "JO": { lat: 30.5852, lng: 36.2384 },
      "AE": { lat: 23.4241, lng: 53.8478 },
      "MA": { lat: 31.7917, lng: -7.0926 },
      "KE": { lat: -0.0236, lng: 37.9062 },
      "HK": { lat: 22.3193, lng: 114.1694 },
      "MC": { lat: 43.7384, lng: 7.4246 }
    };
    
    return coordinates[countryCode] || { lat: 0, lng: 0 };
  };

  // Load GeoJSON country boundaries and style them based on visit status
  useEffect(() => {
    if (!map || !countries.length) {
      console.log('Waiting for map and countries...', { hasMap: !!map, countriesCount: countries.length });
      return;
    }

    console.log('Loading GeoJSON data...');

    // Create a status lookup by country code
    const statusByCode: Record<string, string> = {};
    countries.forEach(country => {
      statusByCode[country.code] = country.status;
    });

    // Load a different GeoJSON source with better ISO code properties
    const geoJsonUrl = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';
    
    map.data.loadGeoJson(geoJsonUrl, null, (features: any) => {
      console.log('GeoJSON loaded successfully. Features:', features.length);
      
      // Debug: Check available properties
      if (features && features.length > 0) {
        setTimeout(() => {
          map.data.forEach((feature: any) => {
            try {
              const allProps = {
                name: feature.getProperty('name'),
                NAME: feature.getProperty('NAME'),
                id: feature.getProperty('id'),
                iso_a2: feature.getProperty('iso_a2'),
                ISO_A2: feature.getProperty('ISO_A2'),
                iso_a3: feature.getProperty('iso_a3'),
                ISO_A3: feature.getProperty('ISO_A3')
              };
              console.log('Sample feature properties:', allProps);
              return; // Just check first one
            } catch (e) {
              console.log('Error accessing feature properties:', e);
            }
          });
        }, 100);
      }
    });

    // Create status lookup by country names and codes
    const statusByName: Record<string, string> = {};
    
    countries.forEach(country => {
      statusByName[country.code] = country.status;
      // Also map by country name variations
      Object.entries(nameMapping).forEach(([geoName, code]) => {
        if (code === country.code) {
          statusByName[geoName] = country.status;
        }
      });
    });

    // Style countries based on visit status
    map.data.setStyle((feature: any) => {
      const name = feature.getProperty('name');
      
      // Try multiple ways to find the country status
      let status = statusByName[name] || 'unvisited';
      
      // Try with mapped code
      const mappedCode = nameMapping[name];
      if (mappedCode && statusByCode[mappedCode]) {
        status = statusByCode[mappedCode];
      }
      
      // Direct lookup by code
      const countryMatch = countries.find(c => c.code === mappedCode || c.name === name);
      if (countryMatch) {
        status = countryMatch.status;
      }
      
      // Debug specific countries
      if (name === 'Indonesia' || name === 'France' || name === 'India' || name === 'Canada') {
        console.log(`Country Debug - ${name}:`, {
          mappedCode,
          statusFromName: statusByName[name],
          statusFromCode: statusByCode[mappedCode],
          countryMatch: countryMatch?.name,
          finalStatus: status
        });
      }
      
      const colors = {
        visited: '#22C55E',     // green
        upcoming: '#FCD34D',    // yellow  
        unvisited: '#F3F4F6'    // light gray
      };

      const isSelected = selectedCountry && countryMatch?.id === selectedCountry.id;

      return {
        fillColor: colors[status as keyof typeof colors],
        fillOpacity: status === 'unvisited' ? 0.2 : 0.6,
        strokeColor: isSelected ? '#000000' : '#FFFFFF',
        strokeWeight: isSelected ? 4 : 0.5,
        strokeOpacity: isSelected ? 1.0 : 0.8,
        clickable: true
      };
    });





    // Simplified mobile handling - use Google Maps native events
    let lastClickTime = 0;
    
    // Remove the old touch handler since we're using direct click handling
    
    // Safer event handlers with error handling
    map.data.addListener('click', (event: google.maps.Data.MouseEvent) => {
      try {
        if (event.domEvent) {
          event.domEvent.stopPropagation();
        }
        
        if (!event.feature || !onCountryClick) {
          return;
        }
        
        const feature = event.feature;
        const geoJsonName = feature.getProperty('name') as string;
        
        if (!geoJsonName || !nameMapping[geoJsonName]) {
          return;
        }
        
        const mappedCode = nameMapping[geoJsonName];
        const country = countries.find(c => c.code === mappedCode);
        
        if (country) {
          console.log('Country clicked:', country.name);
          onCountryClick(country);
        }
      } catch (error) {
        console.error('Error in map click handler:', error);
      }
    });

    if (onCountryDoubleClick) {
      map.data.addListener('dblclick', (event: any) => {
        try {
          if (event.domEvent) {
            event.domEvent.stopPropagation();
          }
          
          if (!event.feature) return;
          
          const feature = event.feature;
          const geoJsonName = feature.getProperty('name');
          
          if (!geoJsonName || !nameMapping[geoJsonName]) {
            return;
          }
          
          const mappedCode = nameMapping[geoJsonName];
          const country = countries.find(c => c.code === mappedCode);
          
          if (country) {
            console.log('Country double-clicked:', country.name);
            onCountryDoubleClick(country);
          }
        } catch (error) {
          console.error('Error in map double-click handler:', error);
        }
      });
    }

    // Safe hover effects
    map.data.addListener('mouseover', (event: any) => {
      try {
        if (event.feature) {
          map.data.overrideStyle(event.feature, {
            fillOpacity: 0.8,
            strokeWeight: 2
          });
        }
      } catch (error) {
        console.error('Error in mouseover handler:', error);
      }
    });

    map.data.addListener('mouseout', (event: any) => {
      try {
        if (event.feature) {
          map.data.revertStyle(event.feature);
        }
      } catch (error) {
        console.error('Error in mouseout handler:', error);
      }
    });

    // Add postcard count markers
    addPostcardMarkers();
  }, [map, countries, selectedCountry, onCountryClick, allPostcards]);

  // Refresh map colors when countries data changes
  useEffect(() => {
    if (!map || !countries.length) return;

    console.log('Refreshing map colors for', countries.length, 'countries');

    // Build status mapping
    const statusByName: Record<string, string> = {};
    
    countries.forEach(country => {
      statusByName[country.code] = country.status;
      // Debug China and Egypt specifically
      if (country.code === 'CN' || country.code === 'EG') {
        console.log(`Country ${country.name} (${country.code}): status = ${country.status}`);
      }
      // Also map by country name variations
      Object.entries(nameMapping).forEach(([geoName, code]) => {
        if (code === country.code) {
          statusByName[geoName] = country.status;
          if (geoName === 'China' || geoName === 'Egypt') {
            console.log(`Mapped ${geoName} -> ${code}: status = ${country.status}`);
          }
        }
      });
    });

    console.log('Final statusByName mapping for China/Egypt:', {
      'China': statusByName['China'],
      'Egypt': statusByName['Egypt'],
      'CN': statusByName['CN'],
      'EG': statusByName['EG']
    });

    // Re-apply styles to all features
    map.data.setStyle((feature: any) => {
      const name = feature.getProperty('name');
      const status = statusByName[name] || 'unvisited';
      
      // Debug specific countries
      if (name === 'China' || name === 'Egypt') {
        console.log(`Styling ${name}: status=${status}, statusByName:`, statusByName);
      }
      
      const colors = {
        visited: '#22C55E',     // green
        upcoming: '#FCD34D',    // yellow  
        unvisited: '#F3F4F6'    // light gray
      };

      const mappedCode = nameMapping[name] || name;
      const countryMatch = countries.find(c => c.code === mappedCode);
      const isSelected = selectedCountry && countryMatch?.id === selectedCountry.id;

      // Debug selection for any selected country
      if (isSelected) {
        console.log('🖤 REFRESH - APPLYING BLACK OUTLINE to:', name, 'selectedCountry:', selectedCountry.name);
      }

      return {
        fillColor: colors[status as keyof typeof colors],
        fillOpacity: status === 'unvisited' ? 0.2 : 0.6,
        strokeColor: isSelected ? '#000000' : '#FFFFFF',
        strokeWeight: isSelected ? 4 : 0.5,
        strokeOpacity: isSelected ? 1.0 : 0.8,
        clickable: true
      };
    });
  }, [map, countries, selectedCountry]);

  const addPostcardMarkers = () => {
    if (!map || !allPostcards) return;

    // Clear existing markers
    postcardMarkers.forEach(item => {
      if (item.marker) item.marker.setMap(null);
      if (item.overlay) item.overlay.setMap(null);
    });
    setPostcardMarkers(new Map());

    // Group postcards by country
    const postcardsByCountry = new Map<number, Postcard[]>();
    allPostcards.forEach(postcard => {
      const existing = postcardsByCountry.get(postcard.countryId) || [];
      postcardsByCountry.set(postcard.countryId, [...existing, postcard]);
    });

    // Add postcard image thumbnails for countries with postcards
    countries.forEach(country => {
      const countryPostcards = postcardsByCountry.get(country.id);
      if (countryPostcards && countryPostcards.length > 0) {
        const countryCoords = getCountryCenter(country.code);
        if (countryCoords) {
          // Show first postcard as main thumbnail
          const mainPostcard = countryPostcards[0];
          
          // Create custom HTML marker with postcard image
          const postcardThumbnail = document.createElement('div');
          postcardThumbnail.setAttribute('data-postcard-thumbnail', country.id.toString());
          postcardThumbnail.style.cssText = `
            width: 48px;
            height: 48px;
            border: 3px solid #10b981;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            background: white;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            z-index: 1000;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          `;

          // Create image element
          const img = document.createElement('img');
          img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          `;
          img.src = mainPostcard.imageUrl || `/uploads/${mainPostcard.filename || 'placeholder.jpg'}`;
          img.alt = mainPostcard.originalName || 'Postcard';
          
          // Apply rotation if set
          if (mainPostcard.rotation) {
            img.style.transform = `rotate(${mainPostcard.rotation}deg)`;
          }
          
          // Fallback for broken images - try local path first, then show country flag
          img.onerror = () => {
            if (mainPostcard.imageUrl && !img.src.includes('/uploads/')) {
              console.log('Cloud image failed, trying local fallback for:', mainPostcard.filename);
              img.src = `/uploads/${mainPostcard.filename}`;
            } else {
              img.style.display = 'none';
              postcardThumbnail.style.background = '#10b981';
              postcardThumbnail.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px; font-weight: bold;">${country.flag || countryPostcards.length}</div>`;
            }
          };

          postcardThumbnail.appendChild(img);

          // Add count badge if multiple postcards
          if (countryPostcards.length > 1) {
            const countBadge = document.createElement('div');
            countBadge.style.cssText = `
              position: absolute;
              top: -8px;
              right: -8px;
              background: #3B82F6;
              color: white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              border: 2px solid white;
            `;
            countBadge.textContent = countryPostcards.length.toString();
            postcardThumbnail.appendChild(countBadge);
          }

          // Create Google Maps marker with custom HTML
          const marker = new window.google.maps.Marker({
            position: countryCoords,
            map: map,
            title: `${country.name}: ${countryPostcards.length} postcard${countryPostcards.length > 1 ? 's' : ''}`,
            zIndex: 1000
          });

          // Create overlay to position HTML element
          const overlay = new window.google.maps.OverlayView();
          overlay.onAdd = function() {
            const panes = this.getPanes();
            panes.overlayMouseTarget.appendChild(postcardThumbnail);
          };

          overlay.draw = function() {
            const projection = this.getProjection();
            const position = projection.fromLatLngToDivPixel(countryCoords);
            postcardThumbnail.style.left = (position.x - 20) + 'px';
            postcardThumbnail.style.top = (position.y - 20) + 'px';
            postcardThumbnail.style.position = 'absolute';
          };

          overlay.onRemove = function() {
            if (postcardThumbnail.parentNode) {
              postcardThumbnail.parentNode.removeChild(postcardThumbnail);
            }
          };

          overlay.setMap(map);

          // Add hover effects
          postcardThumbnail.addEventListener('mouseenter', () => {
            postcardThumbnail.style.transform = 'scale(1.15)';
            postcardThumbnail.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
          });
          
          postcardThumbnail.addEventListener('mouseleave', () => {
            postcardThumbnail.style.transform = 'scale(1)';
            postcardThumbnail.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
          });

          // Add click handler for postcard thumbnails
          postcardThumbnail.onclick = (e) => {
            e.stopPropagation(); // Prevent event bubbling to map
            console.log('Postcard thumbnail clicked for country:', country.name);
            try {
              if (onPostcardClick) {
                onPostcardClick(country);
              } else {
                onCountryClick(country);
              }
            } catch (error) {
              console.error('Error handling postcard click:', error);
            }
          };

          setPostcardMarkers(prev => new Map(prev.set(country.id, { marker, overlay })));
        }
      }
    });
  };

  const getCountryCenter = (countryCode: string): {lat: number, lng: number} | null => {
    const coords: Record<string, {lat: number, lng: number}> = {
      'TH': { lat: 13.7563, lng: 100.5018 }, // Thailand - Bangkok
      'FR': { lat: 46.2276, lng: 2.2137 },   // France - Center
      'GB': { lat: 54.3781, lng: -3.4360 },  // UK - Center
      'IN': { lat: 20.5937, lng: 78.9629 },  // India - Center
      'SG': { lat: 1.3521, lng: 103.8198 },  // Singapore
      'US': { lat: 39.8283, lng: -98.5795 }, // USA - Center
      'IT': { lat: 41.8719, lng: 12.5674 },  // Italy - Rome
      'CA': { lat: 56.1304, lng: -106.3468 },// Canada - Center
      'MY': { lat: 4.2105, lng: 101.9758 },  // Malaysia
      'ID': { lat: -0.7893, lng: 113.9213 }, // Indonesia
      'HK': { lat: 22.3193, lng: 114.1694 }, // Hong Kong
      'MC': { lat: 43.7384, lng: 7.4246 }    // Monaco
    };
    return coords[countryCode] || null;
  };

  // Fallback SVG world map with actual geographical shapes
  if (!isGoogleMapsLoaded) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl p-4">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          style={{ minHeight: "400px" }}
        >
          {/* Ocean background */}
          <rect x="0" y="0" width="1000" height="500" fill="#3B82F6" rx="8" />
          
          {/* Continents with realistic shapes */}
          
          {/* North America */}
          <path d="M50,150 L200,120 L250,140 L280,180 L270,220 L240,250 L200,280 L150,290 L100,270 L70,240 L50,200 Z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1"/>
          
          {/* South America */}
          <path d="M220,300 L280,290 L300,320 L310,380 L300,450 L270,480 L240,470 L220,440 L210,380 L220,340 Z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1"/>
          
          {/* Europe */}
          <path d="M450,150 L520,140 L550,160 L560,200 L540,220 L500,230 L460,220 L440,190 Z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1"/>
          
          {/* Africa */}
          <path d="M480,240 L550,230 L580,250 L590,300 L580,380 L550,420 L520,430 L490,420 L470,380 L460,320 L470,280 Z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1"/>
          
          {/* Asia */}
          <path d="M560,120 L780,100 L850,120 L880,160 L870,200 L850,240 L800,250 L750,240 L700,220 L650,200 L600,180 L570,150 Z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1"/>
          
          {/* Russia (spanning continents) */}
          <path d="M520,100 L800,80 L850,90 L880,110 L870,150 L800,160 L700,150 L600,140 L550,130 Z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1"/>
          
          {/* Australia */}
          <path d="M750,350 L850,340 L880,360 L870,390 L840,400 L780,390 L750,370 Z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1"/>
          
          {/* Antarctica */}
          <path d="M100,450 L900,450 L900,480 L100,480 Z" fill="#F8FAFC" stroke="#E5E7EB" strokeWidth="1"/>
          
          {/* Country shape overlays */}
          {countries.map((country) => {
            const coords = getCountryBounds(country.code);
            if (!coords.lat || !coords.lng) return null;
            
            // Convert lat/lng to SVG coordinates (simplified projection)
            const x = (coords.lng + 180) * (1000 / 360);
            const y = (90 - coords.lat) * (500 / 180);
            
            // Get country-specific polygon shapes
            const getCountryPolygon = (code: string, centerX: number, centerY: number) => {
              const polygons: Record<string, string> = {
                "US": `${centerX-50},${centerY-30} ${centerX+50},${centerY-30} ${centerX+60},${centerY-10} ${centerX+50},${centerY+20} ${centerX+30},${centerY+30} ${centerX-20},${centerY+35} ${centerX-50},${centerY+20} ${centerX-60},${centerY} ${centerX-50},${centerY-20}`,
                "CA": `${centerX-60},${centerY-40} ${centerX+40},${centerY-45} ${centerX+50},${centerY-20} ${centerX+30},${centerY-10} ${centerX-10},${centerY-5} ${centerX-40},${centerY-10} ${centerX-65},${centerY-25}`,
                "GB": `${centerX-15},${centerY-20} ${centerX+10},${centerY-25} ${centerX+15},${centerY-10} ${centerX+12},${centerY+15} ${centerX-5},${centerY+20} ${centerX-18},${centerY+10} ${centerX-20},${centerY-5}`,
                "FR": `${centerX-20},${centerY-25} ${centerX+15},${centerY-30} ${centerX+25},${centerY-15} ${centerX+20},${centerY+10} ${centerX+10},${centerY+25} ${centerX-10},${centerY+30} ${centerX-25},${centerY+15} ${centerX-30},${centerY-5}`,
                "DE": `${centerX-15},${centerY-30} ${centerX+20},${centerY-35} ${centerX+25},${centerY-10} ${centerX+20},${centerY+20} ${centerX},${centerY+30} ${centerX-20},${centerY+25} ${centerX-25},${centerY}`,
                "IT": `${centerX-10},${centerY-35} ${centerX+15},${centerY-30} ${centerX+20},${centerY-5} ${centerX+15},${centerY+20} ${centerX+5},${centerY+40} ${centerX-5},${centerY+45} ${centerX-15},${centerY+35} ${centerX-18},${centerY+10} ${centerX-15},${centerY-15}`,
                "IN": `${centerX-25},${centerY-35} ${centerX+25},${centerY-40} ${centerX+35},${centerY-20} ${centerX+30},${centerY+25} ${centerX+15},${centerY+40} ${centerX-15},${centerY+35} ${centerX-30},${centerY+20} ${centerX-35},${centerY-10}`,
                "CN": `${centerX-40},${centerY-35} ${centerX+35},${centerY-40} ${centerX+45},${centerY-20} ${centerX+40},${centerY+15} ${centerX+20},${centerY+30} ${centerX-10},${centerY+35} ${centerX-35},${centerY+25} ${centerX-45},${centerY-5}`,
                "RU": `${centerX-70},${centerY-40} ${centerX+60},${centerY-45} ${centerX+70},${centerY-25} ${centerX+65},${centerY+10} ${centerX+40},${centerY+25} ${centerX-20},${centerY+30} ${centerX-60},${centerY+20} ${centerX-75},${centerY-10}`,
                "BR": `${centerX-25},${centerY-20} ${centerX+20},${centerY-25} ${centerX+30},${centerY+10} ${centerX+25},${centerY+40} ${centerX+10},${centerY+50} ${centerX-15},${centerY+45} ${centerX-30},${centerY+30} ${centerX-35},${centerY}`,
                "AU": `${centerX-35},${centerY-20} ${centerX+35},${centerY-25} ${centerX+40},${centerY-5} ${centerX+35},${centerY+20} ${centerX+15},${centerY+30} ${centerX-15},${centerY+25} ${centerX-40},${centerY+15} ${centerX-40},${centerY-5}`,
                "TH": `${centerX-10},${centerY-25} ${centerX+15},${centerY-30} ${centerX+20},${centerY-10} ${centerX+15},${centerY+15} ${centerX+5},${centerY+25} ${centerX-10},${centerY+20} ${centerX-15},${centerY-5}`,
                "ID": `${centerX-30},${centerY-15} ${centerX+30},${centerY-20} ${centerX+35},${centerY+5} ${centerX+25},${centerY+20} ${centerX-10},${centerY+25} ${centerX-35},${centerY+15} ${centerX-35},${centerY-5}`,
                "MY": `${centerX-20},${centerY-15} ${centerX+20},${centerY-20} ${centerX+25},${centerY-5} ${centerX+20},${centerY+10} ${centerX-5},${centerY+15} ${centerX-25},${centerY+10} ${centerX-25},${centerY-5}`,
                "SG": `${centerX-5},${centerY-5} ${centerX+5},${centerY-5} ${centerX+5},${centerY+5} ${centerX-5},${centerY+5}`,
                "HK": `${centerX-5},${centerY-8} ${centerX+5},${centerY-8} ${centerX+5},${centerY+8} ${centerX-5},${centerY+8}`,
                "MC": `${centerX-3},${centerY-3} ${centerX+3},${centerY-3} ${centerX+3},${centerY+3} ${centerX-3},${centerY+3}`,
                "JP": `${centerX-15},${centerY-30} ${centerX+10},${centerY-35} ${centerX+15},${centerY-15} ${centerX+10},${centerY+20} ${centerX-5},${centerY+30} ${centerX-20},${centerY+25} ${centerX-20},${centerY-10}`
              };
              
              return polygons[code] || `${centerX-8},${centerY-8} ${centerX+8},${centerY-8} ${centerX+8},${centerY+8} ${centerX-8},${centerY+8}`;
            };
            
            return (
              <g key={country.id}>
                <polygon
                  points={getCountryPolygon(country.code, x, y)}
                  fill={getCountryColor(country)}
                  fillOpacity={getCountryOpacity(country)}
                  stroke={selectedCountry?.id === country.id ? "#1F2937" : "#FFFFFF"}
                  strokeWidth={selectedCountry?.id === country.id ? 2 : 0.5}
                  className="cursor-pointer hover:fill-opacity-80 transition-all duration-200"
                  onClick={() => onCountryClick(country)}
                >
                  <title>{country.name} - {country.status}</title>
                </polygon>
                
                {/* Country name labels */}
                <text
                  x={x}
                  y={y + 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-xs font-bold pointer-events-none select-none"
                  style={{ 
                    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                    fontSize: country.code === "RU" ? "14px" : country.code === "CN" ? "12px" : country.code === "US" ? "12px" : country.code === "CA" ? "11px" : "10px"
                  }}
                >
                  {country.name}
                </text>
              </g>
            );
          })}
          
          {/* Continent labels */}
          <text x="150" y="400" textAnchor="middle" className="fill-blue-800 text-sm font-bold opacity-40 pointer-events-none">NORTH AMERICA</text>
          <text x="260" y="450" textAnchor="middle" className="fill-blue-800 text-sm font-bold opacity-40 pointer-events-none">SOUTH AMERICA</text>
          <text x="500" y="300" textAnchor="middle" className="fill-blue-800 text-sm font-bold opacity-40 pointer-events-none">EUROPE</text>
          <text x="530" y="400" textAnchor="middle" className="fill-blue-800 text-sm font-bold opacity-40 pointer-events-none">AFRICA</text>
          <text x="720" y="300" textAnchor="middle" className="fill-blue-800 text-sm font-bold opacity-40 pointer-events-none">ASIA</text>
          <text x="810" y="420" textAnchor="middle" className="fill-blue-800 text-sm font-bold opacity-40 pointer-events-none">AUSTRALIA</text>
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-travel-green rounded-full"></div>
              <span className="text-gray-700 font-medium">Visited</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-travel-yellow rounded-full"></div>
              <span className="text-gray-700 font-medium">Upcoming</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-gray-700 font-medium">Unvisited</span>
            </div>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          SVG World Map (Google Maps loading...)
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-blue-50 relative">
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[400px]"
        style={{ borderRadius: '12px' }}
      />
      
      {/* Mobile Country Picker Overlay */}
      {showMobileCountryPicker && isMobile && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full max-h-96 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Select Country</h3>
              <button
                onClick={() => setShowMobileCountryPicker(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {/* Search input for easier country finding */}
              <input
                type="text"
                placeholder="Search countries..."
                className="w-full px-3 py-2 border rounded mb-2 text-sm"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const filteredCountries = countries?.filter(country => 
                    country.name.toLowerCase().includes(searchTerm)
                  );
                  // Update the list dynamically - simplified for now
                }}
              />
              {countries?.map((country) => (
                <button
                  key={country.id}
                  onClick={() => {
                    console.log('Country picker: Selected', country.name);
                    onCountryClick(country);
                    setShowMobileCountryPicker(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 rounded border transition-colors"
                >
                  <span className="text-lg mr-2">{country.flag}</span>
                  {country.name}
                  {country.status === 'visited' && (
                    <span className="ml-2 text-green-600 text-xs">✓ Visited</span>
                  )}
                  {country.status === 'upcoming' && (
                    <span className="ml-2 text-yellow-600 text-xs">📅 Planned</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Helper Button - show picker as backup option */}
      {isMobile && (
        <button
          onClick={() => setShowMobileCountryPicker(true)}
          className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40 text-sm"
          title="Country List"
        >
          📍
        </button>
      )}
      
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-travel-green rounded-full"></div>
            <span className="text-gray-700 font-medium">Visited</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-travel-yellow rounded-full"></div>
            <span className="text-gray-700 font-medium">Upcoming</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-gray-700 font-medium">Unvisited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
