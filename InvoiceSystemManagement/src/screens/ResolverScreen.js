import React, { useEffect, useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { Context as AuthContext } from "../contexts/authContext"

const ResolverScreen = () => {
   const { tryLocalSignIn } = useContext(AuthContext);
    useEffect(() => {
      tryLocalSignIn();
    }, []);
     console.log('Aqui estamos');
     
    return (
        <View className="flex-1 items-center justify-center bg-slate-100">
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
    );
};

export default ResolverScreen;
