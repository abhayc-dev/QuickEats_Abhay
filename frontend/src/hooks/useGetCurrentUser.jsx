//! Hook for get the current User 

import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../config";
import { setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";

function useGetCurrentUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data));
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchUser();
  }, []);
}

export default useGetCurrentUser;
