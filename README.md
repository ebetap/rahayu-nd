### `rajendra-hayuningrat`
penulis bercerita, sesuatu itu akan mencapai kesempurnaan awal mulanya harus di pisahkan terlebih-dahulu untuk belajar memperbaiki diri masing-masing. Namun itu hanya sementara. setelah yang di pisahkan itu mengupgrade dirinya sendiri suatu saat akan di satukan kembali kalau sudah selaras. -Sastra Jendra Hayuningrat Pangruwating Diyu

Modul ini menyediakan metode enkripsi dan dekripsi menggunakan algoritma AES-GCM untuk enkripsi data dan RSA-OAEP untuk enkripsi kunci AES, menggunakan Node.js `crypto` library.

### Background Concept and Flow

**Background Concept:**
The `Rahayu` class is designed to facilitate cryptographic operations using AES encryption/decryption and RSA key management in Node.js applications. It provides functionalities to securely encrypt and decrypt data, manage RSA keys from files or URLs, and handle errors and logging effectively.

**Flow of Operations:**
1. **Initialization (`constructor`)**:
   - Accepts paths or URLs to the public and private RSA keys, along with optional parameters (`options`) such as AES key length, AES IV length, RSA key bits, logger instance, and encryption algorithm.
   - Initializes default values if optional parameters are not provided.

2. **Key Retrieval and Validation:**
   - `validatePathOrUrl(pathOrUrl)`: Validates if a given path or URL is accessible. Uses Axios to check if a URL is reachable or uses `fs.access()` for local file paths. Throws `InvalidPathError` if validation fails.
   - `getKey(pathOrUrl)`: Retrieves a key asynchronously from either a local file path or a URL. Uses `fs.readFile()` for file paths and `axios.get()` for URLs. Handles errors if fetching fails.

3. **Encryption and Decryption:**
   - `encryptAESKeyWithRSA(aesKey)`: Encrypts an AES key using RSA-OAEP encryption. Retrieves the public RSA key, performs encryption, and returns the base64-encoded encrypted AES key.
   - `decryptAESKeyWithRSA(encryptedAESKey)`: Decrypts a base64-encoded AES key using RSA-OAEP decryption. Retrieves the private RSA key, decrypts the AES key, and returns it as a Buffer.

4. **Logging:**
   - `createDefaultLogger()`: Static method that creates a default Winston logger instance configured to log to console and a file (`app.log`). Used for logging errors and information during key fetching, encryption, and decryption operations.

5. **Error Handling:**
   - Custom error classes (`EncryptionError`, `DecryptionError`, `InvalidPathError`) are defined to handle specific types of errors that may occur during cryptographic operations, key validation, or key retrieval.

6. **External Dependencies:**
   - Relies on Node.js `crypto` module for AES encryption/decryption and RSA key management.
   - Uses `axios` for HTTP requests to fetch keys from URLs.
   - Utilizes `fs` module for file system operations like reading files.

### Documentation

#### `Rahayu` Class

##### Constructor

```javascript
/**
 * @class
 * Class for handling cryptographic operations including AES encryption/decryption and RSA key management.
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
constructor(publicKeyPathOrUrl, privateKeyPathOrUrl, options = {}) { ... }
```

##### Methods

- **`validatePathOrUrl(pathOrUrl)`**

  ```javascript
  /**
   * Validates if the given path or URL is accessible.
   * @param {string} pathOrUrl - File path or URL to validate.
   * @returns {Promise<void>} - Resolves if path or URL is valid.
   * @throws {InvalidPathError} - If path or URL is invalid.
   */
  async validatePathOrUrl(pathOrUrl) { ... }
  ```

- **`getKey(pathOrUrl)`**

  ```javascript
  /**
   * Retrieves a key from file path or URL.
   * @param {string} pathOrUrl - File path or URL to retrieve the key from.
   * @returns {Promise<string>} - Resolves with the retrieved key.
   * @throws {Error} - If failed to retrieve the key.
   */
  async getKey(pathOrUrl) { ... }
  ```

- **`encryptAESKeyWithRSA(aesKey)`**

  ```javascript
  /**
   * Encrypts the AES key using RSA-OAEP.
   * @param {Buffer} aesKey - AES key to encrypt.
   * @returns {Promise<string>} - Resolves with the base64-encoded encrypted AES key.
   * @throws {EncryptionError} - If encryption fails.
   */
  async encryptAESKeyWithRSA(aesKey) { ... }
  ```

- **`decryptAESKeyWithRSA(encryptedAESKey)`**

  ```javascript
  /**
   * Decrypts the AES key using RSA-OAEP.
   * @param {string} encryptedAESKey - Base64-encoded encrypted AES key.
   * @returns {Promise<Buffer>} - Resolves with the decrypted AES key.
   * @throws {DecryptionError} - If decryption fails.
   */
  async decryptAESKeyWithRSA(encryptedAESKey) { ... }
  ```

- **`fetchKey(url)`**

  ```javascript
  /**
   * Fetches a key from a given URL.
   * @param {string} url - URL to fetch the key from.
   * @returns {Promise<string>} - Resolves with the fetched key.
   * @throws {Error} - If fetching the key fails.
   */
  async fetchKey(url) { ... }
  ```

- **`createDefaultLogger()`**

  ```javascript
  /**
   * Creates a default Winston logger instance.
   * @returns {Object} - Winston logger instance.
   */
  static createDefaultLogger() { ... }
  ```

##### Constants

- **`DEFAULT_AES_KEY_LENGTH`**, **`DEFAULT_AES_IV_LENGTH`**, **`DEFAULT_RSA_KEY_BITS`**

  Constants defining default values for AES key length, AES IV length, and RSA key bits respectively.

- **`AES_ALGORITHM`**

  Constant defining the default AES encryption algorithm (`aes-256-gcm`).

- **`UTF8_ENCODING`**

  Constant defining UTF-8 encoding, used for encoding/decoding strings.

##### Error Classes

- **`EncryptionError`**

  Custom error class for encryption failures.

- **`DecryptionError`**

  Custom error class for decryption failures.

- **`InvalidPathError`**

  Custom error class for invalid file paths or URLs.

#### Example Usage

```javascript
// Example usage of Rahayu class
import Rahayu from './Rahayu';

async function exampleUsage() {
  const publicKeyPath = './keys/public.pem';
  const privateKeyPath = './keys/private.pem';

  const rahayuInstance = new Rahayu(publicKeyPath, privateKeyPath);

  try {
    // Encrypt AES key
    const aesKey = Buffer.from('supersecretkey', Rahayu.UTF8_ENCODING);
    const encryptedAESKey = await rahayuInstance.encryptAESKeyWithRSA(aesKey);
    console.log('Encrypted AES Key:', encryptedAESKey);

    // Decrypt AES key
    const decryptedAESKey = await rahayuInstance.decryptAESKeyWithRSA(encryptedAESKey);
    console.log('Decrypted AES Key:', decryptedAESKey.toString(Rahayu.UTF8_ENCODING));
  } catch (error) {
    console.error('Error:', error);
  }
}

exampleUsage();
```

### Summary

The `Rahayu` class encapsulates robust cryptographic functionalities in Node.js, providing secure AES encryption/decryption and RSA key management. It emphasizes error handling, logging, and flexibility through customizable options. By using this class, developers can securely manage keys, encrypt sensitive data, and decrypt encrypted data in their applications.
