import React, { useState } from 'react';
import { generateSalt } from '../services/cryptoService';

interface VaultSetupProps {
  onComplete: (password: string, salt: string) => void;
}

const VaultSetup: React.FC<VaultSetupProps> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 12) {
      setError('Master password must be at least 12 characters long.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const salt = generateSalt();
    onComplete(password, salt);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-black">
      <div className="w-full max-w-md bg-[#111] border border-zinc-800 p-8 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/10 rounded-full mb-4 border border-zinc-800">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Initialize Your Vault
          </h1>
          <p className="text-zinc-400 text-sm">
            This password encrypts your data locally.<br />
            <span className="text-red-400 font-semibold">
              It cannot be recovered if lost.
            </span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Master Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 12 characters"
              className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4
                         focus:outline-none focus:border-blue-500 transition-colors
                         text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4
                         focus:outline-none focus:border-blue-500 transition-colors
                         text-white"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-medium mt-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700
                       text-white font-bold py-3 rounded-lg
                       shadow-lg transition-all active:scale-[0.98] mt-4"
          >
            Create Secure Vault
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 pt-6 border-t border-zinc-900">
          <ul className="text-[10px] text-zinc-500 space-y-2 uppercase tracking-tight">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              AES-256-GCM Encryption
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              Client-Side Only Processing
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              PBKDF2-SHA256 (100k Iterations)
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default VaultSetup;
