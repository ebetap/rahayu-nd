### `rajendra-hayuningrat`
penulis bercerita, sesuatu itu akan mencapai kesempurnaan awal mulanya harus di pisahkan terlebih-dahulu untuk belajar memperbaiki diri masing-masing. Namun itu hanya sementara. setelah yang di pisahkan itu mengupgrade dirinya sendiri suatu saat akan di satukan kembali kalau sudah selaras. -Sastra Jendra Hayuningrat Pangruwating Diyu

To effectively use the `Rahayu` class and its features, let's walk through each feature with detailed examples.

### 1. Initialization and Instance Creation

First, you need to initialize an instance of `Rahayu`. This involves providing paths or URLs to your RSA public and private keys, and optionally configuring other parameters such as AES key length, AES IV length, and encryption algorithm.

```javascript
import Rahayu from './Rahayu'; // Adjust path as per your file structure

async function main() {
  try {
    // Example paths or URLs to your RSA keys
    const publicKeyPathOrUrl = 'https://example.com/public_key.pem';
    const privateKeyPathOrUrl = 'https://example.com/private_key.pem';

    // Optional configuration parameters
    const options = {
      aesKeyLength: 32, // 256-bit AES key length (default)
      aesIvLength: 16, // 16 bytes IV for AES-GCM (default)
      rsaKeyBits: 8192, // 8192-bit RSA key length (default)
      encryptionAlgorithm: 'aes-256-gcm', // AES encryption algorithm (default)
      logger: Rahayu.createDefaultLogger() // Optional custom logger
    };

    // Create an instance of Rahayu and initialize
    const instance = await Rahayu.createInstance(publicKeyPathOrUrl, privateKeyPathOrUrl, options);

    // Once initialized, instance is ready to use
    console.log('Rahayu instance initialized successfully');
    
    // Use instance for encryption, decryption, key management, etc.
    // Example usage will follow for each feature.
    
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

main();
```

### 2. Key Management

#### Fetching Keys
You can fetch keys from URLs or local file paths. The `getKey()` method handles this, caching keys to minimize network/file access.

```javascript
// Fetch a key (example with public key)
async function fetchPublicKeyExample() {
  try {
    const publicKey = await instance.getKey(publicKeyPathOrUrl);
    console.log('Public key fetched successfully:', publicKey);
  } catch (error) {
    console.error('Failed to fetch public key:', error);
  }
}

fetchPublicKeyExample();
```

#### Rotating Keys
You can rotate keys by specifying new paths/URLs for public and private keys using `rotateKeys()`.

```javascript
// Rotate keys (example with new paths or URLs)
async function rotateKeysExample() {
  try {
    const newPublicKeyPathOrUrl = 'https://example.com/new_public_key.pem';
    const newPrivateKeyPathOrUrl = 'https://example.com/new_private_key.pem';

    await instance.rotateKeys(newPublicKeyPathOrUrl, newPrivateKeyPathOrUrl);
    console.log('Key rotation successful');
  } catch (error) {
    console.error('Key rotation error:', error);
  }
}

rotateKeysExample();
```

### 3. Encryption and Decryption

#### Encrypting Data
You can encrypt data using AES encryption with HMAC for data integrity.

```javascript
// Encrypt data (example)
async function encryptDataExample() {
  try {
    const data = 'Sensitive information';
    const aesKey = instance.generateAESKey();
    const iv = crypto.randomBytes(instance.aesIvLength);

    const encryptedData = await instance.encryptData(data, aesKey, iv);
    console.log('Encrypted data:', encryptedData);
  } catch (error) {
    console.error('Encryption error:', error);
  }
}

encryptDataExample();
```

#### Decrypting Data
Decrypt previously encrypted data using the AES key and IV.

