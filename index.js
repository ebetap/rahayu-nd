import crypto from 'crypto';
import fs from 'fs';
import axios from 'axios';
import winston from 'winston';

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

export default class Rahayu {
  static DEFAULT_AES_KEY_LENGTH = 32; // 256-bit AES key
  static DEFAULT_AES_IV_LENGTH = 12; // 12 bytes IV for AES-GCM
  static DEFAULT_RSA_KEY_BITS = 4096; // 8192-bit RSA key
  static AES_ALGORITHM = 'aes-256-gcm';
  static UTF8_ENCODING = 'utf8';

  constructor(publicKeyPathOrUrl, privateKeyPathOrUrl, options = {}) {
    this.publicKeyPathOrUrl = publicKeyPathOrUrl;
    this.privateKeyPathOrUrl = privateKeyPathOrUrl;
    this.aesKeyLength = options.aesKeyLength || Rahayu.DEFAULT_AES_KEY_LENGTH;
    this.aesIvLength = options.aesIvLength || Rahayu.DEFAULT_AES_IV_LENGTH;
    this.rsaKeyBits = options.rsaKeyBits || Rahayu.DEFAULT_RSA_KEY_BITS;
    this.logger = options.logger || Rahayu.createDefaultLogger();
    this.encryptionAlgorithm = options.encryptionAlgorithm || Rahayu.AES_ALGORITHM;

    // Generate AES key if not provided
    if (!options.aesKey) {
      this.aesKey = crypto.randomBytes(this.aesKeyLength);
    } else {
      this.aesKey = Buffer.from(options.aesKey, 'base64'); // Ensure it's a Buffer
    }
  }

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

  async fetchKey(url) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      this.logger.error(`Failed to fetch key from ${url}: ${err.message}`, { stack: err.stack });
      throw new Error(`Failed to fetch key from ${url}: ${err.message}`);
    }
  }

  async validatePathOrUrl(pathOrUrl) {
    try {
      if (pathOrUrl.startsWith('http')) {
        await axios.head(pathOrUrl);
      } else {
        await fs.promises.access(pathOrUrl, fs.constants.F_OK);
      }
    } catch (err) {
      throw new InvalidPathError(`Invalid file path or URL: ${pathOrUrl}`);
    }
  }

  async getKey(pathOrUrl) {
    try {
      if (pathOrUrl.startsWith('http')) {
        return await this.fetchKey(pathOrUrl);
      } else {
        return await fs.promises.readFile(pathOrUrl, Rahayu.UTF8_ENCODING);
      }
    } catch (err) {
      throw new Error(`Failed to get key from ${pathOrUrl}: ${err.message}`);
    }
  }

  async encryptData(data) {
    try {
      const iv = crypto.randomBytes(this.aesIvLength);
      const cipher = crypto.createCipheriv(this.encryptionAlgorithm, this.aesKey, iv);
      let encryptedData = cipher.update(data, Rahayu.UTF8_ENCODING, 'base64');
      encryptedData += cipher.final('base64');
      const authTag = cipher.getAuthTag();
      return {
        encryptedData,
        iv,
        authTag, // Return authTag along with encrypted data and IV
      };
    } catch (err) {
      throw new EncryptionError(`Failed to encrypt data: ${err.message}`);
    }
  }

  async decryptData(encryptedData, iv, authTag) {
    try {
      const decipher = crypto.createDecipheriv(this.encryptionAlgorithm, this.aesKey, iv);
      decipher.setAuthTag(authTag); // Set the authentication tag
      let decryptedData = decipher.update(encryptedData, 'base64', Rahayu.UTF8_ENCODING);
      decryptedData += decipher.final(Rahayu.UTF8_ENCODING);
      return decryptedData;
    } catch (err) {
      throw new DecryptionError(`Failed to decrypt data: ${err.message}`);
    }
  }

  async encryptAESKeyWithRSA() {
    try {
      const publicKey = await this.getKey(this.publicKeyPathOrUrl);
      const encryptedBuffer = await crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha512'
      }, this.aesKey);
      return encryptedBuffer.toString('base64');
    } catch (err) {
      throw new EncryptionError(`Failed to encrypt AES key: ${err.message}`);
    }
  }

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
