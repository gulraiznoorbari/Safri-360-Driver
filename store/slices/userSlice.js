import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userType: null,
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

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserType: (state, action) => {
            state.userType = action.payload;
        },
        setUser: (state, action) => {
            state.user = { ...state.user, ...action.payload }; // payload is an object with incoming user data
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setDriverAssigned: (state, action) => {
            state.driverAssigned = action.payload;
        },
        resetUser: (state) => {
            state.user = initialState.user;
        },
    },
});

// export User actions
export const { setUserType, setUser, setLoading, setDriverAssigned, resetUser } = userSlice.actions;

// The function selects the user object from the state.
// The `state` parameter is the current state of the Redux store.
export const selectUserType = (state) => state.user.userType;
export const selectLoading = (state) => state.user.loading;
export const selectDriverAssigned = (state) => state.user.driverAssigned;
export const selectUser = (state) => state.user.user;

/* export default userSlice.reducer is exporting the reducer function from the `userSlice` slice.
This allows other parts of the application to import and use the reducer when creating the Redux
store. */
export default userSlice.reducer;
