<div align="center">
  <img width="1151" height="814" alt="Screenshot 2025-12-31 165411" src="https://github.com/user-attachments/assets/66e65af3-3ec2-472e-869d-58bb83d1b1ad" />
</div>

# 🔐 Secure System Locker

**Secure System Locker** is a **privacy-first, offline secure vault and diary application** built using **React, TypeScript, and Vite**.  
The project focuses on **client-side encryption**, **zero-trust design**, and **local-only data protection**.

All sensitive content is encrypted **inside the browser itself**.  
There is **no backend**, **no cloud storage**, and **no external APIs** — ensuring maximum user privacy.

---

## 🎯 Project Objectives

- Implement strong client-side encryption using modern cryptography
- Design a vault-style secure diary system
- Practice privacy-aware and security-focused frontend development
- Build a fully offline-first secure application
- Follow clean, modular, and scalable React architecture

---

## ✨ Features

- 🔐 Client-side encryption (AES-256-GCM)
- 🔑 Password-based vault access
- 🧠 Local privacy & security analysis (offline)
- 📓 Encrypted diary / secure vault entries
- 📴 Works fully offline
- ❌ No backend, no APIs, no cloud
- 🧩 Clean and modular component structure
- ⚡ Fast and lightweight using Vite

---

## 🛡️ Security Design Overview

- Encryption and decryption occur entirely in the browser
- Master password is used to derive an encryption key using PBKDF2
- Diary entries are stored only in encrypted form
- Plaintext data is never persisted
- Passwords and keys are never stored

---

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- Web Crypto API
- Tailwind CSS
- Client-side Cryptography

---

## 📂 Project Structure

components/
├─ VaultSetup.tsx
├─ VaultLock.tsx
├─ DiaryEditor.tsx

services/
├─ cryptoService.ts
├─ geminiService.ts (offline security analyzer)

App.tsx
types.ts

---

## 🚀 Run the Project Locally

### Prerequisites
- Node.js (v16 or higher)
- npm

---

### Installation Steps

```bash
git clone https://github.com/SIVAPRIAN/SECURE_SYSTEM_LOCKER.git
cd SECURE_SYSTEM_LOCKER
npm install
npm run dev

