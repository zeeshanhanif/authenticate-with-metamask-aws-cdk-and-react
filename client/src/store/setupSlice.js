import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Web3 from "web3";

export const initWeb3 = createAsyncThunk(
    "InitWeb3",
    async(data,thunkAPI)=>{
        try {
            if(Web3.givenProvider){
                
                const web3 = new Web3 (Web3.givenProvider);
                await Web3.givenProvider.enable();
                
                const addresses = await web3.eth.getAccounts();
                const balance = await web3.eth.getBalance(addresses[0]);
                console.log("address balance = ", balance)
                console.log("addresss = ",addresses);
                return {
                    web3,
                    address: addresses[0],
                    balance: balance
                };
            }
            else {
                console.log("Error in loading web3");
                return thunkAPI.rejectWithValue("Error in loading web3")
            }
        }
        catch(error){
            console.log("Error in loading Blockchain = ",error);
            return thunkAPI.rejectWithValue(error.message);
        }
        
    }
)


const setupSlice = createSlice({
    name: "setupSlice",
    initialState: {
        web3: null,
        contract: null,
        address: null,
        balance: null,
        web3LoadingError: "",
        settupLoading: false,
    },
    reducers: {
        clearWeb3: (state)=>{
            state.web3 = null;
            state.address = null;
            state.balance = null;
        }
    },
    extraReducers: {
        [initWeb3.fulfilled]: (state,action)=>{
            //console.log("In fullfill = ",state);
            console.log("In fullfill = ",action);
            state.web3 = action.payload.web3;
            state.contract = action.payload.contract;
            state.address = action.payload.address;
            state.balance = state.web3.utils.fromWei(action.payload.balance,"ether");
            state.web3LoadingError = "";
            state.settupLoading = false;

        },
        [initWeb3.pending]: (state,action)=>{
            //console.log("In pending = ",state);
            //console.log("In pending = ",action);
            state.web3LoadingError = "";
            state.settupLoading = true;
            state.web3 = null;
            state.address = null;
            state.balance = null;
            
        },
        [initWeb3.rejected]: (state,action)=>{
            //console.log("In rejected = ",state);
            //console.log("In rejected = ",action);
            state.web3LoadingError = action.payload;
            state.settupLoading = false;
        },
    }
})

export const setupReducer = setupSlice.reducer;
export const { clearWeb3 } = setupSlice.actions;