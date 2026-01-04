//! Hook for Get city

import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentCity, setCurrentState, setCurrentAddress } from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const apikey = import.meta.env.VITE_GEOAPIKEY;
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude

      //! mapSlice
      dispatch(setLocation({ lat: latitude, lon: longitude }))

      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`)
      // console.log(result.data)
      dispatch(setCurrentCity(result?.data?.results[0].city || result?.data?.results[0].county))
      dispatch(setCurrentState(result?.data?.results[0].state))
      dispatch(setCurrentAddress(result?.data?.results[0].formatted))

      //! mapSlice
      dispatch(setAddress(result?.data?.results[0].formatted))

    }, (error) => {
      console.error("Error getting location:", error);
    })
  }, [])

}

export default useGetCity;
