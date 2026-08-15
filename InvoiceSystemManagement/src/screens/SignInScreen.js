import React from "react"
import { View, Platform } from "react-native"
import AppleSignIn from "../components/signInComponent/appleSignin"
import GoogleAuth from "../components/signInComponent/googleAuth"
import LandingLogo from "../components/signInComponent/landingLogo"

const SignInScreen = () => {

    return(
        <View className="flex-1 items-center justify-center bg-slate-100">
           <LandingLogo/>
           {Platform.OS === "ios" ? <AppleSignIn/> : <GoogleAuth/>}
        </View>
    )
}

export default SignInScreen