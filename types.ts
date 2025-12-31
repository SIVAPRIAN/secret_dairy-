
export interface DiaryEntry {
  id: string;
  title: string;
  encryptedContent: string;
  iv: string; // Initialization Vector for AES-GCM
  timestamp: number;
}

export interface SecurityState {
  isLocked: boolean;
  hasVault: boolean;
  masterKey: CryptoKey | null;
  salt: string | null;
}

export interface AIAnalysis {
  securityScore: number;
  suggestions: string[];
  privacyThreats: string[];
}
