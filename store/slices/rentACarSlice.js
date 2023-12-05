import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: false,
    driverAssigned: false,
    user: {
        uid: null,
        firstName: null,
        lastName: null,
        companyName: null,
        userName: null,
        email: null,
        phoneNumber: null,
        photoURL: null,
        phoneNumberVerified: false,
        isLoggedIn: false,
        lastLoginAt: null,
    },
};

const rentACarSlice = createSlice({
    name: "rentACar",
    initialState,
    reducers: {
        setRentACarUser: (state, action) => {
            state.user = { ...state.user, ...action.payload }; // payload is an object with incoming user data
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setDriverAssigned: (state, action) => {
            state.driverAssigned = action.payload;
        },
        resetRentACarUser: (state) => {
            state.user = initialState.user;
        },
    },
});

// export User actions
export const { setRentACarUser, setLoading, setDriverAssigned, resetRentACarUser } = rentACarSlice.actions;

// The function selects the user object from the state.
// The `state` parameter is the current state of the Redux store.
export const selectLoading = (state) => state.rentACar.loading;
export const selectDriverAssigned = (state) => state.rentACar.driverAssigned;
export const selectRentACarUser = (state) => state.rentACar.user;

/* export default rentACarSlice.reducer is exporting the reducer function from the `rentACarSlice` slice.
This allows other parts of the application to import and use the reducer when creating the Redux
store. */
export default rentACarSlice.reducer;
