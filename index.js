const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const publicKeyPath = path.join(__dirname, 'keys', 'public.pem');
const privateKeyPath = path.join(__dirname, 'keys', 'private.pem');

const AES_KEY_LENGTH = 32; // 256-bit AES key
const AES_IV_LENGTH = 16;  // 16 bytes IV for GCM
const RSA_KEY_BITS = 8192; // 8192-bit RSA key

// Fungsi untuk menghasilkan kunci AES dan IV
function generateAESKeyAndIV() {
  return {
    key: crypto.randomBytes(AES_KEY_LENGTH),
    iv: crypto.randomBytes(AES_IV_LENGTH)
  };
}

// Fungsi untuk mengenkripsi data dengan AES-GCM
function encryptWithAES(data, aesKey, iv) {
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return { encryptedData: encrypted, authTag };
}

// Fungsi untuk mengenkripsi kunci AES dengan RSA-OAEP
async function encryptAESKeyWithRSA(aesKey, publicKey) {
  const encryptedBuffer = await crypto.publicEncrypt({
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha512'
  }, aesKey);
  return encryptedBuffer.toString('base64');
}

// Fungsi untuk mendekripsi kunci AES dengan RSA-OAEP
async function decryptAESKeyWithRSA(encryptedAESKey, privateKey) {
  const encryptedBuffer = Buffer.from(encryptedAESKey, 'base64');
  return crypto.privateDecrypt({
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha512'
  }, encryptedBuffer);
}

// Fungsi untuk mendekripsi data dengan AES-GCM
function decryptWithAES(encryptedData, aesKey, iv, authTag) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Fungsi untuk mengenkripsi payload
async function encrypt(data) {
  try {
    const publicKey = await fs.readFile(publicKeyPath, 'utf8');

    // Generate AES key dan IV
    const { key: aesKey, iv } = generateAESKeyAndIV();

    // Enkripsi data dengan AES-GCM
    const { encryptedData, authTag } = encryptWithAES(data, aesKey, iv);

    // Enkripsi kunci AES dengan RSA-OAEP
    const encryptedAESKey = await encryptAESKeyWithRSA(aesKey, publicKey);

    // Gabungkan hasil enkripsi
    return JSON.stringify({
      encryptedData,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      encryptedAESKey
    });
  } catch (err) {
    console.error('Error during encryption:', err);
    throw err;
  }
}

// Fungsi untuk mendekripsi payload
async function decrypt(encryptedPayload) {
  try {
    const privateKey = await fs.readFile(privateKeyPath, 'utf8');
    const payload = JSON.parse(encryptedPayload);

    // Dekripsi kunci AES dengan RSA-OAEP
    const aesKey = await decryptAESKeyWithRSA(payload.encryptedAESKey, privateKey);

    // Dekripsi data dengan AES-GCM
    return decryptWithAES(
      payload.encryptedData,
      aesKey,
      Buffer.from(payload.iv, 'base64'),
      Buffer.from(payload.authTag, 'base64')
    );
  } catch (err) {
    console.error('Error during decryption:', err);
    throw err;
  }
}

module.exports = {
  encrypt,
  decrypt
};
