import { promises as fs } from 'fs';
import axios from 'axios';
import winston from 'winston';
import crypto from 'crypto';
import { promisify } from 'util';

// Promisify the necessary crypto methods
const publicEncrypt = promisify(crypto.publicEncrypt);
const privateDecrypt = promisify(crypto.privateDecrypt);
const generateKeyPair = promisify(crypto.generateKeyPair);

class EncryptionError extends Error {
  constructor(message, metadata = {}, originalError = null) {
    super(message);
    this.name = 'EncryptionError';
    this.metadata = metadata;
    this.originalError = originalError;
  }
}

class DecryptionError extends Error {
  constructor(message, metadata = {}, originalError = null) {
    super(message);
    this.name = 'DecryptionError';
    this.metadata = metadata;
    this.originalError = originalError;
  }
}

class InvalidPathError extends Error {
  constructor(message, metadata = {}, originalError = null) {
    super(message);
    this.name = 'InvalidPathError';
    this.metadata = metadata;
    this.originalError = originalError;
  }
}

export default class Rahayu {
  static DEFAULT_AES_KEY_LENGTH = 32; // 256-bit AES key
  static DEFAULT_AES_IV_LENGTH = 16; // 16 bytes IV for GCM
  static DEFAULT_RSA_KEY_BITS = 8192; // 8192-bit RSA key
  static AES_ALGORITHM = 'aes-256-gcm';
  static UTF8_ENCODING = 'utf8';
  static CACHE_EXPIRATION_MS = 600000; // 10 minutes

  constructor(publicKeyPathOrUrl, privateKeyPathOrUrl, options = {}) {
    this.publicKeyPathOrUrl = publicKeyPathOrUrl;
    this.privateKeyPathOrUrl = privateKeyPathOrUrl;
    this.aesKeyLength = options.aesKeyLength || Rahayu.DEFAULT_AES_KEY_LENGTH;
    this.aesIvLength = options.aesIvLength || Rahayu.DEFAULT_AES_IV_LENGTH;
    this.rsaKeyBits = options.rsaKeyBits || Rahayu.DEFAULT_RSA_KEY_BITS;
    this.logger = options.logger || Rahayu.createDefaultLogger();
    this.encryptionAlgorithm = options.encryptionAlgorithm || Rahayu.AES_ALGORITHM;
    this.keyCache = {};
  }

