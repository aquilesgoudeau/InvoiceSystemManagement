import createDataContext from "./createDataContext"
import {navigate, goBack, resetTo} from "../navigation/navigationRef"
import axiosApi from "../services/axiosApi"
import * as SecureStore from "expo-secure-store"

export const authReducer = (state,action) => {
    switch(action.type){
        case 'sign_in':
            return {errorMessage:'', token:action.payload.token, email:action.payload.email}
            case 'clear_error_message':
                return {...state, errorMessage:''}
                case 'add_error':
                    return {...state, errorMessage: action.payload}
                    case 'sign_out':
                        return {token: null,email:null, errorMessage:''}
                             default:
                                return state
    }
}

const tryLocalSignIn = (dispatch) => async () =>{
  const token = await SecureStore.getItemAsync('token')
  console.log('token: ',token);
  
  if(token){
    dispatch({type:"sign_in",payload:{token}})
    resetTo("Home")
  }else{
    resetTo("SignIn")
  }
}
const clearErrorMessage = (dispatch) => ()=>{
    dispatch({type:"clear_error_message"})
}

const addError = (dispatch) => (message) => {
    dispatch({type:"add_error", payload: message})
}

const signInWithApple = (dispatch) => async (appleAuthRequestResponse) => {
    try {
        const { identityToken, email, fullName } = appleAuthRequestResponse;
        
        const response = await axiosApi.post('/auth/apple-login', {
            identityToken,
            email,
            firstName: fullName?.givenName,
            lastName: fullName?.familyName
        });

        await SecureStore.setItemAsync('token', response.data.token);
        dispatch({
            type: 'sign_in',
            payload: {
                token: response.data.token,
                email: response.data.user.email || email
            }
        });

        resetTo('Home');
    } catch (err) {
        console.log(err);
        const errorMessage = err.response?.data?.error || "Something went wrong while signing in with Apple. Please try again.";
        dispatch({ type: "add_error", payload: errorMessage });
    }
};

const signInWithGoogle = (dispatch) => async (idToken) => {
    try {

        const response = await axiosApi.post("/auth/google-login", { idToken });
         
        await SecureStore.setItemAsync('token', response.data.token);
        dispatch({ 
            type: "sign_in", 
            payload: { token: response.data.token, email: response.data.user.email } 
        });
        resetTo("Resolver");
   } catch (err) {
        console.log(err);
        const errorMessage = err.response?.data?.error || "Something went wrong while signing in with Google. Please try again."
        dispatch({ type: "add_error", payload: errorMessage });
    }
};

const signOut = (dispatch) => async () => {
    await SecureStore.deleteItemAsync('token')
    dispatch({type:"sign_out"})
    resetTo("Resolver")
}
export const { Context, Provider } = createDataContext(
    authReducer,
    {tryLocalSignIn,clearErrorMessage,addError,signOut,signInWithApple,signInWithGoogle},
    {token:null,email:null,errorMessage:''}
)