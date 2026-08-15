import React from 'react';

jest.useFakeTimers();

// 1. Mock expo-sqlite with exact asynchronous methods used in src/db/database.js
const mockDatabase = {
  getFirstAsync: jest.fn(),
  execAsync: jest.fn(),
  runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue(mockDatabase),
}));

// Provide access to this mock database globally in tests for assertions
global.mockDb = mockDatabase;

// 2. Mock expo-secure-store with an in-memory key-value store
const mockSecureStore = (() => {
  let store = {};
  return {
    getItemAsync: jest.fn((key) => Promise.resolve(store[key] || null)),
    setItemAsync: jest.fn((key, value) => {
      store[key] = value.toString();
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key) => {
      delete store[key];
      return Promise.resolve();
    }),
    clearMockStore: () => {
      store = {};
    }
  };
})();

jest.mock('expo-secure-store', () => ({
  getItemAsync: mockSecureStore.getItemAsync,
  setItemAsync: mockSecureStore.setItemAsync,
  deleteItemAsync: mockSecureStore.deleteItemAsync,
}));

global.mockSecureStore = mockSecureStore;

// 3. Mock @react-native-google-signin/google-signin
jest.mock('@react-native-google-signin/google-signin', () => {
  return {
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn().mockResolvedValue(true),
      signIn: jest.fn().mockResolvedValue({
        data: {
          idToken: 'mock-google-id-token',
        },
      }),
    },
    isSuccessResponse: jest.fn((response) => !!response?.data?.idToken),
    isErrorWithCode: jest.fn((err) => !!err?.code),
    statusCodes: {
      SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
      IN_PROGRESS: 'IN_PROGRESS',
      PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    },
  };
});

// 4. Mock expo-apple-authentication
jest.mock('expo-apple-authentication', () => {
  return {
    AppleAuthenticationScope: {
      FULL_NAME: 'FULL_NAME',
      EMAIL: 'EMAIL',
    },
    AppleAuthenticationButtonType: {
      SIGN_IN: 'SIGN_IN',
    },
    AppleAuthenticationButtonStyle: {
      WHITE_OUTLINE: 'WHITE_OUTLINE',
    },
    AppleAuthenticationButton: ({ onPress, style }) => {
      const { TouchableOpacity, Text } = require('react-native');
      return (
        <TouchableOpacity onPress={onPress} style={style} testID="AppleSignInButton">
          <Text>Sign in with Apple</Text>
        </TouchableOpacity>
      );
    },
    signInAsync: jest.fn().mockResolvedValue({
      identityToken: 'mock-apple-identity-token',
      email: 'user@apple.com',
      fullName: {
        givenName: 'John',
        familyName: 'Doe',
      },
    }),
  };
});

// 5. Mock expo-file-system Class-based File API
jest.mock('expo-file-system', () => {
  class File {
    constructor(uri) {
      this.uri = uri;
      this.exists = true;
      this.size = 1048576; // 1 MB default mock size
    }
  }
  return {
    File,
  };
});

// 6. Mock react-native-document-scanner-plugin
jest.mock('react-native-document-scanner-plugin', () => {
  return {
    __esModule: true,
    default: {
      scanDocument: jest.fn().mockResolvedValue({
        scannedImages: ['file://mock-scanned-image.jpg'],
      }),
    },
  };
});

// 7. Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  return Reanimated;
});

// 8. Mock react-native-pie-chart
jest.mock('react-native-pie-chart', () => {
  const { View } = require('react-native');
  return ({ children, ...props }) => <View {...props} testID="MockPieChart">{children}</View>;
});

// 9. Mock lucide-react-native and vector icons to prevent SVG/Native layout problems in Jest
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    Mail: (props) => <View {...props} testID="LucideMail" />,
    X: (props) => <View {...props} testID="LucideX" />,
    Send: (props) => <View {...props} testID="LucideSend" />,
  };
});

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: (props) => <Text testID={`Ionicons-${props.name}`}>Ionicons-{props.name}</Text>,
  };
});

// 10. Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
  };
});

// 11. Mock react-native-screens
jest.mock('react-native-screens', () => {
  const { View } = require('react-native');
  return {
    enableScreens: jest.fn(),
    ScreenContainer: View,
    Screen: View,
  };
});

// 12. Mock @react-navigation/native hook behavior safely
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const React = require('react');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      canGoBack: () => true,
    }),
    useFocusEffect: (cb) => {
      React.useEffect(() => {
        cb();
      }, [cb]);
    },
  };
});

// 13. Mock global Alert so we can test validation Dialogs
jest.spyOn(require('react-native').Alert, 'alert');
