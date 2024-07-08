import Rahayu from './index.js';
import path from 'path';

// Example usage
async function exampleUsage() {
  // Paths to your RSA keys (replace with actual paths or URLs)
  const publicKeyPath = path.resolve('./public_key.pem');
  const privateKeyPath = path.resolve('./private_key.pem');

  // Initialize Rahayu instance with RSA keys and generate AES key internally
  const rahayu = new Rahayu(publicKeyPath, privateKeyPath);

  try {
    // Encrypt data using internally generated AES key
    const plaintext = 'Sensitive information';
    const { encryptedData, iv, authTag } = await rahayu.encryptData(plaintext);

    console.log('Encrypted Data:', encryptedData);
    console.log('Initialization Vector (IV):', iv.toString('base64'));
    console.log('Authentication Tag (authTag):', authTag.toString('base64'));

    // Decrypt data using internally generated AES key, IV, and authTag
    const decryptedData = await rahayu.decryptData(encryptedData, iv, authTag);
    console.log('Decrypted Data:', decryptedData);
  } catch (error) {
    console.error('Error:', error);
  }
}
// Execute example
exampleUsage();
