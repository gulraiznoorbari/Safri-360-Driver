import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userType: null,
    user: {
        uid: null,
        firstName: null,
        lastName: null,
        userName: null,
        email: null,
        phoneNumber: null,
        photoURL: null,
        phoneNumberVerified: false,
        isLoggedIn: false,
        lastLoginAt: null,
        isOnline: false,
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
        resetUser: (state) => {
            state.user = initialState.user;
        },
    },
});

// export User actions
export const { setUserType, setUser, resetUser } = userSlice.actions;

// The function selects the user object from the state.
// The `state` parameter is the current state of the Redux store.
export const selectUserType = (state) => state.user.userType;
export const selectUser = (state) => state.user.user;

/* export default userSlice.reducer is exporting the reducer function from the `userSlice` slice.
This allows other parts of the application to import and use the reducer when creating the Redux
store. */
export default userSlice.reducer;
