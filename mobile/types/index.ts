export type Role = "user" | "owner" | "deliveryBoy" | "admin";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile: number;
  role: Role;
  location?: { type: "Point"; coordinates: [number, number] };
  token?: string;
}

export interface Shop {
  _id: string;
  name: string;
  image: string;
  owner: string | User;
  city: string;
  state: string;
  address: string;
  items: Item[];
  isOpen: boolean;
}

export type Category =
  | "Snack"
  | "Main Course"
  | "Desserts"
  | "Pizza"
  | "Burgers"
  | "Sandwiches"
  | "South Indian"
  | "Fast Food"
  | "Others";

export interface Item {
  _id: string;
  name: string;
  description?: string;
  image: string;
  shop: string | Shop;
  category: Category;
  price: number;
  discount: number;
  foodType: "veg" | "non-veg";
  rating: { average: number; count: number };
}

export interface CartItem {
  id: string; // item _id
  name: string;
  price: number;
  quantity: number;
  image: string;
  shop: string; // shop _id
  shopName?: string;
}

export interface DeliveryAddress {
  text: string;
  latitude: number;
  longitude: number;
}

export type ShopOrderStatus =
  | "pending"
  | "preparing"
  | "out of delivery"
  | "delivered";

export interface ShopOrderItem {
  item: Item | string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShopOrder {
  _id: string;
  shop: Shop | string;
  owner: User | string;
  subtotal: number;
  shopOrderItems: ShopOrderItem[];
  status: ShopOrderStatus;
  assignedDeliveryBoy?: User | string;
  deliveryOtp?: string | null;
  deliveredAt?: string | null;
}

export interface Order {
  _id: string;
  user: User | string;
  paymentMethod: "cod" | "online";
  deliveryAddress: DeliveryAddress;
  totalAmount: number;
  shopOrders: ShopOrder[];
  payment: boolean;
  createdAt: string;
  updatedAt: string;
}
