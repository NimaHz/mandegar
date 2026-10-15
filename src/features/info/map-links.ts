interface Coordinates {
  lat: number;
  lng: number;
}

export const mapLinks = ({ lat, lng }: Coordinates) => ({
  neshan: `https://neshan.org/maps/@${lat},${lng},16z`,
  balad: `https://balad.ir/location?latitude=${lat}&longitude=${lng}&zoom=16`,
});
