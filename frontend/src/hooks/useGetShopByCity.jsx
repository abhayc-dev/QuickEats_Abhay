//! Hook for get Shop By City

import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../config";
import { setShopsInMyCity } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";

function useGetShopByCity() {
  const dispatch = useDispatch();
  const {currentCity} = useSelector(state => state.user)

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`);
        dispatch(setShopsInMyCity(result.data));
        console.log(result.data)

      } catch (error) {
        console.log(error.message);
      }
    };
    fetchShops();
  }, [currentCity, dispatch]);

  // realtime: refresh shops when server broadcasts update for this city
  const { socket } = useSelector(state => state.user)
  useEffect(() => {
    if (!socket) return;
    const handler = ({ city }) => {
      if (city === currentCity) {
        axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`)
          .then(res => dispatch(setShopsInMyCity(res.data)))
          .catch(() => void 0)
      }
    }
    socket.on('shopsUpdated', handler)
    return () => socket.off('shopsUpdated', handler)
  }, [socket, currentCity, dispatch])
}

export default useGetShopByCity;
