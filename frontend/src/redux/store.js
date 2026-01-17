//! This is a reducer of Owner, user and map

import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice"
import ownerSlice from "./ownerSlice"
import mapSlice from "./mapSlice"


export const store = configureStore({
    reducer: {
        user: userSlice,
        owner: ownerSlice,
        map: mapSlice
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['user/setSocket'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['payload.socket'],
                // Ignore these paths in the state
                ignoredPaths: ['user.socket'],
            },
        }),
}) 