  static createDefaultLogger() {
    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: process.env.LOG_FILE || 'app.log' })
      ],
    });
  }

  async fetchKey(url) {
    this.logger.info(`Fetching key from URL: ${url}`);
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      this.logger.error(`Failed to fetch key from ${url}: ${err.message}`, { stack: err.stack });
      throw new EncryptionError(`Failed to fetch key from ${url}: ${err.message}`, { url }, err);
    }
  }

  async validatePathOrUrl(pathOrUrl) {
    this.logger.info(`Validating path or URL: ${pathOrUrl}`);
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
      throw new InvalidPathError(`Invalid file path or URL: ${pathOrUrl}`, { pathOrUrl }, err);
    }
  }

  async getKey(pathOrUrl) {
    this.logger.info(`Retrieving key from: ${pathOrUrl}`);
    if (this.keyCache[pathOrUrl] && (Date.now() - this.keyCache[pathOrUrl].timestamp < Rahayu.CACHE_EXPIRATION_MS)) {
      this.logger.info(`Using cached key for: ${pathOrUrl}`);
      return this.keyCache[pathOrUrl].key;
    }

    try {
      await this.validatePathOrUrl(pathOrUrl);

      let key;
      if (pathOrUrl.startsWith('http')) {
        key = await this.fetchKey(pathOrUrl);
      } else {
        key = await fs.readFile(pathOrUrl, Rahayu.UTF8_ENCODING);
      }

      this.keyCache[pathOrUrl] = { key, timestamp: Date.now() };
      return key;
    } catch (err) {
      throw new EncryptionError(`Failed to get key from ${pathOrUrl}: ${err.message}`, { pathOrUrl }, err);
    }
  }

  async encryptAESKeyWithRSA(aesKey) {
    this.logger.info(`Encrypting AES key with RSA public key`);
    try {
      if (!Buffer.isBuffer(aesKey)) {
        throw new EncryptionError('AES key must be a Buffer', { aesKey });
      }

      const publicKey = await this.getKey(this.publicKeyPathOrUrl);
      const encryptedBuffer = await publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha512'
      }, aesKey);
      return encryptedBuffer.toString('base64');
    } catch (err) {
      throw new EncryptionError(`Failed to encrypt AES key: ${err.message}`, { aesKey }, err);
    }
  }

  async decryptAESKeyWithRSA(encryptedAESKey) {
    this.logger.info(`Decrypting AES key with RSA private key`);
    try {
      if (typeof encryptedAESKey !== 'string') {
        throw new DecryptionError('Encrypted AES key must be a string', { encryptedAESKey });
      }

      const privateKey = await this.getKey(this.privateKeyPathOrUrl);
      const encryptedBuffer = Buffer.from(encryptedAESKey, 'base64');
      return await privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha512'
      }, encryptedBuffer);
    } catch (err) {
      throw new DecryptionError(`Failed to decrypt AES key: ${err.message}`, { encryptedAESKey }, err);
    }
  }

  async validateRSAKeySize(key, expectedSize) {
    this.logger.info(`Validating RSA key size`);
    const keyDetails = crypto.createPublicKey(key).asymmetricKeyDetails;
    if (keyDetails.modulusLength !== expectedSize) {
      throw new InvalidPathError(`RSA key size does not match the expected size: ${expectedSize}`);
    }
  }

  async encryptData(data, aesKey, iv) {
    this.logger.info(`Encrypting data with AES key`);
    try {
      if (typeof data !== 'string' && !Buffer.isBuffer(data)) {
        throw new EncryptionError('Data must be a string or a Buffer', { data });
      }
      if (!Buffer.isBuffer(aesKey)) {
        throw new EncryptionError('AES key must be a Buffer', { aesKey });
      }
      if (!Buffer.isBuffer(iv)) {
        throw new EncryptionError('IV must be a Buffer', { iv });
      }

      const cipher = crypto.createCipheriv(this.encryptionAlgorithm, aesKey, iv);
      const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
      const authTag = cipher.getAuthTag();

      // Create HMAC for data integrity
      const hmac = crypto.createHmac('sha256', aesKey);
      hmac.update(encrypted);
      const hmacDigest = hmac.digest('base64');

      return {
        encryptedData: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        hmacDigest
      };
    } catch (err) {
      throw new EncryptionError(`Failed to encrypt data: ${err.message}`, { data }, err);
    }
  }

  async decryptData(encryptedData, aesKey, iv, authTag, hmacDigest) {
    this.logger.info(`Decrypting data with AES key`);
    try {
      if (typeof encryptedData !== 'string') {
        throw new DecryptionError('Encrypted data must be a string', { encryptedData });
      }
      if (!Buffer.isBuffer(aesKey)) {
        throw new DecryptionError('AES key must be a Buffer', { aesKey });
      }
      if (!Buffer.isBuffer(iv)) {
        throw new DecryptionError('IV must be a Buffer', { iv });
      }
      if (!Buffer.isBuffer(authTag)) {
        throw new DecryptionError('Auth tag must be a Buffer', { authTag });
      }

      const decipher = crypto.createDecipheriv(this.encryptionAlgorithm, aesKey, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedData, 'base64')),
        decipher.final()
      ]);

      // Verify HMAC for data integrity
      const hmac = crypto.createHmac('sha256', aesKey);
      hmac.update(Buffer.from(encryptedData, 'base64'));
      const hmacVerify = hmac.digest('base64');

      if (hmacVerify !== hmacDigest) {
        throw new DecryptionError('HMAC verification failed', { encryptedData, hmacDigest, hmacVerify });
      }

      return decrypted.toString();
    } catch (err) {
      throw new DecryptionError(`Failed to decrypt data: ${err.message}`, { encryptedData }, err);
    }
  }

  // Method for generating new AES key
  generateAESKey() {
    this.logger.info('Generating new AES key');
    return crypto.randomBytes(this.aesKeyLength);
  }

  // Method for generating new RSA key pair
  async generateRSAKeyPair() {
    this.logger.info('Generating new RSA key pair');
    try {
      const { publicKey, privateKey } = await generateKeyPair('rsa', {
        modulusLength: this.rsaKeyBits,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      return { publicKey, privateKey };
    } catch (err) {
      this.logger.error(`Failed to generate RSA key pair: ${err.message}`, { stack: err.stack });
      throw new EncryptionError(`Failed to generate RSA key pair: ${err.message}`, {}, err);
    }
  }

  // Integration with Cloud Key Management Services (example with AWS KMS)
  async encryptWithAWSKMS(keyId, plaintext) {
    this.logger.info(`Encrypting data with AWS KMS key: ${keyId}`);
    const AWS = require('aws-sdk');
    const kms = new AWS.KMS();

    try {
      const params = {
        KeyId: keyId,
        Plaintext: plaintext
      };
      const { CiphertextBlob } = await kms.encrypt(params).promise();
      return CiphertextBlob.toString('base64');
    } catch (err) {
      this.logger.error(`Failed to encrypt with AWS KMS: ${err.message}`, { stack: err.stack });
      throw new EncryptionError(`Failed to encrypt with AWS KMS: ${err.message}`, { keyId }, err);
    }
  }

  async decryptWithAWSKMS(keyId, ciphertext) {
    this.logger.info(`Decrypting data with AWS KMS key: ${keyId}`);
    const AWS = require('aws-sdk');
    const kms = new AWS.KMS();

    try {
      const params = {
        CiphertextBlob: Buffer.from(ciphertext, 'base64')
      };
      const { Plaintext } = await kms.decrypt(params).promise();
      return Plaintext.toString('utf-8');
    } catch (err) {
      this.logger.error(`Failed to decrypt with AWS KMS: ${err.message}`, { stack: err.stack });
      throw new DecryptionError(`Failed to decrypt with AWS KMS: ${err.message}`, { keyId }, err);
    }
  }

  // Integration with Google Cloud KMS
  async encryptWithGoogleKMS(keyName, plaintext) {
    this.logger.info(`Encrypting data with Google Cloud KMS key: ${keyName}`);
    const { KeyManagementServiceClient } = require('@google-cloud/kms');
    const client = new KeyManagementServiceClient();

    try {
      const [result] = await client.encrypt({
        name: keyName,
        plaintext: Buffer.from(plaintext).toString('base64')
      });

      return result.ciphertext;
    } catch (err) {
      this.logger.error(`Failed to encrypt with Google Cloud KMS: ${err.message}`, { stack: err.stack });
      throw new EncryptionError(`Failed to encrypt with Google Cloud KMS: ${err.message}`, { keyName }, err);
    }
  }

  async decryptWithGoogleKMS(keyName, ciphertext) {
    this.logger.info(`Decrypting data with Google Cloud KMS key: ${keyName}`);
    const { KeyManagementServiceClient } = require('@google-cloud/kms');
    const client = new KeyManagementServiceClient();

    try {
      const [result] = await client.decrypt({
        name: keyName,
        ciphertext
      });

      return Buffer.from(result.plaintext, 'base64').toString('utf-8');
    } catch (err) {
      this.logger.error(`Failed to decrypt with Google Cloud KMS: ${err.message}`, { stack: err.stack });
      throw new DecryptionError(`Failed to decrypt with Google Cloud KMS: ${err.message}`, { keyName }, err);
    }
  }

  // Key rotation mechanism
  async rotateKeys(newPublicKeyPathOrUrl, newPrivateKeyPathOrUrl) {
    this.logger.info('Rotating keys');
    try {
      const newPublicKey = await this.getKey(newPublicKeyPathOrUrl);
      const newPrivateKey = await this.getKey(newPrivateKeyPathOrUrl);

      await this.validateRSAKeySize(newPublicKey, this.rsaKeyBits);
      await this.validateRSAKeySize(newPrivateKey, this.rsaKeyBits);

      this.publicKeyPathOrUrl = newPublicKeyPathOrUrl;
      this.privateKeyPathOrUrl = newPrivateKeyPathOrUrl;

      this.keyCache[this.publicKeyPathOrUrl] = { key: newPublicKey, timestamp: Date.now() };
      this.keyCache[this.privateKeyPathOrUrl] = { key: newPrivateKey, timestamp: Date.now() };

      this.logger.info('Key rotation successful');
    } catch (err) {
      this.logger.error(`Failed to rotate keys: ${err.message}`, { stack: err.stack });
      throw new EncryptionError(`Failed to rotate keys: ${err.message}`, {}, err);
    }
  }

  // Method to securely store and retrieve configuration settings using encryption
  async storeConfig(configData, configPath) {
    this.logger.info(`Storing encrypted configuration to: ${configPath}`);
    try {
      const aesKey = this.generateAESKey();
      const iv = crypto.randomBytes(this.aesIvLength);
      const { encryptedData, authTag, hmacDigest } = await this.encryptData(JSON.stringify(configData), aesKey, iv);

      const encryptedAESKey = await this.encryptAESKeyWithRSA(aesKey);

      const config = {
        encryptedData,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        hmacDigest,
        encryptedAESKey
      };

      await fs.writeFile(configPath, JSON.stringify(config), Rahayu.UTF8_ENCODING);
    } catch (err) {
      this.logger.error(`Failed to store configuration: ${err.message}`, { stack: err.stack });
      throw new EncryptionError(`Failed to store configuration: ${err.message}`, { configPath }, err);
    }
  }

  async retrieveConfig(configPath) {
    this.logger.info(`Retrieving encrypted configuration from: ${configPath}`);
    try {
      const configFile = await fs.readFile(configPath, Rahayu.UTF8_ENCODING);
      const { encryptedData, iv, authTag, hmacDigest, encryptedAESKey } = JSON.parse(configFile);

      const aesKey = await this.decryptAESKeyWithRSA(encryptedAESKey);
      const decryptedConfig = await this.decryptData(
        encryptedData,
        Buffer.from(aesKey),
        Buffer.from(iv, 'base64'),
        Buffer.from(authTag, 'base64'),
        hmacDigest
      );

      return JSON.parse(decryptedConfig);
    } catch (err) {
      this.logger.error(`Failed to retrieve configuration: ${err.message}`, { stack: err.stack });
      throw new DecryptionError(`Failed to retrieve configuration: ${err.message}`, { configPath }, err);
    }
  }

  // Async initialization method to be called after instantiation
  async init() {
    this.logger.info('Initializing Rahayu class');
    const publicKey = await this.getKey(this.publicKeyPathOrUrl);
    const privateKey = await this.getKey(this.privateKeyPathOrUrl);
    await this.validateRSAKeySize(publicKey, this.rsaKeyBits);
    await this.validateRSAKeySize(privateKey, this.rsaKeyBits);
    this.logger.info('Initialization complete');
  }

  // Static async factory method for creating and initializing an instance
  static async createInstance(publicKeyPathOrUrl, privateKeyPathOrUrl, options = {}) {
    const instance = new Rahayu(publicKeyPathOrUrl, privateKeyPathOrUrl, options);
    await instance.init();
    return instance;
  }
}