```javascript
// Decrypt data (example)
async function decryptDataExample(encryptedData, aesKey, iv, authTag, hmacDigest) {
  try {
    const decryptedData = await instance.decryptData(encryptedData, aesKey, iv, authTag, hmacDigest);
    console.log('Decrypted data:', decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
  }
}

// Example decryption flow (assuming you have encryptedData, aesKey, iv, authTag, and hmacDigest from previous encryption)
decryptDataExample(encryptedData, aesKey, iv, authTag, hmacDigest);
```

### 4. Configuration Management

#### Storing Configuration
Encrypt and store configuration data securely to a file.

```javascript
// Store configuration (example)
async function storeConfigExample(configData, configPath) {
  try {
    await instance.storeConfig(configData, configPath);
    console.log('Configuration stored successfully');
  } catch (error) {
    console.error('Configuration storage error:', error);
  }
}

// Example configuration data and file path
const configData = { username: 'admin', password: 'secret' };
const configPath = './config.json'; // Adjust path as needed

storeConfigExample(configData, configPath);
```

#### Retrieving Configuration
Retrieve and decrypt configuration data from a stored file.

```javascript
// Retrieve configuration (example)
async function retrieveConfigExample(configPath) {
  try {
    const config = await instance.retrieveConfig(configPath);
    console.log('Retrieved configuration:', config);
  } catch (error) {
    console.error('Configuration retrieval error:', error);
  }
}

// Example configPath should point to the previously stored configuration file
retrieveConfigExample(configPath);
```

### 5. Integration with Cloud KMS (AWS and Google Cloud)

#### AWS KMS Integration

```javascript
// Encrypt with AWS KMS (example)
async function encryptWithAWSKMSExample(keyId, plaintext) {
  try {
    const ciphertext = await instance.encryptWithAWSKMS(keyId, plaintext);
    console.log('Encrypted with AWS KMS:', ciphertext);
  } catch (error) {
    console.error('AWS KMS encryption error:', error);
  }
}

// Decrypt with AWS KMS (example)
async function decryptWithAWSKMSExample(keyId, ciphertext) {
  try {
    const plaintext = await instance.decryptWithAWSKMS(keyId, ciphertext);
    console.log('Decrypted with AWS KMS:', plaintext);
  } catch (error) {
    console.error('AWS KMS decryption error:', error);
  }
}

// Example keyId and plaintext for AWS KMS
const awsKeyId = 'your-aws-key-id';
const awsPlaintext = 'Sensitive information';

encryptWithAWSKMSExample(awsKeyId, awsPlaintext);
// Assuming you have the ciphertext from the encryption step
decryptWithAWSKMSExample(awsKeyId, ciphertext);
```

#### Google Cloud KMS Integration

```javascript
// Encrypt with Google Cloud KMS (example)
async function encryptWithGoogleKMSExample(keyName, plaintext) {
  try {
    const ciphertext = await instance.encryptWithGoogleKMS(keyName, plaintext);
    console.log('Encrypted with Google Cloud KMS:', ciphertext);
  } catch (error) {
    console.error('Google Cloud KMS encryption error:', error);
  }
}

// Decrypt with Google Cloud KMS (example)
async function decryptWithGoogleKMSExample(keyName, ciphertext) {
  try {
    const plaintext = await instance.decryptWithGoogleKMS(keyName, ciphertext);
    console.log('Decrypted with Google Cloud KMS:', plaintext);
  } catch (error) {
    console.error('Google Cloud KMS decryption error:', error);
  }
}

// Example keyName and plaintext for Google Cloud KMS
const googleKeyName = 'projects/your-project/locations/global/keyRings/your-key-ring/cryptoKeys/your-key';
const googlePlaintext = 'Sensitive information';

encryptWithGoogleKMSExample(googleKeyName, googlePlaintext);
// Assuming you have the ciphertext from the encryption step
decryptWithGoogleKMSExample(googleKeyName, ciphertext);
```

### Summary
The `Rahayu` class provides robust encryption, decryption, key management, and configuration handling functionalities for secure data management in Node.js applications. By following these examples, you can integrate these features into your applications effectively, ensuring data security and integrity across various use cases. Adjust paths, URLs, and specific data as per your application's requirements and security policies.
