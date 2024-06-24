import { promises as crypto } from 'crypto';
import { promises as fs } from 'fs';
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
  static DEFAULT_AES_IV_LENGTH = 16; // 16 bytes IV for GCM
  static DEFAULT_RSA_KEY_BITS = 8192; // 8192-bit RSA key
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
      if (typeof pathOrUrl !== 'string') {
        throw new InvalidPathError(`Invalid path or URL: ${pathOrUrl}`);
      }

      if (pathOrUrl.startsWith('http')) {
        await axios.head(pathOrUrl);
      } else {
        await fs.access(pathOrUrl);
      }
    } catch (err) {
      throw new InvalidPathError(`Invalid file path or URL: ${pathOrUrl}`);
    }
  }

  async getKey(pathOrUrl) {
    try {
      await this.validatePathOrUrl(pathOrUrl);

      if (pathOrUrl.startsWith('http')) {
        return await this.fetchKey(pathOrUrl);
      } else {
        return await fs.readFile(pathOrUrl, Rahayu.UTF8_ENCODING);
      }
    } catch (err) {
      throw new Error(`Failed to get key from ${pathOrUrl}: ${err.message}`);
    }
  }

  async encryptAESKeyWithRSA(aesKey) {
    try {
      if (!Buffer.isBuffer(aesKey)) {
        throw new EncryptionError('AES key must be a Buffer');
      }

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

  async decryptAESKeyWithRSA(encryptedAESKey) {
    try {
      if (typeof encryptedAESKey !== 'string') {
        throw new DecryptionError('Encrypted AES key must be a string');
      }

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
