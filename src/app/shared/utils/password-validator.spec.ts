import { isStrongPassword } from './password-validator';

describe('isStrongPassword', () => {
  it('should return true for a valid strong password', () => {
    expect(isStrongPassword(validPassword)).toBeTrue();
  });

  it('should return false if password is too short', () => {
    expect(isStrongPassword(tooShort)).toBeFalse();
  });

  it('should return false if missing uppercase', () => {
    expect(isStrongPassword(noUpperCase)).toBeFalse();
  });

  it('should return false if missing lowercase', () => {
    expect(isStrongPassword(noLowerCase)).toBeFalse();
  });

  it('should return false if missing numbers', () => {
    expect(isStrongPassword(noNumber)).toBeFalse();
  });

  it('should return false if missing special characters', () => {
    expect(isStrongPassword(noSpecial)).toBeFalse();
  });

  it('should return false for numbers only', () => {
    expect(isStrongPassword(onlyNumbers)).toBeFalse();
  });

  it('should return false for special characters only', () => {
    expect(isStrongPassword(onlySpecial)).toBeFalse();
  });

  it('should return false for lowercase letters only', () => {
    expect(isStrongPassword(allLowers)).toBeFalse();
  });

  it('should return false for uppercase letters only', () => {
    expect(isStrongPassword(allUppers)).toBeFalse();
  });

  it('should return false for empty password', () => {
    expect(isStrongPassword('')).toBeFalse();
  });

  it('should return false for 12 spaces', () => {
    expect(isStrongPassword('            ')).toBeFalse();
  });
});

// Mock password data for varied scenarios
const validPassword = 'Abcd1234!@#$';
const tooShort = 'Abc1!';
const noUpperCase = 'abcd1234!@#$';
const noLowerCase = 'ABCD1234!@#$';
const noNumber = 'Abcdefgh!@#$';
const noSpecial = 'Abcd1234abcd';
const onlyNumbers = '123456789012';
const onlySpecial = '!@#$%^&*()_+';
const allLowers = 'abcdefghijkz';
const allUppers = 'ABCDEFGHIJKL';
