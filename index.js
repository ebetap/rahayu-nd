import crypto from 'crypto';
import fs from 'fs';
import axios from 'axios';
import winston from 'winston';

// Custom error classes for better error handling
class EncryptionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EncryptionError';
  }
}

class DecryptionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DecryptionError';
  }
}

class InvalidPathError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidPathError';
  }
}

/**
 * Class for handling cryptographic operations including AES encryption/decryption and RSA key management.
 * @class
 */
export default class Rahayu {
  static DEFAULT_AES_KEY_LENGTH = 32; // 256-bit AES key
  static DEFAULT_AES_IV_LENGTH = 12;  // 12 bytes IV for AES-GCM
  static DEFAULT_RSA_KEY_BITS = 4096; // 8192-bit RSA key
  static AES_ALGORITHM = 'aes-256-gcm';
  static UTF8_ENCODING = 'utf8';

  /**
   * @constructor
   * @param {string} publicKeyPathOrUrl - Path or URL to the public RSA key.
   * @param {string} privateKeyPathOrUrl - Path or URL to the private RSA key.
   * @param {Object} [options] - Additional options.
   * @param {number} [options.aesKeyLength] - Length of AES key in bytes.
   * @param {number} [options.aesIvLength] - Length of AES IV in bytes.
   * @param {number} [options.rsaKeyBits] - Number of bits for RSA key.
   * @param {Object} [options.logger] - Winston logger instance.
   * @param {string} [options.encryptionAlgorithm] - Encryption algorithm (default: AES-256-GCM).
   */
  constructor(publicKeyPathOrUrl, privateKeyPathOrUrl, options = {}) {
    this.publicKeyPathOrUrl = publicKeyPathOrUrl;
    this.privateKeyPathOrUrl = privateKeyPathOrUrl;
    this.aesKeyLength = options.aesKeyLength || Rahayu.DEFAULT_AES_KEY_LENGTH;
    this.aesIvLength = options.aesIvLength || Rahayu.DEFAULT_AES_IV_LENGTH;
    this.rsaKeyBits = options.rsaKeyBits || Rahayu.DEFAULT_RSA_KEY_BITS;
    this.logger = options.logger || Rahayu.createDefaultLogger();
    this.encryptionAlgorithm = options.encryptionAlgorithm || Rahayu.AES_ALGORITHM;
  }

  /**
   * Creates a default Winston logger instance.
   * @returns {Object} - Winston logger instance.
   */
  static createDefaultLogger() {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
      ],
    });
  }

  /**
   * Fetches a key from a given URL.
   * @param {string} url - URL to fetch the key from.
   * @returns {Promise<string>} - Resolves with the fetched key.
   * @throws {Error} - If fetching the key fails.
   */
  async fetchKey(url) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      this.logger.error(`Failed to fetch key from ${url}: ${err.message}`, { stack: err.stack });
      throw new Error(`Failed to fetch key from ${url}: ${err.message}`);
    }
  }

  /**
   * Validates if the given path or URL is accessible.
   * @param {string} pathOrUrl - File path or URL to validate.
   * @returns {Promise<void>} - Resolves if path or URL is valid.
   * @throws {InvalidPathError} - If path or URL is invalid.
   */
  async validatePathOrUrl(pathOrUrl) {
    try {
      if (pathOrUrl.startsWith('http')) {
        await axios.head(pathOrUrl);
      } else {
        await fs.access(pathOrUrl);
      }
    } catch (err) {
      throw new InvalidPathError(`Invalid file path or URL: ${pathOrUrl}`);
    }
  }

  /**
   * Retrieves a key from file path or URL.
   * @param {string} pathOrUrl - File path or URL to retrieve the key from.
   * @returns {Promise<string>} - Resolves with the retrieved key.
   * @throws {Error} - If failed to retrieve the key.
   */
  async getKey(pathOrUrl) {
    try {
      if (pathOrUrl.startsWith('http')) {
        return await this.fetchKey(pathOrUrl);
      } else {
        return await fs.readFileSync(pathOrUrl, Rahayu.UTF8_ENCODING);
      }
    } catch (err) {
      throw new Error(`Failed to get key from ${pathOrUrl}: ${err.message}`);
    }
  }

  /**
   * Encrypts the AES key using RSA-OAEP.
   * @param {Buffer} aesKey - AES key to encrypt.
   * @returns {Promise<string>} - Resolves with the base64-encoded encrypted AES key.
   * @throws {EncryptionError} - If encryption fails.
   */
  async encryptAESKeyWithRSA(aesKey) {
    try {
      const publicKey = await this.getKey(this.publicKeyPathOrUrl);
      const encryptedBuffer = await crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha512'
      }, aesKey);
      return encryptedBuffer.toString('base64');
    } catch (err) {
      throw new EncryptionError(`Failed to encrypt AES key: ${err.message}`);
    }
  }

  /**
   * Decrypts the AES key using RSA-OAEP.
   * @param {string} encryptedAESKey - Base64-encoded encrypted AES key.
   * @returns {Promise<Buffer>} - Resolves with the decrypted AES key.
   * @throws {DecryptionError} - If decryption fails.
   */
  async decryptAESKeyWithRSA(encryptedAESKey) {
    try {
      const privateKey = await this.getKey(this.privateKeyPathOrUrl);
      const encryptedBuffer = Buffer.from(encryptedAESKey, 'base64');
      return await crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha512'
      }, encryptedBuffer);
    } catch (err) {
      throw new DecryptionError(`Failed to decrypt AES key: ${err.message}`);
    }
  }
}