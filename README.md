### `rajendra-hayuningrat`
penulis bercerita, sesuatu itu akan mencapai kesempurnaan awal mulanya harus di pisahkan terlebih-dahulu untuk belajar memperbaiki diri masing-masing. Namun itu hanya sementara. setelah yang di pisahkan itu mengupgrade dirinya sendiri suatu saat akan di satukan kembali kalau sudah selaras. -Sastra Jendra Hayuningrat Pangruwating Diyu

Modul ini menyediakan metode enkripsi dan dekripsi menggunakan algoritma AES-GCM untuk enkripsi data dan RSA-OAEP untuk enkripsi kunci AES, menggunakan Node.js `crypto` library.

Here is the flow of how the `RahayuND` class works for encrypting and decrypting data:

### Flow of Encryption and Decryption

1. **Initialization**:
   - Create an instance of the `RahayuND` class with paths to the public and private key files.

2. **Encryption Process**:
   - **Generate AES Key and IV**: A random 256-bit AES key and a 16-byte IV are generated.
   - **Encrypt Data with AES-GCM**: The data is encrypted using AES-256-GCM, which provides confidentiality and integrity. This process generates the encrypted data and an authentication tag.
   - **Encrypt AES Key with RSA-OAEP**: The AES key is encrypted using the RSA public key with OAEP padding and SHA-512 as the hashing algorithm.
   - **Combine Encrypted Results**: The encrypted data, IV, authentication tag, and the encrypted AES key are combined into a JSON object and returned as a string.

3. **Decryption Process**:
   - **Parse Encrypted Payload**: The JSON string is parsed to retrieve the encrypted data, IV, authentication tag, and encrypted AES key.
   - **Decrypt AES Key with RSA-OAEP**: The encrypted AES key is decrypted using the RSA private key with OAEP padding and SHA-512 as the hashing algorithm.
   - **Decrypt Data with AES-GCM**: The encrypted data is decrypted using the decrypted AES key, IV, and authentication tag. This process restores the original plaintext data.

### Detailed Steps

1. **Initialization**:
   ```javascript
   const RahayuND = require('./path-to-your-rahayund-class');

   const publicKeyPath = path.join(__dirname, 'keys', 'public.pem');
   const privateKeyPath = path.join(__dirname, 'keys', 'private.pem');
   const rahayu = new RahayuND(publicKeyPath, privateKeyPath);
   ```

2. **Encryption**:
   ```javascript
   const data = 'Sensitive data that needs encryption';

   // Encrypt data
   const encryptedPayload = await rahayu.encrypt(data);
   console.log('Encrypted Payload:', encryptedPayload);
   ```

   - **Generate AES Key and IV**:
     ```javascript
     const { key: aesKey, iv } = RahayuND.generateAESKeyAndIV();
     ```

   - **Encrypt Data with AES-GCM**:
     ```javascript
     const { encryptedData, authTag } = RahayuND.encryptWithAES(data, aesKey, iv);
     ```

   - **Encrypt AES Key with RSA-OAEP**:
     ```javascript
     const encryptedAESKey = await rahayu.encryptAESKeyWithRSA(aesKey);
     ```

   - **Combine Encrypted Results**:
     ```javascript
     return JSON.stringify({
       encryptedData,
       iv: iv.toString('base64'),
       authTag: authTag.toString('base64'),
       encryptedAESKey
     });
     ```

3. **Decryption**:
   ```javascript
   // Decrypt data
   const decryptedData = await rahayu.decrypt(encryptedPayload);
   console.log('Decrypted Data:', decryptedData);
   ```

   - **Parse Encrypted Payload**:
     ```javascript
     const payload = JSON.parse(encryptedPayload);
     ```

   - **Decrypt AES Key with RSA-OAEP**:
     ```javascript
     const aesKey = await rahayu.decryptAESKeyWithRSA(payload.encryptedAESKey);
     ```

   - **Decrypt Data with AES-GCM**:
     ```javascript
     return RahayuND.decryptWithAES(
       payload.encryptedData,
       aesKey,
       Buffer.from(payload.iv, 'base64'),
       Buffer.from(payload.authTag, 'base64')
     );
     ```

### Summary

1. **Initialization**: Create an instance of `RahayuND` with paths to public and private keys.
2. **Encryption**:
   - Generate AES key and IV.
   - Encrypt data using AES-GCM.
   - Encrypt AES key using RSA-OAEP.
   - Combine encrypted data, IV, authentication tag, and encrypted AES key into a JSON object.
3. **Decryption**:
   - Parse the JSON object to extract encrypted components.
   - Decrypt the AES key using RSA-OAEP.
   - Decrypt data using AES-GCM with the decrypted AES key, IV, and authentication tag.

This flow ensures the data is securely encrypted and decrypted using a combination of symmetric and asymmetric cryptography, providing both confidentiality and integrity.

Below is the documentation for the `RahayuND` class, including details about its methods, parameters, and usage examples.

### `RahayuND` Class Documentation

#### Description
`RahayuND` is a class that provides hybrid encryption and decryption functionalities using AES for symmetric encryption and RSA for asymmetric encryption. This ensures both confidentiality and integrity of the data.

#### Constructor

