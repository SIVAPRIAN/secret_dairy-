
import React, { useState, useEffect, useCallback } from 'react';
import VaultSetup from './components/VaultSetup';
import VaultLock from './components/VaultLock';
import DiaryEditor from './components/DiaryEditor';
import { deriveKeyFromPassword } from './services/cryptoService';
import { DiaryEntry, SecurityState } from './types';

const App: React.FC = () => {
  const [security, setSecurity] = useState<SecurityState>({
    isLocked: true,
    hasVault: false,
    masterKey: null,
    salt: null
  });
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize vault check
  useEffect(() => {
    const salt = localStorage.getItem('cipher_salt');
    const storedEntries = localStorage.getItem('cipher_entries');
    
    if (salt) {
      setSecurity(prev => ({ ...prev, hasVault: true, salt }));
    }
    
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
    
    setLoading(false);
  }, []);

  const handleSetup = async (password: string, salt: string) => {
    localStorage.setItem('cipher_salt', salt);
    const key = await deriveKeyFromPassword(password, salt);
    setSecurity({
      isLocked: false,
      hasVault: true,
      masterKey: key,
      salt
    });
  };

  const handleUnlock = async (password: string) => {
    if (!security.salt) return;
    try {
      const key = await deriveKeyFromPassword(password, security.salt);
      // We don't verify if key is "correct" until we try to decrypt something
      // For this demo, we assume unlock succeeds and handle errors in the editor
      setSecurity(prev => ({ ...prev, isLocked: false, masterKey: key }));
    } catch (e) {
      console.error("Unlock failed", e);
    }
  };

  const handleLock = () => {
    setSecurity(prev => ({ ...prev, isLocked: true, masterKey: null }));
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const saveEntries = useCallback((newEntries: DiaryEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('cipher_entries', JSON.stringify(newEntries));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!security.hasVault) {
    return <VaultSetup onComplete={handleSetup} />;
  }

  if (security.isLocked) {
    return <VaultLock onUnlock={handleUnlock} onReset={handleReset} />;
  }

  return (
    <DiaryEditor 
      entries={entries} 
      masterKey={security.masterKey!} 
      onSave={saveEntries} 
      onLock={handleLock}
    />
  );
};

export default App;
