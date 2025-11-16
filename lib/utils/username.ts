export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;

// Alphanumeric and underscore, 3-20 characters
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < MIN_USERNAME_LENGTH) {
    return {
      valid: false,
      error: `Username must be at least ${MIN_USERNAME_LENGTH} characters`,
    };
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    return {
      valid: false,
      error: `Username must be at most ${MAX_USERNAME_LENGTH} characters`,
    };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      error: 'Username must contain only letters, numbers, and underscores',
    };
  }

  return { valid: true };
}
