### `rajendra-hayuningrat`
Sesuatu itu akan mencapai kesempurnaan awal mulanya harus di pisahkan terlebih-dahulu untuk belajar memperbaiki diri masing-masing. Namun itu hanya sementara. setelah yang di pisahkan itu mengupgrade dirinya sendiri suatu saat akan di satukan kembali kalau sudah selaras.

Modul ini menyediakan metode enkripsi dan dekripsi menggunakan algoritma AES-GCM untuk enkripsi data dan RSA-OAEP untuk enkripsi kunci AES, menggunakan Node.js `crypto` library.

### Background Concept and Flow

**Background Concept:**
The `Rahayu` class is designed to facilitate cryptographic operations using AES encryption/decryption and RSA key management in Node.js applications. It provides functionalities to securely encrypt and decrypt data, manage RSA keys from files or URLs, and handle errors and logging effectively.

#### Overview
The `Rahayu` class provides functionalities for symmetric and asymmetric encryption using AES and RSA algorithms, respectively. It supports key management from local files or remote URLs and includes error handling and logging capabilities.

#### Constructor
```javascript
/**
 * Creates an instance of Rahayu for encryption and decryption operations.
 * @param {string} publicKeyPathOrUrl - Path or URL to the RSA public key.
 * @param {string} privateKeyPathOrUrl - Path or URL to the RSA private key.
 * @param {Object} [options] - Optional parameters.
 * @param {number} [options.aesKeyLength=32] - Length of AES key in bytes.
 * @param {number} [options.aesIvLength=12] - Length of AES initialization vector (IV) in bytes.
 * @param {number} [options.rsaKeyBits=4096] - Number of bits for RSA key size.
 * @param {Object} [options.logger] - Custom logger (default uses Winston).
 * @param {string} [options.encryptionAlgorithm='aes-256-gcm'] - Encryption algorithm to use (default AES-256-GCM).
 */
constructor(publicKeyPathOrUrl, privateKeyPathOrUrl, options = {}) { ... }
```

#### Properties
- `aesKeyLength`: Length of AES key in bytes.
- `aesIvLength`: Length of AES initialization vector (IV) in bytes.
- `rsaKeyBits`: Number of bits for RSA key size.
- `encryptionAlgorithm`: Encryption algorithm used (default is AES-256-GCM).
- `logger`: Logger instance for logging events.

#### Methods

##### `fetchKey(url)`
```javascript
/**
 * Fetches a key from a given URL.
 * @param {string} url - URL to fetch the key from.
 * @returns {Promise<string>} - Resolves with the fetched key data.
 * @throws {Error} - If fetching the key fails.
 */
async fetchKey(url) { ... }
```

##### `validatePathOrUrl(pathOrUrl)`
```javascript
/**
 * Validates if the provided path or URL exists.
 * @param {string} pathOrUrl - Path or URL to validate.
 * @returns {Promise<void>} - Resolves if path or URL is valid.
 * @throws {InvalidPathError} - If path or URL is invalid.
 */
async validatePathOrUrl(pathOrUrl) { ... }
```

##### `getKey(pathOrUrl)`
```javascript
/**
 * Retrieves the key data from a local file path or URL.
 * @param {string} pathOrUrl - Path or URL to the key.
 * @returns {Promise<string>} - Resolves with the key data as a string.
 * @throws {Error} - If key retrieval fails.
 */
async getKey(pathOrUrl) { ... }
```

##### `encryptData(data)`
```javascript
/**
 * Encrypts provided data using AES-256-GCM encryption.
 * @param {string} data - Data to encrypt.
 * @returns {Promise<Object>} - Resolves with encrypted data, IV, and authentication tag.
 * @throws {EncryptionError} - If encryption fails.
 */
async encryptData(data) { ... }
```

##### `decryptData(encryptedData, iv, authTag)`
```javascript
/**
 * Decrypts AES-256-GCM encrypted data.
 * @param {string} encryptedData - Encrypted data to decrypt.
 * @param {Buffer} iv - Initialization vector used for encryption.
 * @param {Buffer} authTag - Authentication tag associated with encrypted data.
 * @returns {Promise<string>} - Resolves with decrypted data as a string.
 * @throws {DecryptionError} - If decryption fails.
 */
async decryptData(encryptedData, iv, authTag) { ... }
```

##### `encryptAESKeyWithRSA()`
```javascript
/**
 * Encrypts the AES key using RSA public key encryption (RSA_PKCS1_OAEP_PADDING).
 * @returns {Promise<string>} - Resolves with the base64-encoded encrypted AES key.
 * @throws {EncryptionError} - If encryption fails.
 */
async encryptAESKeyWithRSA() { ... }
```

##### `decryptAESKeyWithRSA(encryptedAESKey)`
```javascript
/**
 * Decrypts the AES key using RSA private key decryption (RSA_PKCS1_OAEP_PADDING).
 * @param {string} encryptedAESKey - Base64-encoded encrypted AES key.
 * @returns {Promise<Buffer>} - Resolves with the decrypted AES key as a Buffer.
 * @throws {DecryptionError} - If decryption fails.
 */
async decryptAESKeyWithRSA(encryptedAESKey) { ... }
```

#### Errors
- `EncryptionError`: Thrown when encryption operations fail.
- `DecryptionError`: Thrown when decryption operations fail.
- `InvalidPathError`: Thrown when an invalid file path or URL is provided.

#### Example Usage
```javascript
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
```

### Flow Explanation
1. **Initialization**: Create an instance of `Rahayu` with paths to RSA keys and optional configurations.
2. **Key Management**:
   - Fetch RSA keys from specified paths or URLs.
   - Generate or use provided AES keys for symmetric encryption.
3. **Encryption**:
   - Encrypt data using AES-256-GCM with randomly generated IV and authentication tag.
   - Optionally, encrypt AES keys using RSA public key encryption.
4. **Decryption**:
   - Decrypt AES-encrypted data using AES-256-GCM with provided IV and authentication tag.
   - Decrypt AES keys using RSA private key decryption.
5. **Error Handling**: Custom error classes (`EncryptionError`, `DecryptionError`, `InvalidPathError`) handle specific error scenarios.
6. **Logging**: Uses Winston for logging events and errors to console and a log file.

This documentation outline provides a comprehensive overview of the `Rahayu` class, its functionality, usage examples, and error handling strategies. Adjustments can be made based on specific project needs and additional features.