import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UserReducerInitialState } from "../../types/reducer-types";
import { User } from "../../types/types";

const initialState:UserReducerInitialState = {
 user:null,
 loading:true
}

export const userReducer = createSlice({
    name:"userReducer",
    initialState,
    reducers:{
        userExist:(state,action:PayloadAction<User>)=>{
            state.user = action.payload;
            state.loading = false;
        },
        userNotExist:(state)=>{
            state.user = null;
            state.loading = false;
        }
    }
})
export const {userExist, userNotExist} = userReducer.actions;