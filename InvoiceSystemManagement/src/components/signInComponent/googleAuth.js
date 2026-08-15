
import { TouchableOpacity, Text, View, Platform } from "react-native"
import React, { useContext, useEffect } from "react"
import { Context as AuthContext } from "../../contexts/authContext"
import { Ionicons } from '@expo/vector-icons'
import {
    GoogleSignin,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes,
} from '@react-native-google-signin/google-signin'

if(Platform.OS === "android"){
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});
}
const GoogleAuth = () => {
    const { state, signInWithGoogle, clearErrorMessage, addError } = useContext(AuthContext)
    const { errorMessage } = state

    const handleGoogleSignIn = async () => {
        clearErrorMessage();
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const response = await GoogleSignin.signIn();

            if (isSuccessResponse(response)) {
                const idToken = response.data.idToken;
                if (idToken) {
                    signInWithGoogle(idToken);
                } else {
                    console.log("Error: login exitoso pero sin idToken", response);
                }
            } else {
                // response.type === 'cancelled' -> el usuario cerró el picker de cuentas
                console.log("Google Sign-In cancelado por el usuario");
            }
        } catch (err) {
            if (isErrorWithCode(err)) {
                switch (err.code) {
                    case statusCodes.IN_PROGRESS:
                        console.log("Ya hay un intento de sign-in en curso");
                        addError("Sign-in process is already in progress. Please wait.")
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        console.log("Google Play Services no disponible/desactualizado");
                        addError("Google Play Services is not available or needs an update.");
                        break;
                    default:
                        console.log("Error de Google Sign-In:", err.code, err.message);
                        addError("Failed to sign in with Google. Please try again.");
                }
            } else {
                console.log("Error inesperado en Google Sign-In:", err);
                addError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return(
    <View className="mt-4 w-full items-center justify-center">
        <TouchableOpacity
            style={{
                width: '80%',
                height: 40,
                borderRadius: 12,
                backgroundColor: '#4285F4',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            activeOpacity={0.8}
            onPress={handleGoogleSignIn}
        >
            <Ionicons name="logo-google" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Sign in with Google
            </Text>
        </TouchableOpacity>
        {!!errorMessage && (
            <Text className="text-red-500 text-sm mt-2 text-center">
                {errorMessage}
            </Text>
        )}
    </View>
    )
};

export default GoogleAuth
