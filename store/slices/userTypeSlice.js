import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userType: null,
};

const userTypeSlice = createSlice({
    name: "userType",
    initialState,
    reducers: {
        setUserType: (state, action) => {
            state.userType = action.payload;
        },
    },
});

// export User actions
export const { setUserType } = userTypeSlice.actions;

export const selectUserType = (state) => state.userType.userType;

export default userTypeSlice.reducer;
