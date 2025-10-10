//! Hook For Update the location

import axios from "axios";
import { useEffect } from "react";
import { serverUrl } from "../config";
import { useSelector } from "react-redux";

function useUpdateLocation() {

  const {userData} = useSelector(state => state.user)

  useEffect(() => {
    const updateLocation = async (lat, lon) => {
    
        const result = await axios.post(`${serverUrl}/api/user/update-location`, {lat, lon}, {
          withCredentials: true,
        });
        console.log(result.data)

    
    };

    //! when the coordinates diff then the update and fetch the coordinates
     navigator.geolocation.watchPosition((pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude)
     })

  }, [userData]);
}

export default useUpdateLocation;
