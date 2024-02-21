import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CartReducerInitialState } from "../../types/reducer-types";
import { CartItem, ShippingInfo } from "../../types/types";


const initialState:CartReducerInitialState = {
    loading:false,
    cartItems:[],
    subtotal:0,
    tax:0,
    shippingCharges:0,
    discount:0,
    total:0,
    shippingInfo:{
        address:"",
        city:"",
        country:"",
        state:"",
        pinCode:0
    }
}

export const cartReducer = createSlice({
    name:"cartReducer",
    initialState,
    reducers:{
        addToCart:(state,action:PayloadAction<CartItem>)=>{
            state.loading = true;
            const index = state.cartItems.findIndex((i)=>i.productId === action.payload.productId)
            if(index !== -1){
                state.cartItems[index] = action.payload;
            }
            else{
                 state.cartItems.push(action.payload);
            }
           
            state.loading = false;
        },
        removeCartItem:(state,action:PayloadAction<string>)=>{
            state.loading = true;
            state.cartItems = state.cartItems.filter((item)=>{
                return item.productId !== action.payload;
            })
            state.loading = false;
        },
        calculatePrice: (state)=>{
            let subtotal = 0;
            for(let i = 0; i < state.cartItems.length; i++){
                const value = state.cartItems[i];
                subtotal += value.price * value.quantity;
            }
            state.subtotal = subtotal;
            state.tax = Math.round(subtotal * 0.18);
            state.shippingCharges = state.subtotal > 1000 ? 0: 200;
            state.total = subtotal + state.tax + state.shippingCharges - state.discount;
            
        },
        discountApplied:(state,action:PayloadAction<number>)=>{
            state.discount = action.payload;
        },
        saviShippingInfo:(state,action:PayloadAction<ShippingInfo>)=>{
            state.shippingInfo = action.payload;
        },
        resetCart:()=>{
            return initialState;
        }
    }
})

export const { addToCart, removeCartItem,calculatePrice,discountApplied, saviShippingInfo, resetCart } = cartReducer.actions;
