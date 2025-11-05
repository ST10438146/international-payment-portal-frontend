// Client-side validation patterns matching backend
export const patterns = {
  username: /^[a-z0-9_]{3,30}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  accountNumber: /^[0-9]{10,16}$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  fullName: /^[a-zA-Z\s'-]{2,100}$/,
  amount: /^\d+(\.\d{1,2})?$/,
  bankName: /^[a-zA-Z0-9\s&'-]{2,100}$/,
};

export const validateField = (name, value) => {
  switch (name) {
    case 'username':
      if (!patterns.username.test(value)) {
        return 'Username must be 3-30 characters (lowercase letters, numbers, underscore)';
      }
      break;
    case 'password':
      if (!patterns.password.test(value)) {
        return 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
      }
      break;
    case 'accountNumber':
    case 'payeeAccountNumber':
      if (!patterns.accountNumber.test(value)) {
        return 'Account number must be 10-16 digits';
      }
      break;
    case 'swiftCode':
      const upper = value.toUpperCase();
      if (!patterns.swiftCode.test(upper)) {
        return 'Invalid SWIFT code format (e.g., AAAABBCCXXX)';
      }
      break;
    case 'amount':
      if (!patterns.amount.test(value) || parseFloat(value) <= 0) {
        return 'Invalid amount';
      }
      break;
    case 'payeeAccountName':
      if (!patterns.fullName.test(value)) {
        return 'Invalid account name format';
      }
      break;
    case 'payeeBankName':
      if (!patterns.bankName.test(value)) {
        return 'Invalid bank name format';
      }
      break;
    default:
      break;
  }
  return null;
};

export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/[<>]/g, '');
};