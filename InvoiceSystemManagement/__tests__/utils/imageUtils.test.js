import {
  formatBytes,
  getLocalFileSize,
  processImageForUpload,
} from '../../src/utils/imageUtils';

describe('imageUtils unit tests', () => {
  describe('formatBytes', () => {
    it('should return "0 B" for 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('should return "0 B" for null or undefined or NaN values', () => {
      expect(formatBytes(null)).toBe('0 B');
      expect(formatBytes(undefined)).toBe('0 B');
      expect(formatBytes(NaN)).toBe('0 B');
    });

    it('should format bytes correctly to KB', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(51200)).toBe('50 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format bytes correctly to MB', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(5242880)).toBe('5 MB');
    });

    it('should format bytes correctly to GB', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('getLocalFileSize', () => {
    it('should return the mocked file size for a valid local file', async () => {
      const size = await getLocalFileSize('file://some-image.jpg');
      expect(size).toBe(1048576); // 1 MB as configured in the setup mock
    });

    it('should return 0 if an error occurs', async () => {
      // Temporarily mock console.error to avoid cluttered log output in tests
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Triggering error by passing invalid parameter or throwing class error
      jest.spyOn(console, 'error');
      
      // Mock File class to throw error on instantation
      const FileSystem = require('expo-file-system');
      const originalFile = FileSystem.File;
      FileSystem.File = jest.fn().mockImplementation(() => {
        throw new Error('FS Error');
      });

      const size = await getLocalFileSize('file://some-error.jpg');
      expect(size).toBe(0);
      expect(console.error).toHaveBeenCalled();

      // Restore
      FileSystem.File = originalFile;
      console.error = originalConsoleError;
    });
  });

  describe('processImageForUpload', () => {
    it('should calculate local file details and prepare multipart upload structure', async () => {
      const uri = 'file://some-scanned-document.jpg';
      const result = await processImageForUpload(uri);

      expect(result.uri).toBe(uri);
      expect(result.size).toBe(1048576);
      expect(result.formattedSize).toBe('1 MB');
      expect(result.fileToUpload).toEqual({
        uri: uri,
        name: 'scanned_document.jpg',
        type: 'image/jpeg',
      });
    });
  });
});
