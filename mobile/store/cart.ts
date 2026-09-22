import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CartItem } from "../types";

const CART_KEY = "quickeats_cart";

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  totalAmount: () => number;
  shopId: () => string | null;
}

async function persist(items: CartItem[]) {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(CART_KEY);
      set({ items: stored ? JSON.parse(stored) : [], hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  addItem: (item) => {
    const items = [...get().items];
    const existing = items.find((i) => i.id === item.id);

    // QuickEats orders are grouped per shop server-side, but to keep the
    // customer UX simple (matches a single active order in progress) we only
    // allow items from one shop in the cart at a time.
    if (items.length > 0 && items[0].shop !== item.shop) {
      set({ items: [item] });
      persist([item]);
      return;
    }

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push(item);
    }
    set({ items });
    persist(items);
  },

  updateQuantity: (id, quantity) => {
    const items = get()
      .items.map((i) => (i.id === id ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0);
    set({ items });
    persist(items);
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({ items });
    persist(items);
  },

  clear: () => {
    set({ items: [] });
    persist([]);
  },

  totalAmount: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  shopId: () => get().items[0]?.shop ?? null,
}));
