//! This is A UserSlice

import { createSlice } from "@reduxjs/toolkit";

//! function for item cart as a gest
function getInitialState() {
  try {
    const stored = localStorage.getItem("guestCart");
    const parsed = stored ? JSON.parse(stored) : null;
    return {
      userData: null,
      currentCity: parsed?.city || null,
      currentState: parsed?.state || null,
      currentAddress: parsed?.address || null,
      shopsInMyCity: parsed?.shops || [],
      itemsInMyCity: parsed?.itemsData || [],
      loadingShops: !parsed?.shops?.length,
      loadingItems: !parsed?.itemsData?.length,
      cartItems: parsed?.items || [],
      totalAmount: parsed?.totalAmount || 0,
      myOrders: [],
      searchItems: null,
      socket: null,
    };
  } catch {
    void 0; // ignore localStorage access errors
    return {
      userData: null,
      currentCity: null,
      currentState: null,
      currentAddress: null,
      shopsInMyCity: [],
      itemsInMyCity: [],
      loadingShops: true,
      loadingItems: true,
      cartItems: [],
      totalAmount: 0,
      myOrders: [],
      searchItems: null,
      socket: null,
    };
  }
}

const userSlice = createSlice({
  name: "user",
  initialState: getInitialState(),
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
      try {
        const stored = localStorage.getItem("guestCart");
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.city = action.payload;
        localStorage.setItem("guestCart", JSON.stringify(parsed));
      } catch (e) {}
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
      try {
        const stored = localStorage.getItem("guestCart");
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.state = action.payload;
        localStorage.setItem("guestCart", JSON.stringify(parsed));
      } catch (e) {}
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
      try {
        const stored = localStorage.getItem("guestCart");
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.address = action.payload;
        localStorage.setItem("guestCart", JSON.stringify(parsed));
      } catch (e) {}
    },
    setShopsInMyCity: (state, action) => {
      state.shopsInMyCity = action.payload;
      state.loadingShops = false;
      try {
        const stored = localStorage.getItem("guestCart");
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.shops = action.payload;
        localStorage.setItem("guestCart", JSON.stringify(parsed));
      } catch (e) {}
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
      state.loadingItems = false;
      try {
        const stored = localStorage.getItem("guestCart");
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.itemsData = action.payload;
        localStorage.setItem("guestCart", JSON.stringify(parsed));
      } catch (e) {}
    },
    
    addToCart: (state, action) => {
       const cartItem = action.payload;
      const existingItem = state.cartItems.find((i) => i.id == cartItem.id);
      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity ,0)
      try {
        localStorage.setItem("guestCart", JSON.stringify({ items: state.cartItems, totalAmount: state.totalAmount }));
      } catch {
        void 0;
      }
    },
    updateQuantity: (state, action) => {
       const {id, quantity} = action.payload;
       const item = state.cartItems.find((i) => i.id == id)
       if (item) {
          item.quantity = quantity
       }

       state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity ,0)
       try {
         localStorage.setItem("guestCart", JSON.stringify({ items: state.cartItems, totalAmount: state.totalAmount }));
       } catch {
         void 0;
       }

    },
    deleteQuantity: (state, action) => {
      const {id} = action.payload;
      state.cartItems = state.cartItems.filter((i) => i.id !== id)
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity ,0)
      try {
        localStorage.setItem("guestCart", JSON.stringify({ items: state.cartItems, totalAmount: state.totalAmount }));
      } catch {
        void 0;
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      try {
        localStorage.setItem("guestCart", JSON.stringify({ items: [], totalAmount: 0 }));
      } catch {
        void 0;
      }
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },
    addMyOrder: (state, action) => {
      state.myOrders = [action.payload,...state.myOrders ]
    },
    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find((o) => o._id == orderId);
      if (order) {
        if (Array.isArray(order.shopOrders)) {
          const shopOrder = order.shopOrders.find(
            (so) => (so.shop?._id || so.shop) == shopId
          );
          if (shopOrder) shopOrder.status = status;
        } else if (order.shopOrders) {
          if ((order.shopOrders.shop?._id || order.shopOrders.shop) == shopId) {
            order.shopOrders.status = status;
          }
        }
      }
    },
    updateRealtimeStatus: (state, action) => {
      const { orderId, shopId, status, deliveryBoy } = action.payload;
      const order = state.myOrders.find((o) => o._id == orderId);
      if (order) {
        if (Array.isArray(order.shopOrders)) {
          const shopOrder = order.shopOrders.find(
            (so) => (so.shop?._id || so.shop) == shopId
          );
          if (shopOrder) {
            if (status) shopOrder.status = status;
            if (deliveryBoy) shopOrder.assignedDeliveryBoy = deliveryBoy;
          }
        } else if (order.shopOrders) {
          if ((order.shopOrders.shop?._id || order.shopOrders.shop) == shopId) {
            if (status) order.shopOrders.status = status;
            if (deliveryBoy) order.shopOrders.assignedDeliveryBoy = deliveryBoy;
          }
        }
      }
    },

    setSearchItems: (state, action) => {
         state.searchItems=action.payload;
    },
    setSocket: (state, action) => {
         state.socket=action.payload;
    }
  },
});

export const {
  setUserData,
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
  setShopsInMyCity,
  setItemsInMyCity,
  addToCart,
  updateQuantity,
  deleteQuantity,
  totalAmount,
  setMyOrders,
  addMyOrder,
  updateOrderStatus,
  setSearchItems,
  setSocket,
  updateRealtimeStatus,
  clearCart,
} = userSlice.actions;
export default userSlice.reducer;
