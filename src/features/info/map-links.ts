import type { GeoPoint } from "@/types/common";

export const mapLinks = ({ lat, lng }: GeoPoint) => ({
  neshan: `https://neshan.org/maps/@${lat},${lng},16z`,
  balad: `https://balad.ir/location?latitude=${lat}&longitude=${lng}&zoom=16`,
});
