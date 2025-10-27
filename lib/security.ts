// Security utility functions

// Password strength validation
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 
  '1234567', 'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou',
  'master', 'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow',
  '123123', '654321', 'superman', 'qazwsx', 'michael', 'football'
];

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check (minimum 12 characters)
  if (password.length < 12) {
    feedback.push('Password must be at least 12 characters long');
  } else if (password.length >= 12) {
    score++;
  }

  if (password.length >= 16) {
    score++;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score++;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score++;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score++;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score++;
  }

  // Common password check
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    feedback.push('This password is too common. Please choose a stronger password');
    score = Math.max(0, score - 2);
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters (e.g., aaa, 111)');
    score = Math.max(0, score - 1);
  }

  // Sequential numbers/letters
  if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    feedback.push('Avoid sequential characters (e.g., abc, 123)');
    score = Math.max(0, score - 1);
  }

  const isValid = password.length >= 12 && 
                  /[A-Z]/.test(password) && 
                  /[a-z]/.test(password) && 
                  /[0-9]/.test(password) && 
                  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) &&
                  !COMMON_PASSWORDS.includes(password.toLowerCase());

  return {
    score: Math.min(4, Math.max(0, score)),
    feedback,
    isValid
  };
}

// PIN validation (4 digits, no repeating/sequential)
export function validatePin(pin: string): { isValid: boolean; error?: string } {
  if (!/^\d{4}$/.test(pin)) {
    return { isValid: false, error: 'PIN must be exactly 4 digits' };
  }

  // Check for repeating digits (e.g., 1111, 2222)
  if (/(\d)\1{3}/.test(pin)) {
    return { isValid: false, error: 'PIN cannot have all same digits (e.g., 1111)' };
  }

  // Check for sequential digits (e.g., 1234, 4321)
  const sequential = ['0123', '1234', '2345', '3456', '4567', '5678', '6789', '9876', '8765', '7654', '6543', '5432', '4321', '3210'];
  if (sequential.includes(pin)) {
    return { isValid: false, error: 'PIN cannot be sequential (e.g., 1234)' };
  }

  return { isValid: true };
}

// Username validation
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }

  if (username.length > 30) {
    return { isValid: false, error: 'Username must be at most 30 characters long' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { isValid: true };
}

// Sanitize SQL identifiers (table names, column names)
export function sanitizeIdentifier(identifier: string): { isValid: boolean; error?: string } {
  // Only allow alphanumeric characters, underscores
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    return { isValid: false, error: 'Invalid identifier. Only letters, numbers, and underscores allowed' };
  }

  // Check length
  if (identifier.length > 64) {
    return { isValid: false, error: 'Identifier too long (max 64 characters)' };
  }

  // Prevent SQL keywords as identifiers (basic list)
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 
    'TABLE', 'DATABASE', 'INDEX', 'VIEW', 'TRIGGER', 'PROCEDURE', 'FUNCTION',
    'GRANT', 'REVOKE', 'UNION', 'JOIN', 'WHERE', 'FROM', 'INTO'
  ];

  if (sqlKeywords.includes(identifier.toUpperCase())) {
    return { isValid: false, error: 'Identifier cannot be a SQL keyword' };
  }

  return { isValid: true };
}

// Rate limiting tracker (in-memory for now, should be Redis in production)
const rateLimitStore = new Map<string, { attempts: number; lockoutUntil?: number; firstAttempt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  attemptsRemaining?: number;
  lockoutUntil?: number;
  message?: string;
}

export function checkRateLimit(
  identifier: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  lockoutMs: number = 15 * 60 * 1000 // 15 minutes lockout
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Check if currently locked out
  if (record?.lockoutUntil && record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return {
      allowed: false,
      lockoutUntil: record.lockoutUntil,
      message: `Account locked. Try again in ${remainingSeconds} seconds`
    };
  }

  // Reset if window expired
  if (!record || (now - record.firstAttempt) > windowMs) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now
    });
    return {
      allowed: true,
      attemptsRemaining: maxAttempts - 1
    };
  }

  // Increment attempts
  record.attempts++;

  // Check if limit exceeded
  if (record.attempts >= maxAttempts) {
    record.lockoutUntil = now + lockoutMs;
    rateLimitStore.set(identifier, record);
    return {
      allowed: false,
      lockoutUntil: record.lockoutUntil,
      message: `Too many failed attempts. Account locked for ${lockoutMs / 1000 / 60} minutes`
    };
  }

  rateLimitStore.set(identifier, record);
  return {
    allowed: true,
    attemptsRemaining: maxAttempts - record.attempts
  };
}

// Reset rate limit (on successful login)
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

// Clean expired rate limit entries (call periodically)
export function cleanupRateLimits(): void {
  const now = Date.now();
  rateLimitStore.forEach((record, key) => {
    if (record.lockoutUntil && record.lockoutUntil < now) {
      rateLimitStore.delete(key);
    }
  });
}

// Detect dangerous SQL operations
export function detectDangerousQuery(query: string): { isDangerous: boolean; operations: string[] } {
  const dangerous = ['DROP', 'TRUNCATE', 'DELETE', 'ALTER', 'CREATE DATABASE', 'DROP DATABASE'];
  const foundOperations: string[] = [];
  const upperQuery = query.toUpperCase();

  for (const op of dangerous) {
    if (upperQuery.includes(op)) {
      foundOperations.push(op);
    }
  }

  return {
    isDangerous: foundOperations.length > 0,
    operations: foundOperations
  };
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

// Constant-time string comparison (prevents timing attacks)
export function secureCompare(a: string, b: string): boolean {
  const crypto = require('crypto');
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Escape HTML to prevent XSS (additional layer, React already does this)
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Check if IP is whitelisted (basic implementation)
export function isIpWhitelisted(ip: string, whitelist: string[]): boolean {
  // Simple exact match for now
  // In production, support CIDR notation
  if (whitelist.length === 0) {
    return true; // No whitelist = allow all
  }
  return whitelist.includes(ip);
}

// Log security event (should write to audit log)
export function logSecurityEvent(event: {
  type: 'login_failed' | 'login_success' | 'logout' | 'rate_limit' | 'suspicious_query' | 'unauthorized_access';
  username?: string;
  ip?: string;
  details?: string;
  timestamp?: Date;
}): void {
  const logEntry = {
    ...event,
    timestamp: event.timestamp || new Date(),
  };
  
  // In production, write to secure log file or service
  console.log('[SECURITY]', JSON.stringify(logEntry));
}
