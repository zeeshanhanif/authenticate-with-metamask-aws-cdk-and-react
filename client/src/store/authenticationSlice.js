import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import env from "react-dotenv";
import { initWeb3 } from "./setupSlice";

const LS_KEY = 'login:auth';

const findUser = async(publicAddress)=>{
    try {
        const response = await fetch(`${env.API_URL}${env.SERVER_EXISTING_USERS}?publicAddress=${publicAddress}`);
        //const userArray = await response.json();
        //return userArray.length && userArray[0];
        const data = await response.json();
        return data.Item;
    }
    catch(error){
        throw Error("FindUser: "+error.message);
    }
}

const signup = async(publicAddress)=>{
    console.log("in signup = ",publicAddress);
    try {
        const response = await fetch(`${env.API_URL}${env.SERVER_SIGNUP}`,{
            method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
            body: JSON.stringify({ publicAddress }),
        });
        return await response.json();
    }
    catch(error){
        throw Error("Signup: "+error.message);
    }
}

const signMessage = async(user,thunkAPI)=>{
    console.log("in signMessage = ",user);
    try {
        const web3 = thunkAPI.getState().setupReducer.web3;
        const signature = await web3.eth.personal.sign(`My App Auth Service Signing nonce: ${user.nonce}`,user.publicAddress,'');
        return signature;
    }
    catch(error){
        // Add this message after verifying what message we receive from metamask
        // You need to sign the message to be able to log in.
        throw Error("SignMessage: "+error.message);
    }
}

const authenticate = async(user, signature)=>{
    console.log("in authenticate1 = ",user);
    console.log("in authenticate2 = ",signature);
    try {
        const response = await fetch(`${env.API_URL}${env.SERVER_AUTH}`,{
            method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
            body: JSON.stringify({ publicAddress: user.publicAddress, signature }),
        }); 
        const data = await response.json();
        if(data.isError){
            throw Error(data.error);
        }
        return data;
    }
    catch(error){
        throw Error("Authenticate: "+error.message);
    }
}

export const login = createAsyncThunk(
    "Login",
    async(data,thunkAPI)=>{
        try {
            let user = await findUser(data.publicAddress);
            if(!user){
                user = await signup(data.publicAddress);
            }
            console.log("user = ", user);
            const signature = await signMessage(user,thunkAPI);
            console.log("after signature = ",signature);
            const auth = await authenticate(user,signature);
            window.localStorage.setItem(LS_KEY, JSON.stringify(auth));
            return {
                auth,
                user
            }
        }
        catch(error){
            console.log("Error in Login Process = ",error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
)

export const loadlocalStorage = createAsyncThunk(
    "LoadlocalStorage",
    async(data,thunkAPI)=>{
        try {
            const ls = window.localStorage.getItem(LS_KEY);
		    const auth = ls && JSON.parse(ls);

            if(auth && auth.accessToken) {
                thunkAPI.dispatch(initWeb3());
                return {
                    auth: auth,
                }
            }
        }
        catch(error){
            console.log("Error in LoadLocalAuth Process = ",error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
)

export const authLocalStorageToken = createAsyncThunk(
    "AuthLocalStorageToken",
    async(data,thunkAPI)=>{
        try {
            const address = thunkAPI.getState().setupReducer.address;
            const auth = thunkAPI.getState().authenticationReducer.auth;
            if(auth && auth.accessToken && address) {
                const response = await fetch(`${env.API_URL}${env.AUTH_USER}?publicAddress=${address}`, {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                });
                const data = await response.json();
                console.log("after response authLocalStorageToken = ",data);
                return {
                    user: data.Item,
                }
            }
            else {
                return thunkAPI.rejectWithValue(`User not found with publicAddress ${address}`);
            }
        }
        catch(error){
            console.log("Error in LoadLocalAuth Process = ",error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
)

const authenticationSlice = createSlice({
    name: "authenticationSlice",
    initialState : {
        loginSignupError: "",
        auth: null,
        user:null,
        authLoading: false
    },
    reducers: {
        clearAuth: (state)=>{
            localStorage.removeItem(LS_KEY);
            state.auth = null;
            state.user = null;
        }
    },
    extraReducers: {
        [login.fulfilled]: (state,action)=>{
            //console.log("In login fullfill = ",state);
            //console.log("In login fullfill = ",action);
            state.auth = action.payload.auth;
            state.user = action.payload.user;
            state.loginSignupError = "";
            state.authLoading = false;
            
        },
        [login.pending]: (state,action)=>{
            state.loginSignupError = "";
            state.authLoading = true;
            
        },
        [login.rejected]: (state,action)=>{
            state.loginSignupError = action.payload;
            state.authLoading = false;
        },
        [loadlocalStorage.fulfilled]: (state,action)=>{
            //console.log("In loadlocalAuth fullfill = ",state);
            //console.log("In loadlocalAuth fullfill = ",action);
            if(action.payload) {
                state.auth = action.payload.auth;
            }
            state.loginSignupError = "";
            state.authLoading = false;
            
        },
        [loadlocalStorage.pending]: (state,action)=>{
            state.loginSignupError = "";
            state.authLoading = true;
            
        },
        [loadlocalStorage.rejected]: (state,action)=>{
            state.loginSignupError = action.payload;
            state.authLoading = false;
        },
        [authLocalStorageToken.fulfilled]: (state,action)=>{
            //console.log("In authLocalStorageToken fullfill = ",state);
            //console.log("In authLocalStorageToken fullfill = ",action);
            if(action.payload) {
                state.user = action.payload.user;
            }
            state.loginSignupError = "";
            state.authLoading = false;
            
        },
        [authLocalStorageToken.pending]: (state,action)=>{
            state.loginSignupError = "";
            state.authLoading = true;
            
        },
        [authLocalStorageToken.rejected]: (state,action)=>{
            state.loginSignupError = action.payload;
            state.authLoading = false;
        },
    }

})

export const authenticationReducer = authenticationSlice.reducer;
export const { clearAuth } = authenticationSlice.actions;