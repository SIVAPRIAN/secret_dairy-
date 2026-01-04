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

type AuditResult = {
  securityScore: number;
  suggestions: string[];
  privacyThreats: string[];
};

const DiaryEditor: React.FC<DiaryEditorProps> = ({
  entries,
  masterKey,
  onSave,
  onLock
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeContent, setActiveContent] = useState('');
  const [activeTitle, setActiveTitle] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

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
    } catch {
      alert("Decryption failed. Vault will lock for safety.");
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
        iv,
        timestamp: Date.now()
      };

      const nextEntries = selectedId
        ? entries.map(e => (e.id === selectedId ? newEntry : e))
        : [newEntry, ...entries];

      onSave(nextEntries);
      if (!selectedId) setSelectedId(newEntry.id);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAudit = async () => {
    if (!activeContent.trim()) return;
    setIsAuditing(true);
    try {
      const result = await analyzeSecurity(activeContent);
      setAuditResult(result);
    } finally {
      setIsAuditing(false);
    }
  };

  const deleteEntry = (id: string) => {
    if (window.confirm("Permanently delete this entry?")) {
      const next = entries.filter(e => e.id !== id);
      onSave(next);
      if (selectedId === id) setSelectedId(null);
    }
  };

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.timestamp - a.timestamp),
    [entries]
  );

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-zinc-800 flex flex-col bg-[#0d0d0d]">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/50">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Vault Active
          </span>
          <button onClick={onLock} className="text-zinc-500 hover:text-white">
            🔒
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => setSelectedId(null)}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg"
          >
            + New Entry
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sortedEntries.map(entry => (
            <div
              key={entry.id}
              onClick={() => setSelectedId(entry.id)}
              className={`px-4 py-3 cursor-pointer ${
                selectedId === entry.id
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'hover:bg-zinc-800 text-zinc-200'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-sm font-semibold truncate">{entry.title}</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteEntry(entry.id);
                  }}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
              <p className="text-[10px] text-zinc-500">
                {new Date(entry.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b border-zinc-800 flex gap-4">
          <input
            value={activeTitle}
            onChange={e => setActiveTitle(e.target.value)}
            placeholder="Entry title"
            className="flex-1 bg-transparent text-white text-lg outline-none"
          />
          <button
            onClick={handleAudit}
            disabled={isAuditing}
            className="text-sm text-zinc-300"
          >
            {isAuditing ? 'Auditing...' : 'Security Audit'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </header>

        {auditResult && (
          <div className="p-4 bg-zinc-900 border-b border-zinc-800 text-sm">
            <strong>Security Score:</strong> {auditResult.securityScore}%
            <ul className="mt-2 list-disc ml-5">
              {auditResult.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <textarea
          value={activeContent}
          onChange={e => setActiveContent(e.target.value)}
          className="flex-1 bg-transparent text-zinc-300 p-6 outline-none resize-none"
          placeholder="Write securely..."
        />
      </main>
    </div>
  );
};

export default DiaryEditor;
