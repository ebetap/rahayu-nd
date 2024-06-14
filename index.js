const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class RahayuND {
  static AES_KEY_LENGTH = 32; // 256-bit AES key
  static AES_IV_LENGTH = 16;  // 16 bytes IV for GCM
  static RSA_KEY_BITS = 8192; // 8192-bit RSA key

  constructor(publicKeyPath, privateKeyPath) {
    this.publicKeyPath = publicKeyPath;
    this.privateKeyPath = privateKeyPath;
  }

  // Function to generate AES key and IV
  static generateAESKeyAndIV() {
    return {
      key: crypto.randomBytes(RahayuND.AES_KEY_LENGTH),
      iv: crypto.randomBytes(RahayuND.AES_IV_LENGTH)
    };
  }

  // Function to encrypt data with AES-GCM
  static encryptWithAES(data, aesKey, iv) {
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return { encryptedData: encrypted, authTag };
  }

  // Function to encrypt AES key with RSA-OAEP
  async encryptAESKeyWithRSA(aesKey) {
    const publicKey = await fs.readFile(this.publicKeyPath, 'utf8');
    const encryptedBuffer = await crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha512'
    }, aesKey);
    return encryptedBuffer.toString('base64');
  }

  // Function to decrypt AES key with RSA-OAEP
  async decryptAESKeyWithRSA(encryptedAESKey) {
    const privateKey = await fs.readFile(this.privateKeyPath, 'utf8');
    const encryptedBuffer = Buffer.from(encryptedAESKey, 'base64');
    return crypto.privateDecrypt({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha512'
    }, encryptedBuffer);
  }

  // Function to decrypt data with AES-GCM
  static decryptWithAES(encryptedData, aesKey, iv, authTag) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Function to validate file path
  static async validateFilePath(filePath) {
    try {
      await fs.access(filePath);
    } catch (err) {
      throw new Error(`Invalid file path: ${filePath}`);
    }
  }

  // Function to encrypt payload
  async encrypt(data) {
    try {
      // Validate public key file path
      await RahayuND.validateFilePath(this.publicKeyPath);

      // Generate AES key and IV
      const { key: aesKey, iv } = RahayuND.generateAESKeyAndIV();

      // Encrypt data with AES-GCM
      const { encryptedData, authTag } = RahayuND.encryptWithAES(data, aesKey, iv);

      // Encrypt AES key with RSA-OAEP
      const encryptedAESKey = await this.encryptAESKeyWithRSA(aesKey);

      // Combine encrypted results
      return JSON.stringify({
        encryptedData,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        encryptedAESKey
      });
    } catch (err) {
      console.error('Error during encryption:', err.message);
      throw err;
    }
  }

  // Function to decrypt payload
  async decrypt(encryptedPayload) {
    try {
      // Validate private key file path
      await RahayuND.validateFilePath(this.privateKeyPath);

      const payload = JSON.parse(encryptedPayload);

      // Decrypt AES key with RSA-OAEP
      const aesKey = await this.decryptAESKeyWithRSA(payload.encryptedAESKey);

      // Decrypt data with AES-GCM
      return RahayuND.decryptWithAES(
        payload.encryptedData,
        aesKey,
        Buffer.from(payload.iv, 'base64'),
        Buffer.from(payload.authTag, 'base64')
      );
    } catch (err) {
      console.error('Error during decryption:', err.message);
      throw err;
    }
  }
}

module.exports = RahayuND;
