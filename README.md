### `rajendra-hayuningrat`
penulis bercerita, sesuatu itu akan mencapai kesempurnaan awal mulanya harus di pisahkan terlebih-dahulu untuk belajar memperbaiki diri masing-masing. Namun itu hanya sementara. setelah yang di pisahkan itu mengupgrade dirinya sendiri suatu saat akan di satukan kembali kalau sudah selaras. -Sastra Jendra Hayuningrat Pangruwating Diyu

Modul ini menyediakan metode enkripsi dan dekripsi menggunakan algoritma AES-GCM untuk enkripsi data dan RSA-OAEP untuk enkripsi kunci AES, menggunakan Node.js `crypto` library.

The provided JavaScript code defines a class `Rahayu` that handles cryptographic operations, including AES encryption/decryption and RSA key management. Here's a breakdown of the key components and functionalities:

1. **Imports and Dependencies:**
   - `crypto`: Imported from Node.js `crypto` module to handle cryptographic operations.
   - `fs`: Imported from Node.js `fs` module to handle file system operations asynchronously.
   - `axios`: Used for making HTTP requests.
   - `winston`: A logging library for Node.js used for logging errors and information.

2. **Custom Error Classes:**
   - `EncryptionError`, `DecryptionError`, `InvalidPathError`: Custom error classes defined to handle specific types of errors related to encryption failures, decryption failures, and invalid file paths or URLs.

3. **Constants and Defaults:**
   - `DEFAULT_AES_KEY_LENGTH`, `DEFAULT_AES_IV_LENGTH`, `DEFAULT_RSA_KEY_BITS`: Constants defining default lengths for AES keys, IVs, and RSA key bits respectively.
   - `AES_ALGORITHM`: Constant defining the default AES encryption algorithm (`aes-256-gcm`).
   - `UTF8_ENCODING`: Constant defining UTF-8 encoding, used for encoding/decoding strings.

4. **Constructor (`Rahayu` class):**
   - Initializes the class with paths or URLs to public and private RSA keys, along with optional parameters (`options`) such as AES key length, AES IV length, RSA key bits, logger instance, and encryption algorithm.

5. **Methods:**
   - `createDefaultLogger()`: Static method to create a default instance of the Winston logger.
   - `fetchKey(url)`: Asynchronously fetches a key from a given URL using Axios. Logs errors if fetching fails.
   - `validatePathOrUrl(pathOrUrl)`: Asynchronously validates if a given path or URL is accessible. Throws `InvalidPathError` if the path or URL is invalid.
   - `getKey(pathOrUrl)`: Asynchronously retrieves a key from either a file path or a URL. Uses `fetchKey()` for URLs and `fs.readFile()` for file paths.
   - `encryptAESKeyWithRSA(aesKey)`: Encrypts an AES key using RSA-OAEP encryption. Retrieves the public key, encrypts the AES key, and returns it as a base64-encoded string.
   - `decryptAESKeyWithRSA(encryptedAESKey)`: Decrypts a base64-encoded AES key using RSA-OAEP decryption. Retrieves the private key, decrypts the AES key, and returns it as a Buffer.

6. **Usage of Promises and `async/await`:**
   - Methods use `async` functions to handle asynchronous operations, leveraging `await` to wait for promises to resolve or reject.

This class encapsulates functionalities for secure key management and cryptographic operations, with error handling and logging integrated for robustness. It allows for flexible configuration through options while providing default settings for ease of use.
