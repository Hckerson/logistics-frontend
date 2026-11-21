import type { FacilityPlaceDto } from "@/lib/contract/schemas";

const LATITUDE = 90;
const LONGITUDE = 180;

export const addressOf = ({ line1, city, region, postalCode }: FacilityPlaceDto) => `${line1}, ${city}, ${region} ${postalCode}`;

export const directionsUrl = ({ latitude, longitude }: FacilityPlaceDto, apple: boolean) => {
    if (Math.abs(latitude) > LATITUDE || Math.abs(longitude) > LONGITUDE) return null;
    const destination = `${latitude},${longitude}`;
    return apple ? `https://maps.apple.com/?daddr=${destination}` : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
};

export const telOf = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;
