import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Context, Provider } from '../../src/contexts/authContext';
import axiosApi from '../../src/services/axiosApi';
import * as SecureStore from 'expo-secure-store';
import { navigate } from '../../src/navigation/navigationRef';

// Mock the axios instance
jest.mock('../../src/services/axiosApi', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

// Mock navigation
jest.mock('../../src/navigation/navigationRef', () => ({
  navigate: jest.fn(),
}));

const TestComponent = () => {
  const {
    state,
    tryLocalSignIn,
    clearErrorMessage,
    addError,
    signOut,
    signInWithApple,
    signInWithGoogle,
  } = useContext(Context);

  return (
    <View>
      <Text testID="token">{state.token || 'null'}</Text>
      <Text testID="email">{state.email || 'null'}</Text>
      <Text testID="errorMessage">{state.errorMessage || 'null'}</Text>
      
      <Button testID="tryLocalBtn" title="TryLocal" onPress={tryLocalSignIn} />
      <Button testID="addErrorBtn" title="AddError" onPress={() => addError('Custom Error')} />
      <Button testID="clearErrorBtn" title="ClearError" onPress={clearErrorMessage} />
      <Button testID="signOutBtn" title="SignOut" onPress={signOut} />
      <Button testID="googleBtn" title="Google" onPress={() => signInWithGoogle('g-id-token')} />
      <Button testID="appleBtn" title="Apple" onPress={() => signInWithApple({
        identityToken: 'a-id-token',
        email: 'user@apple.com',
        fullName: { givenName: 'John', familyName: 'Doe' }
      })} />
    </View>
  );
};

describe('AuthContext integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.mockSecureStore.clearMockStore();
  });

  const renderWithProvider = async () => {
    return await render(
      <Provider>
        <TestComponent />
      </Provider>
    );
  };

  it('should initialize with default empty state', async () => {
    const { getByTestId } = await renderWithProvider();
    expect(getByTestId('token').props.children).toBe('null');
    expect(getByTestId('email').props.children).toBe('null');
    expect(getByTestId('errorMessage').props.children).toBe('null');
  });

  it('should allow adding and clearing manual error messages', async () => {
    const { getByTestId } = await renderWithProvider();

    // Add error
    await fireEvent.press(getByTestId('addErrorBtn'));
    expect(getByTestId('errorMessage').props.children).toBe('Custom Error');

    // Clear error
    await fireEvent.press(getByTestId('clearErrorBtn'));
    expect(getByTestId('errorMessage').props.children).toBe('null');
  });

  it('should restore token from SecureStore on tryLocalSignIn if exists', async () => {
    await SecureStore.setItemAsync('token', 'saved-jwt-token');
    const { getByTestId } = await renderWithProvider();

    await fireEvent.press(getByTestId('tryLocalBtn'));

    expect(getByTestId('token').props.children).toBe('saved-jwt-token');
    expect(navigate).toHaveBeenCalledWith('Home');
  });

  it('should navigate to SignIn on tryLocalSignIn if no token exists', async () => {
    const { getByTestId } = await renderWithProvider();

    await fireEvent.press(getByTestId('tryLocalBtn'));

    expect(getByTestId('token').props.children).toBe('null');
    expect(navigate).toHaveBeenCalledWith('SignIn');
  });

  it('should handle signInWithGoogle successfully', async () => {
    const mockResponse = {
      data: {
        token: 'google-jwt-token',
        user: { email: 'google@test.com' },
      },
    };
    axiosApi.post.mockResolvedValueOnce(mockResponse);

    const { getByTestId } = await renderWithProvider();

    await fireEvent.press(getByTestId('googleBtn'));

    expect(axiosApi.post).toHaveBeenCalledWith('/auth/google-login', { idToken: 'g-id-token' });
    expect(getByTestId('token').props.children).toBe('google-jwt-token');
    expect(getByTestId('email').props.children).toBe('google@test.com');
    
    const savedToken = await SecureStore.getItemAsync('token');
    expect(savedToken).toBe('google-jwt-token');
    expect(navigate).toHaveBeenCalledWith('Resolver');
  });

  it('should handle signInWithGoogle failure with error message', async () => {
    const mockError = {
      response: {
        data: { error: 'Invalid Google Token' },
      },
    };
    axiosApi.post.mockRejectedValueOnce(mockError);

    const { getByTestId } = await renderWithProvider();

    await fireEvent.press(getByTestId('googleBtn'));

    expect(getByTestId('token').props.children).toBe('null');
    expect(getByTestId('errorMessage').props.children).toBe('Invalid Google Token');
  });

  it('should handle signInWithApple successfully', async () => {
    const mockResponse = {
      data: {
        token: 'apple-jwt-token',
        user: { email: 'apple@test.com' },
      },
    };
    axiosApi.post.mockResolvedValueOnce(mockResponse);

    const { getByTestId } = await renderWithProvider();

    await fireEvent.press(getByTestId('appleBtn'));

    expect(axiosApi.post).toHaveBeenCalledWith('/auth/apple-login', {
      identityToken: 'a-id-token',
      email: 'user@apple.com',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(getByTestId('token').props.children).toBe('apple-jwt-token');
    expect(getByTestId('email').props.children).toBe('apple@test.com');

    const savedToken = await SecureStore.getItemAsync('token');
    expect(savedToken).toBe('apple-jwt-token');
    expect(navigate).toHaveBeenCalledWith('Home');
  });

  it('should handle signOut correctly', async () => {
    await SecureStore.setItemAsync('token', 'token-to-delete');
    const { getByTestId } = await renderWithProvider();

    await fireEvent.press(getByTestId('signOutBtn'));

    const savedToken = await SecureStore.getItemAsync('token');
    expect(savedToken).toBeNull();
    expect(getByTestId('token').props.children).toBe('null');
    expect(navigate).toHaveBeenCalledWith('Resolver');
  });
});
