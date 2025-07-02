import { queryClient } from "./queryClient";

export function forceRefreshAllData() {
  // Clear all cached data completely
  queryClient.clear();
  
  // Trigger fresh fetches for all key data
  setTimeout(() => {
    queryClient.prefetchQuery({ queryKey: ["/api/countries"] });
    queryClient.prefetchQuery({ queryKey: ["/api/stats"] });
    queryClient.prefetchQuery({ queryKey: ["/api/postcards"] });
  }, 50);
}

export function refreshStats() {
  queryClient.removeQueries({ queryKey: ["/api/stats"] });
  queryClient.removeQueries({ queryKey: ["/api/countries"] });
  queryClient.refetchQueries({ queryKey: ["/api/stats"] });
  queryClient.refetchQueries({ queryKey: ["/api/countries"] });
}

export function refreshPostcards(countryId?: number) {
  queryClient.removeQueries({ queryKey: ["/api/postcards"] });
  if (countryId) {
    queryClient.removeQueries({ queryKey: ["/api/countries", countryId, "postcards"] });
    queryClient.refetchQueries({ queryKey: ["/api/countries", countryId, "postcards"] });
  }
  queryClient.refetchQueries({ queryKey: ["/api/postcards"] });
}