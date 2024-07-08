import path from 'path';
import crypto from 'crypto';
import Rahayu from './index.js';

// Define paths to your RSA keys (change paths as per your setup)
const publicKeyPath = path.resolve('./public_key.pem');
const privateKeyPath = path.resolve('./private_key.pem');

// Example data to encrypt
const plaintext = 'Sastra Jendra Hayuningrat Pangruwating Diyu';

async function runExample() {
  try {
    // Create an instance of Rahayu
    const rahayu = new Rahayu(publicKeyPath, privateKeyPath);
    
    // Encrypt data
    const { encryptedAESKey, encryptedData, iv, tag } = await encryptData(rahayu, plaintext);
    console.log('Encrypted result:', { encryptedAESKey, encryptedData, iv, tag });

    // Decrypt data
    const decryptedData = await decryptData(rahayu, encryptedAESKey, encryptedData, iv, tag);
    console.log('Decrypted result:', decryptedData);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function encryptData(rahayu, data) {
  try {
    // Generate a random AES key
    const aesKey = crypto.randomBytes(rahayu.aesKeyLength);
    
    // Encrypt AES key with RSA-OAEP
    const encryptedAESKey = await rahayu.encryptAESKeyWithRSA(aesKey);
    
    // Generate IV
    const iv = crypto.randomBytes(rahayu.aesIvLength);
    
    // Create cipher instance
    const cipher = crypto.createCipheriv(rahayu.encryptionAlgorithm, aesKey, iv);
    
    // Encrypt data
    let encryptedData = cipher.update(data, 'utf8', 'base64');
    encryptedData += cipher.final('base64');
    
    // Get authentication tag
    const tag = cipher.getAuthTag().toString('base64');
    
    return { encryptedAESKey, encryptedData, iv: iv.toString('base64'), tag };
  } catch (error) {
    throw error;
  }
}

async function decryptData(rahayu, encryptedAESKey, encryptedData, iv, tag) {
  try {
    // Decrypt AES key using RSA
    const decryptedAESKey = await rahayu.decryptAESKeyWithRSA(encryptedAESKey);
    
    // Create decipher instance
    const decipher = crypto.createDecipheriv(rahayu.encryptionAlgorithm, decryptedAESKey, Buffer.from(iv, 'base64'));
    
    // Set authentication tag
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    
    // Decrypt data
    let decryptedData = decipher.update(encryptedData, 'base64', 'utf8');
    decryptedData += decipher.final('utf8');
    
    return decryptedData;
  } catch (error) {
    throw error;
  }
}

// Run the example
runExample();
