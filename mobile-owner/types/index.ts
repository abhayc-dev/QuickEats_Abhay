export type Role = "user" | "owner" | "deliveryBoy" | "admin";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile: number;
  role: Role;
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

export const CATEGORIES: Category[] = [
  "Snack",
  "Main Course",
  "Desserts",
  "Pizza",
  "Burgers",
  "Sandwiches",
  "South Indian",
  "Fast Food",
  "Others",
];

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

export interface DeliveryBoy {
  _id: string;
  fullName: string;
  mobile: number;
}

export interface ShopOrder {
  _id: string;
  shop: { _id: string; name: string } | string;
  owner: string;
  subtotal: number;
  shopOrderItems: ShopOrderItem[];
  status: ShopOrderStatus;
  assignedDeliveryBoy?: DeliveryBoy | string | null;
  deliveryOtp?: string | null;
  otpExpires?: string | null;
  deliveredAt?: string | null;
}

// Shape returned by GET /order/my-orders for an owner: one row per order,
// with `shopOrders` narrowed server-side to just this owner's shop-order
// (singular, not an array like the customer-facing endpoint).
export interface OwnerOrderRow {
  _id: string;
  paymentMethod: "cod" | "online";
  user: User;
  shopOrders: ShopOrder;
  createdAt: string;
  deliveryAddress: { text: string; latitude: number; longitude: number };
  payment: boolean;
}
