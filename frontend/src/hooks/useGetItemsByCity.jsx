//! Hook for get items for Specific City

import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../config";
import { setItemsInMyCity } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";

function useGetItemsByCity() {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user)

  useEffect(() => {
    const fetchItems = async () => {
      if (!currentCity) return;
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`);
        dispatch(setItemsInMyCity(result.data));
        console.log(result.data)

      } catch (error) {
        console.log(error.message);
      }
    };
    fetchItems();
  }, [currentCity]);

  // realtime: refresh items when server broadcasts update for this city
  const { socket } = useSelector(state => state.user);
  useEffect(() => {
    if (!socket) return;
    const handler = ({ city }) => {
      if (city === currentCity) {
        axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`)
          .then(res => dispatch(setItemsInMyCity(res.data)))
          .catch(() => void 0);
      }
    };
    socket.on('itemsUpdated', handler);
    return () => {
      socket.off('itemsUpdated', handler);
    };
  }, [socket, currentCity, dispatch]);
}

export default useGetItemsByCity;
