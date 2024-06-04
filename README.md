### `rajendra-hayuningrat`
penulis bercerita, sesuatu itu akan mencapai kesempurnaan awal mulanya harus di pisahkan terlebih-dahulu untuk belajar memperbaiki diri masing-masing. Namun itu hanya sementara. setelah yang di pisahkan itu mengupgrade dirinya se diri suatu saat akan di satukan kembali. -Sastra Jendra Hayuningrat Pangruwating Diyu

Modul ini menyediakan metode enkripsi dan dekripsi menggunakan algoritma AES-GCM untuk enkripsi data dan RSA-OAEP untuk enkripsi kunci AES, menggunakan Node.js `crypto` library.

#### Instalasi

Instalasi modul dapat dilakukan dengan perintah berikut:

```bash
npm install rajendra-hayuningrat
```

#### Penggunaan

```javascript
const { encrypt, decrypt } = require('rajendra-hayuningrat');

(async () => {
  const plaintext = 'Ini adalah teks rahasia yang akan dienkripsi';
  
  try {
    // Enkripsi
    const encrypted = await encrypt(plaintext);
    console.log('Encrypted:', encrypted);

    // Dekripsi
    const decrypted = await decrypt(encrypted);
    console.log('Decrypted:', decrypted);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

#### API

##### `encrypt(data: string): Promise<string>`

Mengenkripsi data menggunakan AES-GCM dengan kunci acak dan IV. Mengembalikan objek JSON yang berisi data terenkripsi, IV, authTag, dan kunci AES terenkripsi dengan RSA-OAEP.

- `data`: String yang akan dienkripsi.

##### `decrypt(encryptedPayload: string): Promise<string>`

Mendekripsi data yang telah dienkripsi menggunakan AES-GCM dan kunci AES yang telah didekripsi dengan RSA-OAEP.

- `encryptedPayload`: String JSON yang berisi data terenkripsi, IV, authTag, dan kunci AES terenkripsi.

#### Contoh Penggunaan

```javascript
const { encrypt, decrypt } = require('rajendra-hayuningrat');

(async () => {
  const plaintext = 'Ini adalah teks rahasia yang akan dienkripsi';
  
  try {
    // Enkripsi
    const encrypted = await encrypt(plaintext);
    console.log('Encrypted:', encrypted);

    // Dekripsi
    const decrypted = await decrypt(encrypted);
    console.log('Decrypted:', decrypted);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

### Dokumentasi Lengkap

#### `encrypt(data: string): Promise<string>`

Mengenkripsi data menggunakan AES-GCM dengan kunci acak dan IV.

- `data`: String yang akan dienkripsi.

Mengembalikan objek JSON dengan properti:

- `encryptedData`: Data terenkripsi dalam format hexadecimal.
- `iv`: IV dalam format base64.
- `authTag`: AuthTag dalam format base64.
- `encryptedAESKey`: Kunci AES yang telah terenkripsi dengan RSA-OAEP dalam format base64.

#### `decrypt(encryptedPayload: string): Promise<string>`

Mendekripsi data yang telah dienkripsi menggunakan AES-GCM.

- `encryptedPayload`: String JSON yang berisi data terenkripsi, IV, authTag, dan kunci AES terenkripsi.

Mengembalikan string plaintext yang telah didekripsi.

### Contoh Penggunaan

```javascript
const { encrypt, decrypt } = require('rajendra-hayuningrat');

(async () => {
  const plaintext = 'Ini adalah teks rahasia yang akan dienkripsi';
  
  try {
    // Enkripsi
    const encrypted = await encrypt(plaintext);
    console.log('Encrypted:', encrypted);

    // Dekripsi
    const decrypted = await decrypt(encrypted);
    console.log('Decrypted:', decrypted);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

### Pengembang

Modul ini dikembangkan oleh **[Beta]**.

### Lisensi

Lisensi modul ini adalah **[Bebas-Berakhlak]**.

### Masalah

Jika Anda menemukan masalah atau memiliki pertanyaan, silakan buka **[instagram.com/as.techno1]**.

### Tentang

Modul `rajendra-hayuningrat` menggunakan algoritma AES-GCM untuk enkripsi data dan RSA-OAEP untuk enkripsi kunci AES, menggunakan Node.js `crypto` library.

### Kredit

Modul ini diilhami oleh kebutuhan untuk mengenkripsi data dengan aman menggunakan standar yang kuat dan diterbitkan di repo ini.

### Metode Enkripsi Paling Aman di Dunia

Modul `rajendra-hayuningrat` menggunakan AES-GCM dan RSA-OAEP untuk memberikan tingkat keamanan yang sangat tinggi bagi data Anda. Kunci AES yang dihasilkan secara acak dan IV yang unik, bersama dengan kunci RSA yang panjang, menjadikan metode ini yang paling aman di dunia saat ini untuk enkripsi data.

---
