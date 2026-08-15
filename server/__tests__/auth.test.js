import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import appleSignin from 'apple-signin-auth';
import { OAuth2Client } from 'google-auth-library';

// 1. Set up spies on the imported modules immediately (before importing app)
const connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
const appleSpy = jest.spyOn(appleSignin, 'verifyIdToken').mockImplementation(() => {});
const googleSpy = jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockImplementation(() => {});

// 2. Dynamically import app so that it uses the spied connect method
const { default: app } = await import('../src/index.js');
import User from '../src/models/User.js';

describe('AuthRoutes API', () => {
  let findOneSpy;
  let saveSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset our spies to default behavior
    connectSpy.mockResolvedValue(mongoose);
    
    // Spy on User.findOne and User.prototype.save
    findOneSpy = jest.spyOn(User, 'findOne');
    saveSpy = jest.spyOn(User.prototype, 'save');
  });

  afterEach(() => {
    findOneSpy.mockRestore();
    saveSpy.mockRestore();
  });

  describe('POST /auth/apple-login', () => {
    it('should successfully register a new user with Apple', async () => {
      // Mock appleSignin.verifyIdToken
      appleSpy.mockResolvedValue({
        sub: 'apple-user-123',
        email: 'apple@example.com'
      });

      // User.findOne returns null (new user)
      findOneSpy.mockResolvedValue(null);

      // User.prototype.save returns success
      saveSpy.mockImplementation(function() {
        return Promise.resolve(this);
      });

      const response = await request(app)
        .post('/auth/apple-login')
        .send({ identityToken: 'valid-apple-token', name: 'Apple User' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('apple@example.com');
      expect(response.body.user.name).toBe('Apple User');
      expect(response.body.user.id).toMatch(/^[0-9a-fA-F]{24}$/);

      expect(appleSpy).toHaveBeenCalledWith('valid-apple-token', expect.any(Object));
      expect(findOneSpy).toHaveBeenCalledWith({ appleId: 'apple-user-123' });
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should successfully login an existing user with Apple and update email if needed', async () => {
      appleSpy.mockResolvedValue({
        sub: 'apple-user-123',
        email: 'new-apple-email@example.com'
      });

      const existingUser = new User({
        _id: '507f1f77bcf86cd799439011',
        appleId: 'apple-user-123',
        email: 'old@example.com',
        name: 'Apple User',
        isVerified: false
      });

      findOneSpy.mockResolvedValue(existingUser);
      saveSpy.mockImplementation(function() {
        return Promise.resolve(this);
      });

      const response = await request(app)
        .post('/auth/apple-login')
        .send({ identityToken: 'valid-apple-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('new-apple-email@example.com');
      expect(response.body.user.id).toBe('507f1f77bcf86cd799439011');
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should return 422 if identityToken is missing', async () => {
      const response = await request(app)
        .post('/auth/apple-login')
        .send({ name: 'Apple User' });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('Identity token is required.');
    });

    it('should return 401 if apple token verification fails', async () => {
      appleSpy.mockRejectedValue(new Error('Invalid Apple Token'));

      const response = await request(app)
        .post('/auth/apple-login')
        .send({ identityToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Unable to sign in with Apple');
    });

    it('should register a new user with null email when Apple does not return one', async () => {
      // Apple only sends email on the user's very first authorization —
      // subsequent logins omit it. This must not crash and must store null.
      appleSpy.mockResolvedValue({
        sub: 'apple-user-456',
        email: undefined
      });

      findOneSpy.mockResolvedValue(null);
      saveSpy.mockImplementation(function() {
        return Promise.resolve(this);
      });

      const response = await request(app)
        .post('/auth/apple-login')
        .send({ identityToken: 'valid-apple-token', name: 'No Email User' });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBeNull();
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should not update or save an existing Apple user when no email is returned', async () => {
      appleSpy.mockResolvedValue({
        sub: 'apple-user-123',
        email: undefined // Apple omitted it this time
      });

      const existingUser = new User({
        _id: '507f1f77bcf86cd799439011',
        appleId: 'apple-user-123',
        email: 'already-have-this@example.com',
        name: 'Apple User',
        isVerified: true
      });

      findOneSpy.mockResolvedValue(existingUser);
      saveSpy.mockImplementation(function() {
        return Promise.resolve(this);
      });

      const response = await request(app)
        .post('/auth/apple-login')
        .send({ identityToken: 'valid-apple-token' });

      expect(response.status).toBe(200);
      // Email should be untouched, and save() should NOT be called since
      // the else-if condition (tokenEmail && email !== tokenEmail) is false.
      expect(response.body.user.email).toBe('already-have-this@example.com');
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should not save an existing Apple user when the returned email is unchanged', async () => {
      appleSpy.mockResolvedValue({
        sub: 'apple-user-123',
        email: 'same@example.com'
      });

      const existingUser = new User({
        _id: '507f1f77bcf86cd799439011',
        appleId: 'apple-user-123',
        email: 'same@example.com', // identical to what Apple returns
        name: 'Apple User',
        isVerified: true
      });

      findOneSpy.mockResolvedValue(existingUser);
      saveSpy.mockImplementation(function() {
        return Promise.resolve(this);
      });

      const response = await request(app)
        .post('/auth/apple-login')
        .send({ identityToken: 'valid-apple-token' });

      expect(response.status).toBe(200);
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/google-login', () => {
    it('should successfully register a new user with Google', async () => {
      googleSpy.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-user-123',
          email: 'google@example.com',
          name: 'Google User',
          picture: 'https://example.com/pic.jpg'
        })
      });

      findOneSpy.mockResolvedValue(null);
      saveSpy.mockImplementation(function() {
        return Promise.resolve(this);
      });

      const response = await request(app)
        .post('/auth/google-login')
        .send({ idToken: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('google@example.com');
      expect(response.body.user.name).toBe('Google User');
      expect(response.body.user.id).toMatch(/^[0-9a-fA-F]{24}$/);
      expect(findOneSpy).toHaveBeenCalledWith({ googleId: 'google-user-123' });
    });

    it('should successfully login an existing user with Google', async () => {
      googleSpy.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-user-123',
          email: 'google@example.com',
          name: 'Google User',
          picture: 'https://example.com/pic.jpg'
        })
      });

      const existingUser = new User({
        _id: '507f1f77bcf86cd799439011',
        googleId: 'google-user-123',
        email: 'google@example.com',
        name: 'Google User',
        isVerified: true
      });

      findOneSpy.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/auth/google-login')
        .send({ idToken: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.id).toBe('507f1f77bcf86cd799439011');
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should return 422 if idToken is missing', async () => {
      const response = await request(app)
        .post('/auth/google-login')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('ID token is required.');
    });

    it('should return 401 if google token verification fails', async () => {
      googleSpy.mockRejectedValue(new Error('Invalid Google Token'));

      const response = await request(app)
        .post('/auth/google-login')
        .send({ idToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Unable to sign in with Google');
    });

    it('should register a new Google user with null email when the payload omits it', async () => {
      googleSpy.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-user-789',
          email: undefined,
          name: 'No Email Google User',
          picture: 'https://example.com/pic.jpg'
        })
      });

      findOneSpy.mockResolvedValue(null);
      saveSpy.mockImplementation(function() {
        return Promise.resolve(this);
      });

      const response = await request(app)
        .post('/auth/google-login')
        .send({ idToken: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBeNull();
      expect(saveSpy).toHaveBeenCalled();
    });
  });
});

import request from 'supertest';