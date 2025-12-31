
import React, { useState, useEffect, useMemo } from 'react';
import { DiaryEntry } from '../types';
import { encryptContent, decryptContent } from '../services/cryptoService';
import { analyzeSecurity } from '../services/geminiService';

interface DiaryEditorProps {
  entries: DiaryEntry[];
  masterKey: CryptoKey;
  onSave: (entries: DiaryEntry[]) => void;
  onLock: () => void;
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({ entries, masterKey, onSave, onLock }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeContent, setActiveContent] = useState('');
  const [activeTitle, setActiveTitle] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Load entry
  useEffect(() => {
    if (selectedId) {
      const entry = entries.find(e => e.id === selectedId);
      if (entry) {
        setActiveTitle(entry.title);
        decrypt(entry);
      }
    } else {
      setActiveTitle('');
      setActiveContent('');
      setAuditResult(null);
    }
  }, [selectedId, entries]);

  const decrypt = async (entry: DiaryEntry) => {
    setIsDecrypting(true);
    try {
      const text = await decryptContent(entry.encryptedContent, entry.iv, masterKey);
      setActiveContent(text);
    } catch (err) {
      alert("FATAL ERROR: Decryption failed. Your key might be invalid or the data is corrupted.");
      onLock();
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleSave = async () => {
    if (!activeTitle.trim()) return;
    setIsSaving(true);
    
    try {
      const { encrypted, iv } = await encryptContent(activeContent, masterKey);
      
      const newEntry: DiaryEntry = {
        id: selectedId || crypto.randomUUID(),
        title: activeTitle,
        encryptedContent: encrypted,
        iv: iv,
        timestamp: Date.now()
      };

      let nextEntries: DiaryEntry[];
      if (selectedId) {
        nextEntries = entries.map(e => e.id === selectedId ? newEntry : e);
      } else {
        nextEntries = [newEntry, ...entries];
      }
      
      onSave(nextEntries);
      if (!selectedId) setSelectedId(newEntry.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAudit = async () => {
    if (!activeContent) return;
    setIsAuditing(true);
    const result = await analyzeSecurity(activeContent);
    setAuditResult(result);
    setIsAuditing(false);
  };

  const deleteEntry = (id: string) => {
    if (window.confirm("Permanently delete this entry?")) {
      const next = entries.filter(e => e.id !== id);
      onSave(next);
      if (selectedId === id) setSelectedId(null);
    }
  };

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => b.timestamp - a.timestamp);
  }, [entries]);

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-zinc-800 flex flex-col bg-[#0d0d0d]">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Vault Active</span>
          </div>
          <button 
            onClick={onLock}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <button 
            onClick={() => setSelectedId(null)}
            className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Entry
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {sortedEntries.map(entry => (
            <div 
              key={entry.id}
              onClick={() => setSelectedId(entry.id)}
              className={`group px-4 py-3 border-b border-zinc-900 cursor-pointer transition-all ${selectedId === entry.id ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'hover:bg-zinc-800/50'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-semibold text-sm truncate ${selectedId === entry.id ? 'text-blue-400' : 'text-zinc-200'}`}>
                  {entry.title}
                </h3>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-zinc-600 transition-all"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 font-medium">
                {new Date(entry.timestamp).toLocaleDateString()} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center py-20 px-6">
              <div className="mb-4 text-zinc-700">
                <svg className="w-12 h-12 mx-auto opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm text-zinc-600">Your secure vault is empty. Start writing your first entry.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Editor Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        {/* Toolbar */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md">
          <input 
            type="text"
            value={activeTitle}
            onChange={(e) => setActiveTitle(e.target.value)}
            placeholder="Entry Title..."
            className="bg-transparent text-lg font-bold text-white focus:outline-none flex-1 placeholder:text-zinc-700"
          />
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAudit}
              disabled={isAuditing || !activeContent}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white transition-all disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Security Audit
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || !activeTitle}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              Save Encrypted
            </button>
          </div>
        </header>

        {/* Audit Panel */}
        {auditResult && (
          <div className="px-6 py-4 bg-zinc-900/50 border-b border-zinc-800 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Privacy Analysis</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${auditResult.securityScore > 70 ? 'bg-green-500' : auditResult.securityScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${auditResult.securityScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono text-white">{auditResult.securityScore}%</span>
                </div>
              </div>
              <button onClick={() => setAuditResult(null)} className="text-zinc-500 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Threats Detected</p>
                <ul className="text-xs text-red-400 space-y-1">
                  {auditResult.privacyThreats.map((t: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 w-1 h-1 rounded-full bg-red-500 flex-shrink-0"></span>
                      {t}
                    </li>
                  ))}
                  {auditResult.privacyThreats.length === 0 && <li className="text-zinc-500">None identified</li>}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Recommendations</p>
                <ul className="text-xs text-zinc-300 space-y-1">
                  {auditResult.suggestions.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 w-1 h-1 rounded-full bg-blue-500 flex-shrink-0"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 relative flex flex-col p-6">
          {isDecrypting ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-500 font-mono text-sm animate-pulse tracking-widest">DECRYPTING_VAULT_BYTES...</p>
              </div>
            </div>
          ) : (
            <textarea 
              value={activeContent}
              onChange={(e) => setActiveContent(e.target.value)}
              className="flex-1 bg-transparent text-zinc-300 resize-none focus:outline-none text-base leading-relaxed placeholder:text-zinc-800"
              placeholder="Start your secure reflection here..."
            />
          )}
        </div>

        {/* Security Footer */}
        <footer className="px-6 py-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-600 font-mono tracking-tighter">
          <div className="flex gap-4">
            <span>ALGO: AES-GCM-256</span>
            <span>DERIVE: PBKDF2-SHA256</span>
            <span>STORAGE: LOCAL_ENC_BLOB</span>
          </div>
          <div className="flex gap-4">
            <span>KEY_STRENGTH: 256B</span>
            <span className="text-green-900">SECURE_ACTIVE</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DiaryEditor;
