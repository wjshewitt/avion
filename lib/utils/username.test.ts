import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from './username';

describe('validateUsername', () => {
  it('accepts a valid username', () => {
    const { valid, error } = validateUsername('pilot_123');
    expect(valid).toBe(true);
    expect(error).toBeUndefined();
  });

  it('rejects usernames that are too short', () => {
    const tooShort = 'a'.repeat(MIN_USERNAME_LENGTH - 1);
    const { valid, error } = validateUsername(tooShort);
    expect(valid).toBe(false);
    expect(error).toContain('at least');
  });

  it('rejects usernames that are too long', () => {
    const tooLong = 'a'.repeat(MAX_USERNAME_LENGTH + 1);
    const { valid, error } = validateUsername(tooLong);
    expect(valid).toBe(false);
    expect(error).toContain('at most');
  });

  it('rejects usernames with invalid characters', () => {
    const { valid, error } = validateUsername('pilot-123');
    expect(valid).toBe(false);
    expect(error).toContain('letters, numbers, and underscores');
  });

  it('rejects empty usernames', () => {
    const { valid } = validateUsername('');
    expect(valid).toBe(false);
  });
});
