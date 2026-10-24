import { PLACE_PHOTOS } from '@/data/placePhotos';
import { PLACE_GALLERY } from '@/data/placeGallery';

// Local gallery first, then the Wikipedia image as a single-photo fallback
export const placeImages = (province: string, place: string): string[] => {
  const gallery = PLACE_GALLERY[`${province}|${place}`];
  if (gallery?.length) return gallery;
  const url = PLACE_PHOTOS[`${province}|${place}`]?.imageUrl;
  return url ? [url] : [];
};
