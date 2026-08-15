import React, { useContext } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Platform } from 'react-native';
import { Context as AuthContext } from '../../contexts/authContext';

const AppleSignIn = () => {

  const navigation = useNavigation();
  const { state, signInWithApple, clearErrorMessage, addError } = useContext(AuthContext);
  const { errorMessage } = state;

  const handleAppleSignIn = async () => {
    try {
      clearErrorMessage();
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      signInWithApple(credential);
    } catch (e) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // Usuario canceló el flujo, no es un error real
        //navigation.navigate('SignIn')
        console.log('queria verificar esto');
      } else {
        console.log('Apple Auth Error:', e);
        addError('Failed to sign in with Apple. Please try again.');
      }
    }
  };

  // Apple Authentication solo está disponible en iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <View className="mt-4 w-full items-center justify-center">
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
        cornerRadius={12}
        style={{ width: '80%', height: 40 }}
        onPress={handleAppleSignIn}
      />
      {!!errorMessage && (
        <Text className="text-red-500 text-sm mt-2 text-center">
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

export default AppleSignIn;