// This must be its own test file: it needs to force Platform.OS to two
// different values and re-require axiosApi.js fresh for each, which would
// interfere with any other test suite sharing the same module registry.

describe('axiosApi baseURL selection by platform', () => {
  const androidUrl = 'https://android.example.com';
  const iosUrl = 'https://ios.example.com';

  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_URL_ANDROID = androidUrl;
    process.env.EXPO_PUBLIC_API_URL_IOS = iosUrl;
  });

  it('uses EXPO_PUBLIC_API_URL_ANDROID when Platform.OS is "android"', () => {
    jest.doMock('react-native', () => ({
      ...jest.requireActual('react-native'),
      Platform: { OS: 'android' },
    }));

    const instance = require('../../src/services/axiosApi').default;

    expect(instance.defaults.baseURL).toBe(androidUrl);
  });

  it('uses EXPO_PUBLIC_API_URL_IOS when Platform.OS is "ios"', () => {
    jest.doMock('react-native', () => ({
      ...jest.requireActual('react-native'),
      Platform: { OS: 'ios' },
    }));

    const instance = require('../../src/services/axiosApi').default;

    expect(instance.defaults.baseURL).toBe(iosUrl);
  });

  it('sets the JSON content-type header regardless of platform', () => {
    jest.doMock('react-native', () => ({
      ...jest.requireActual('react-native'),
      Platform: { OS: 'ios' },
    }));

    const instance = require('../../src/services/axiosApi').default;

    expect(instance.defaults.headers['Content-Type']).toBe('application/json');
  });
});