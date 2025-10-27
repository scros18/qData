import { createHash, randomBytes, pbkdf2Sync } from 'crypto';
import fs from 'fs';
import path from 'path';
import { validatePasswordStrength, validatePin, validateUsername, checkRateLimit, resetRateLimit, logSecurityEvent, generateSessionFingerprint, verifySessionFingerprint, SessionFingerprint } from './security';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSION_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  pinHash: string;
  salt: string;
  role: 'admin' | 'user';
  createdAt: string;
  createdBy?: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Session {
  sessionId: string;
  userId: string;
  username: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  pinVerified: boolean;
  lastActivity: string;
  ipAddress?: string;
  fingerprint?: SessionFingerprint;
}

// Hash password with salt
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || randomBytes(32).toString('hex');
  const hash = pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: actualSalt };
}

// Verify password
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: testHash } = hashPassword(password, salt);
  return testHash === hash;
}

// Hash PIN (simpler than password, but still secure)
export function hashPin(pin: string, salt: string): string {
  return pbkdf2Sync(pin, salt, 50000, 32, 'sha512').toString('hex');
}

// Verify PIN
export function verifyPin(pin: string, hash: string, salt: string): boolean {
  const testHash = hashPin(pin, salt);
  return testHash === hash;
}

// Load users from file
export function loadUsers(): User[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

// Save users to file
export function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving users:', error);
    throw new Error('Failed to save users');
  }
}

