const indianCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const indianDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatIndianCurrency(amount: number): string {
  return indianCurrencyFormatter.format(amount);
}

export function formatIndianDate(value: Date | string | number): string {
  return indianDateFormatter.format(new Date(value));
}

export function formatIndianPhone(phoneNumber: string): string {
  const trimmedPhoneNumber = phoneNumber.trim();
  const digits = trimmedPhoneNumber.replace(/\D/g, '');
  let nationalNumber = digits;

  if (digits.startsWith('0091') && digits.length === 14) {
    nationalNumber = digits.slice(4);
  } else if (digits.startsWith('91') && digits.length === 12) {
    nationalNumber = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    nationalNumber = digits.slice(1);
  }

  if (nationalNumber.length !== 10) {
    return trimmedPhoneNumber;
  }

  return `+91 ${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`;
}