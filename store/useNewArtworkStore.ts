import { create } from 'zustand';

interface NewArtworkState {
  // Step 1 data
  title: string;
  year: string;
  medium: string;
  dimensions: string;
  status: 'verified' | 'unverified';
  imageUri: string | null;
  artist: string;
  artworkId: string | null;

  // Step 3 data (optional)
  location: string;
  forSale: boolean;
  price: string;

  // Certificate data
  generateCertificate: boolean;
  certificateId: string | null;

  // Actions
  setTitle: (title: string) => void;
  setYear: (year: string) => void;
  setMedium: (medium: string) => void;
  setDimensions: (dimensions: string) => void;
  setStatus: (status: 'verified' | 'unverified') => void;
  setImageUri: (uri: string | null) => void;
  setArtist: (artist: string) => void;
  setArtworkId: (id: string | null) => void;
  setLocation: (location: string) => void;
  setForSale: (forSale: boolean) => void;
  setPrice: (price: string) => void;
  setGenerateCertificate: (generate: boolean) => void;
  setCertificateId: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  title: '',
  year: '',
  medium: '',
  dimensions: '',
  status: 'unverified' as const,
  imageUri: null,
  artist: '',
  artworkId: null,
  location: '',
  forSale: false,
  price: '',
  generateCertificate: false,
  certificateId: null,
};

export const useNewArtworkStore = create<NewArtworkState>((set) => ({
  ...initialState,

  setTitle: (title) => set({ title }),
  setYear: (year) => set({ year }),
  setMedium: (medium) => set({ medium }),
  setDimensions: (dimensions) => set({ dimensions }),
  setStatus: (status) => set({ status }),
  setImageUri: (imageUri) => set({ imageUri }),
  setArtist: (artist) => set({ artist }),
  setArtworkId: (artworkId) => set({ artworkId }),
  setLocation: (location) => set({ location }),
  setForSale: (forSale) => set({ forSale }),
  setPrice: (price) => set({ price }),
  setGenerateCertificate: (generateCertificate) => set({ generateCertificate }),
  setCertificateId: (certificateId) => set({ certificateId }),
  reset: () => set(initialState),
}));

