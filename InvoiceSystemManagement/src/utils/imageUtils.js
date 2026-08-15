import { File } from 'expo-file-system';

/**
 * Formats a size in bytes to a human-readable string (B, KB, MB).
 * @param {number} bytes - The weight in bytes
 * @returns {string} Formatted string
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obtains the size of a local file URI directly through the filesystem,
 * using the new class-based expo-file-system API (SDK 54+).
 * @param {string} uri - Local file URI
 * @returns {Promise<number>} Weight in bytes
 */
export const getLocalFileSize = async (uri) => {
  try {
    const file = new File(uri);
    return file.exists ? file.size : 0;
  } catch (error) {
    console.error('Error calculating local file size:', error);
    return 0;
  }
};

/**
 * Processes a scanned image URI, obtains its binary file details,
 * and formats it for multipart/form-data upload.
 * @param {string} uri - The cropped image URI
 * @returns {Promise<object>} Processed details: uri, size, formattedSize, file object for FormData
 */
export const processImageForUpload = async (uri) => {
  const inputSizeBytes = await getLocalFileSize(uri);
  const formattedSize = formatBytes(inputSizeBytes);

  const fileToUpload = {
    uri: uri,
    name: 'scanned_document.jpg',
    type: 'image/jpeg',
  };

  return {
    uri,
    size: inputSizeBytes,
    formattedSize,
    fileToUpload,
  };
};