// Load sessions from file
export function loadSessions(): Session[] {
  try {
    if (!fs.existsSync(SESSION_FILE)) {
      return [];
    }
    const data = fs.readFileSync(SESSION_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

// Save sessions to file
export function saveSessions(sessions: Session[]): void {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving sessions:', error);
    throw new Error('Failed to save sessions');
  }
}

// Check if setup is complete (admin exists)
export function isSetupComplete(): boolean {
  const users = loadUsers();
  return users.some(u => u.role === 'admin' && u.isActive);
}

// Create admin user (first time setup)
export function createAdminUser(username: string, password: string, pin: string): User {
  const users = loadUsers();
  
  // Check if admin already exists
  if (users.some(u => u.role === 'admin')) {
    throw new Error('Admin user already exists');
  }

  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    throw new Error(usernameValidation.error || 'Invalid username');
  }

  // Validate password strength
  const passwordStrength = validatePasswordStrength(password);
  if (!passwordStrength.isValid) {
    throw new Error(`Weak password: ${passwordStrength.feedback.join(', ')}`);
  }

  // Validate PIN
  const pinValidation = validatePin(pin);
  if (!pinValidation.isValid) {
    throw new Error(pinValidation.error || 'Invalid PIN');
  }

  const { hash: passwordHash, salt } = hashPassword(password);
  const pinHash = hashPin(pin, salt);

  const admin: User = {
    id: randomBytes(16).toString('hex'),
    username,
    passwordHash,
    pinHash,
    salt,
    role: 'admin',
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  users.push(admin);
  saveUsers(users);
  
  logSecurityEvent({
    type: 'login_success',
    username,
    details: 'Admin user created'
  });
  
  return admin;
}

// Create regular user (by admin)
export function createUser(
  username: string,
  password: string,
  pin: string,
  createdBy: string
): User {
  const users = loadUsers();

  // Check if username already exists
  if (users.some(u => u.username === username)) {
    throw new Error('Username already exists');
  }

  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    throw new Error(usernameValidation.error || 'Invalid username');
  }

  // Validate password strength
  const passwordStrength = validatePasswordStrength(password);
  if (!passwordStrength.isValid) {
    throw new Error(`Weak password: ${passwordStrength.feedback.join(', ')}`);
  }

  // Validate PIN
  const pinValidation = validatePin(pin);
  if (!pinValidation.isValid) {
    throw new Error(pinValidation.error || 'Invalid PIN');
  }

  const { hash: passwordHash, salt } = hashPassword(password);
  const pinHash = hashPin(pin, salt);

  const user: User = {
    id: randomBytes(16).toString('hex'),
    username,
    passwordHash,
    pinHash,
    salt,
    role: 'user',
    createdAt: new Date().toISOString(),
    createdBy,
    isActive: true,
  };

  users.push(user);
  saveUsers(users);

  logSecurityEvent({
    type: 'login_success',
    username: createdBy,
    details: `Created new user: ${username}`
  });

  return user;
}

// Authenticate user
export function authenticateUser(username: string, password: string, ipAddress?: string): User | null {
  // Check rate limit
  const rateLimit = checkRateLimit(ipAddress || username);
  if (!rateLimit.allowed) {
    logSecurityEvent({
      type: 'rate_limit',
      username,
      ip: ipAddress,
      details: rateLimit.message
    });
    throw new Error(rateLimit.message || 'Too many login attempts');
  }

  const users = loadUsers();
  const user = users.find(u => u.username === username && u.isActive);

  if (!user) {
    logSecurityEvent({
      type: 'login_failed',
      username,
      ip: ipAddress,
      details: 'User not found or inactive'
    });
    return null;
  }

  if (!verifyPassword(password, user.passwordHash, user.salt)) {
    logSecurityEvent({
      type: 'login_failed',
      username,
      ip: ipAddress,
      details: 'Invalid password'
    });
    return null;
  }

  // Successful login - reset rate limit
  resetRateLimit(ipAddress || username);

  // Update last login
  user.lastLogin = new Date().toISOString();
  saveUsers(users);

  logSecurityEvent({
    type: 'login_success',
    username,
    ip: ipAddress,
    details: 'User authenticated successfully'
  });

  return user;
}

// Verify PIN
export function verifyUserPin(userId: string, pin: string): boolean {
  const users = loadUsers();
  const user = users.find(u => u.id === userId && u.isActive);

  if (!user) {
    return false;
  }

  return verifyPin(pin, user.pinHash, user.salt);
}

// Create session
export function createSession(
  user: User, 
  pinVerified: boolean = false, 
  ipAddress?: string,
  fingerprint?: SessionFingerprint
): Session {
  const sessions = loadSessions();
  const now = new Date();

  const session: Session = {
    sessionId: randomBytes(32).toString('hex'),
    userId: user.id,
    username: user.username,
    role: user.role,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    pinVerified,
    lastActivity: now.toISOString(),
    ipAddress,
    fingerprint,
  };

  sessions.push(session);
  saveSessions(sessions);

  return session;
}

// Get session with fingerprint verification
export function getSession(
  sessionId: string, 
  currentFingerprint?: SessionFingerprint
): Session | null {
  const sessions = loadSessions();
  const session = sessions.find(s => s.sessionId === sessionId);

  if (!session) {
    return null;
  }

  const now = new Date();

  // Check if expired
  if (new Date(session.expiresAt) < now) {
    deleteSession(sessionId);
    return null;
  }

  // Verify session fingerprint if available (anti-session hijacking)
  if (session.fingerprint && currentFingerprint) {
    const fingerprintCheck = verifySessionFingerprint(
      session.fingerprint,
      {
        userAgent: currentFingerprint.userAgent,
        acceptLanguage: currentFingerprint.acceptLanguage,
        acceptEncoding: currentFingerprint.acceptEncoding
      }
    );

    if (!fingerprintCheck.isValid) {
      // Possible session hijacking detected!
      logSecurityEvent({
        type: 'session_hijack_attempt',
        username: session.username,
        ip: session.ipAddress,
        details: fingerprintCheck.reason || 'Session fingerprint mismatch'
      });
      
      // Invalidate the session for security
      deleteSession(sessionId);
      return null;
    }
  }

  // Check for inactivity timeout (15 minutes)
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  const lastActivity = new Date(session.lastActivity);
  if (now.getTime() - lastActivity.getTime() > INACTIVITY_TIMEOUT) {
    deleteSession(sessionId);
    logSecurityEvent({
      type: 'logout',
      username: session.username,
      details: 'Session expired due to inactivity'
    });
    return null;
  }

  // Update last activity
  session.lastActivity = now.toISOString();
  saveSessions(sessions);

  return session;
}

// Update session PIN verification
export function updateSessionPinVerification(sessionId: string, verified: boolean): void {
  const sessions = loadSessions();
  const session = sessions.find(s => s.sessionId === sessionId);

  if (session) {
    session.pinVerified = verified;
    saveSessions(sessions);
  }
}

// Delete session (logout)
export function deleteSession(sessionId: string): void {
  let sessions = loadSessions();
  sessions = sessions.filter(s => s.sessionId !== sessionId);
  saveSessions(sessions);
}

// Clean expired sessions
export function cleanExpiredSessions(): void {
  let sessions = loadSessions();
  const now = new Date();
  sessions = sessions.filter(s => new Date(s.expiresAt) > now);
  saveSessions(sessions);
}

// Get all users (admin only)
export function getAllUsers(): Omit<User, 'passwordHash' | 'pinHash' | 'salt'>[] {
  const users = loadUsers();
  return users.map(({ passwordHash, pinHash, salt, ...user }) => user);
}

// Update user status
export function updateUserStatus(userId: string, isActive: boolean): void {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);

  if (user) {
    user.isActive = isActive;
    saveUsers(users);
  }
}

// Delete user
export function deleteUser(userId: string): void {
  let users = loadUsers();
  const user = users.find(u => u.id === userId);

  if (user && user.role === 'admin') {
    throw new Error('Cannot delete admin user');
  }

  users = users.filter(u => u.id !== userId);
  saveUsers(users);
}

// Change user password
export function changeUserPassword(userId: string, newPassword: string): void {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  const { hash: passwordHash, salt } = hashPassword(newPassword);
  user.passwordHash = passwordHash;
  user.salt = salt;

  saveUsers(users);
}

// Change user PIN
export function changeUserPin(userId: string, newPin: string): void {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.pinHash = hashPin(newPin, user.salt);
  saveUsers(users);
}
