
import React, { useState } from 'react';

interface VaultLockProps {
  onUnlock: (password: string) => void;
  onReset: () => void;
}

const VaultLock: React.FC<VaultLockProps> = ({ onUnlock, onReset }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUnlock(password);
    setPassword('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-black">
      <div className="w-full max-w-sm bg-[#111] border border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-500/50 blur-lg"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-full mb-4 border border-zinc-800">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Vault Locked</h2>
          <p className="text-zinc-500 text-sm mt-1">Enter your master key to proceed</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors text-center text-lg tracking-[0.5em]"
            placeholder="••••••••"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all active:scale-[0.98]"
          >
            Unlock Vault
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              if (window.confirm("CRITICAL WARNING: Wiping the vault will permanently delete ALL diary entries. This cannot be undone. Proceed?")) {
                onReset();
              }
            }}
            className="text-xs text-zinc-600 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
          >
            Wipe Vault & Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaultLock;
