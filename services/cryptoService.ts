
/**
 * CipherVault Cryptography Service
 * Implements AES-GCM-256 with PBKDF2 Key Derivation
 */

export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

export const deriveKeyFromPassword = async (password: string, salt: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const saltData = Uint8Array.from(atob(salt), c => c.charCodeAt(0));

  // Import the password as a key for PBKDF2
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive an AES-GCM 256-bit key
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 100000, // High iteration count for protection against brute force
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false, // Key is not extractable for security
    ['encrypt', 'decrypt']
  );
};

export const encryptContent = async (text: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv))
  };
};

export const decryptContent = async (encryptedBase64: string, ivBase64: string, key: CryptoKey): Promise<string> => {
  const decoder = new TextDecoder();
  const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Decryption failed. Incorrect key or corrupted data.');
  }
};
