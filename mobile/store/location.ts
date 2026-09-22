import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_KEY = "quickeats_location";

interface LocationState {
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLocation: (loc: {
    city: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  city: null,
  address: null,
  latitude: null,
  longitude: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCATION_KEY);
      if (stored) {
        set({ ...JSON.parse(stored), hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  setLocation: (loc) => {
    set({ ...loc, hydrated: true });
    AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(loc)).catch(() => {});
  },
}));
