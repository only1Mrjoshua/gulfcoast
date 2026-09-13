// utils/otp.js
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const generateOTP = () =>
  String(crypto.randomInt(100000, 1000000)); // 6 digits, leading-zero safe

export const hashOTP = (otp) => bcrypt.hash(otp, 8);

export const verifyOTP = (otp, hash) => bcrypt.compare(otp, hash);

export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  const first = local[0] || '';
  return `${first}***@${domain}`;
};

// Human-readable device label from a User-Agent string
export const describeDevice = (ua = '') => {
  if (!ua) return 'Unknown device';
  const isMobile = /iPhone|iPad|Android/i.test(ua);
  const browser =
    /Chrome/.test(ua) ? 'Chrome' :
    /Safari/.test(ua) ? 'Safari' :
    /Firefox/.test(ua) ? 'Firefox' :
    /Edg/.test(ua) ? 'Edge' : 'Browser';
  const os =
    /Windows/.test(ua) ? 'Windows' :
    /Mac OS X/.test(ua) ? 'macOS' :
    /Android/.test(ua) ? 'Android' :
    /iPhone|iPad/.test(ua) ? 'iOS' :
    /Linux/.test(ua) ? 'Linux' : '';
  return `${browser} on ${isMobile && os ? os : os || 'Unknown OS'}`;
};

// Best-effort IP resolution behind proxies (Vercel, etc.)
export const getClientIP = (req) => {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    ''
  );
};