##### `constructor(publicKeyPath, privateKeyPath)`
- **Parameters**:
  - `publicKeyPath` (string): Path to the RSA public key file.
  - `privateKeyPath` (string): Path to the RSA private key file.
  
- **Example**:
  ```javascript
  const publicKeyPath = path.join(__dirname, 'keys', 'public.pem');
  const privateKeyPath = path.join(__dirname, 'keys', 'private.pem');
  const rahayu = new RahayuND(publicKeyPath, privateKeyPath);
  ```

#### Methods

##### `static generateAESKeyAndIV()`
- **Description**: Generates a random AES key and initialization vector (IV).
- **Returns**: An object containing `key` (Buffer) and `iv` (Buffer).

- **Example**:
  ```javascript
  const { key: aesKey, iv } = RahayuND.generateAESKeyAndIV();
  ```

##### `static encryptWithAES(data, aesKey, iv)`
- **Description**: Encrypts data using AES-256-GCM.
- **Parameters**:
  - `data` (string): The plaintext data to encrypt.
  - `aesKey` (Buffer): The AES key.
  - `iv` (Buffer): The initialization vector.
- **Returns**: An object containing `encryptedData` (string) and `authTag` (Buffer).

- **Example**:
  ```javascript
  const { encryptedData, authTag } = RahayuND.encryptWithAES(data, aesKey, iv);
  ```

##### `async encryptAESKeyWithRSA(aesKey)`
- **Description**: Encrypts the AES key using RSA-OAEP.
- **Parameters**:
  - `aesKey` (Buffer): The AES key to encrypt.
- **Returns**: The encrypted AES key as a base64-encoded string.

- **Example**:
  ```javascript
  const encryptedAESKey = await rahayu.encryptAESKeyWithRSA(aesKey);
  ```

##### `async decryptAESKeyWithRSA(encryptedAESKey)`
- **Description**: Decrypts the AES key using RSA-OAEP.
- **Parameters**:
  - `encryptedAESKey` (string): The base64-encoded encrypted AES key.
- **Returns**: The decrypted AES key (Buffer).

- **Example**:
  ```javascript
  const aesKey = await rahayu.decryptAESKeyWithRSA(encryptedAESKey);
  ```

##### `static decryptWithAES(encryptedData, aesKey, iv, authTag)`
- **Description**: Decrypts data using AES-256-GCM.
- **Parameters**:
  - `encryptedData` (string): The encrypted data.
  - `aesKey` (Buffer): The AES key.
  - `iv` (Buffer): The initialization vector.
  - `authTag` (Buffer): The authentication tag.
- **Returns**: The decrypted plaintext data (string).

- **Example**:
  ```javascript
  const decryptedData = RahayuND.decryptWithAES(encryptedData, aesKey, iv, authTag);
  ```

##### `static async validateFilePath(filePath)`
- **Description**: Validates if the given file path is accessible.
- **Parameters**:
  - `filePath` (string): The file path to validate.
- **Throws**: An error if the file path is not accessible.

- **Example**:
  ```javascript
  await RahayuND.validateFilePath(this.publicKeyPath);
  ```

##### `async encrypt(data)`
- **Description**: Encrypts the given data using AES for the data and RSA for the AES key.
- **Parameters**:
  - `data` (string): The plaintext data to encrypt.
- **Returns**: A JSON string containing the encrypted data, IV, authentication tag, and encrypted AES key.
- **Throws**: An error if encryption fails.

- **Example**:
  ```javascript
  const encryptedPayload = await rahayu.encrypt(data);
  console.log('Encrypted Payload:', encryptedPayload);
  ```

##### `async decrypt(encryptedPayload)`
- **Description**: Decrypts the given payload using RSA for the AES key and AES for the data.
- **Parameters**:
  - `encryptedPayload` (string): The JSON string containing the encrypted data, IV, authentication tag, and encrypted AES key.
- **Returns**: The decrypted plaintext data (string).
- **Throws**: An error if decryption fails.

- **Example**:
  ```javascript
  const decryptedData = await rahayu.decrypt(encryptedPayload);
  console.log('Decrypted Data:', decryptedData);
  ```

### Usage Example

Here is an example demonstrating how to use the `RahayuND` class to encrypt and decrypt data:

```javascript
const path = require('path');
const RahayuND = require('./path-to-your-rahayund-class');

async function testEncryption() {
  const publicKeyPath = path.join(__dirname, 'keys', 'public.pem');
  const privateKeyPath = path.join(__dirname, 'keys', 'private.pem');
  const rahayu = new RahayuND(publicKeyPath, privateKeyPath);

  const data = 'Sensitive data that needs encryption';

  try {
    // Encrypt data
    const encryptedPayload = await rahayu.encrypt(data);
    console.log('Encrypted Payload:', encryptedPayload);

    // Decrypt data
    const decryptedData = await rahayu.decrypt(encryptedPayload);
    console.log('Decrypted Data:', decryptedData);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

testEncryption().catch(console.error);
```

### Summary
The `RahayuND` class provides a robust and secure way to handle encryption and decryption using a combination of AES and RSA algorithms. It is designed to be easy to use, with methods to handle all necessary steps in the encryption and decryption processes. This ensures that data remains confidential and intact, leveraging the strengths of both symmetric and asymmetric cryptography.
