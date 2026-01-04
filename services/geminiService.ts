// Local, offline-safe security analysis (NO API, NO ENV)

type SecurityAnalysis = {
  securityScore: number;
  suggestions: string[];
  privacyThreats: string[];
};

const PII_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: "Email Address", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  { label: "Phone Number", regex: /\b\d{10}\b/ },
  { label: "Credit/Debit Card Number", regex: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/ },
  { label: "Aadhaar-like Number", regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/ },
  { label: "Exact Address Keywords", regex: /\b(street|road|lane|door no|flat no|house no)\b/i },
  { label: "Passwords / Secrets", regex: /\b(password|pin|otp|secret|api key)\b/i }
];

export const analyzeSecurity = async (content: string): Promise<SecurityAnalysis> => {
  let score = 100;
  const threats: string[] = [];
  const suggestions: string[] = [];

  for (const pattern of PII_PATTERNS) {
    if (pattern.regex.test(content)) {
      threats.push(pattern.label);
      score -= 10;
    }
  }

  if (content.length > 500) {
    score -= 5;
    suggestions.push("Consider keeping diary entries concise to reduce exposure.");
  }

  if (threats.length > 0) {
    suggestions.push("Avoid writing personally identifiable information in plain text.");
    suggestions.push("Replace sensitive details with placeholders or nicknames.");
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  if (threats.length === 0) {
    suggestions.push("Your entry looks safe. No sensitive data detected.");
  }

  return {
    securityScore: score,
    privacyThreats: threats,
    suggestions
  };
};
