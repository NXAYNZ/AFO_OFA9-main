import { PLACE_PHOTOS } from '@/data/placePhotos';
import { PLACE_GALLERY } from '@/data/placeGallery';
import { EXTRA_PLACE_PHOTOS, CITY_PHOTOS } from '@/data/placePhotosExtra';
import { PROVINCE_TRAVEL } from '@/data/thailandTravel';

// Photos of the attraction itself: local gallery first, then Wikipedia, then the Wikimedia search results
export const placeImages = (province: string, place: string): string[] => {
  const key = `${province}|${place}`;
  const gallery = PLACE_GALLERY[key];
  if (gallery?.length) return gallery;
  const url = PLACE_PHOTOS[key]?.imageUrl ?? EXTRA_PLACE_PHOTOS[key]?.imageUrl;
  return url ? [url] : [];
};

// A photo of the province: its city photo, or else a photo of another attraction in the same province.
// Used when an attraction has no photo of its own.
const provincePhoto = new Map<string, string>();
for (const p of PROVINCE_TRAVEL) {
  const fallback = CITY_PHOTOS[p.name]?.imageUrl ?? p.attractions.map((a) => placeImages(p.name, a.name)[0]).find(Boolean);
  if (fallback) provincePhoto.set(p.name, fallback);
}
export const cityPhoto = (province: string): string | undefined => provincePhoto.get(province);

const CITY_URLS = new Set(Object.values(CITY_PHOTOS).map((p) => p.imageUrl));
const FALLBACK_URLS = new Set(provincePhoto.values());
// True for a province-level stand-in photo (not of the attraction itself)
export const isCityPhoto = (src: string | undefined, province?: string, place?: string): boolean =>
  !!src && (CITY_URLS.has(src) || (FALLBACK_URLS.has(src) && !!province && !!place && !placeImages(province, place).includes(src)));

// Attraction photos, or the city photo when there are none
export const placeImagesOrCity = (province: string, place: string): string[] => {
  const own = placeImages(province, place);
  if (own.length) return own;
  const city = cityPhoto(province);
  return city ? [city] : [];
};

// Where a photo came from, for the credit link under it
export const placeSource = (province: string, place: string) => PLACE_PHOTOS[`${province}|${place}`] ?? EXTRA_PLACE_PHOTOS[`${province}|${place}`];
