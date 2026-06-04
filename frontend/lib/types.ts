export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  operatingArea: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export type ListingType = 'agricultural' | 'residential' | 'commercial';

export interface ListingCard {
  id: number;
  userId: number;
  title: string;
  lat: number;
  lng: number;
  areaText: string | null;
  size: string | null;
  price: number | null;
  type: ListingType;
  roadFacing: boolean;
  notes: string | null;
  photoUrls: string[] | null;
  createdAt: string;
  dealerName: string | null;
  dealerCity: string | null;
}

export interface ListingDetail extends ListingCard {
  dealerId: number;
  dealerPhone: string | null;
  dealerEmail: string | null;
  dealerOperatingArea: string | null;
}

export interface Message {
  id: number;
  listingId: number;
  senderId: number;
  receiverId: number;
  text: string;
  createdAt: string;
  senderName: string | null;
}
