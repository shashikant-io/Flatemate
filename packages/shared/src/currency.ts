/**
 * Safe currency operations using exact integer arithmetic (paise)
 * Never uses floating-point arithmetic for monetary calculations.
 */

/**
 * Converts a rupees string to integer paise.
 * Uses exact string parsing to avoid IEEE-754 floating-point inaccuracies.
 * 
 * Valid inputs: "19.99", "2000", "0.5", "0.05", "100.50", "0"
 * Throws on negative numbers, multiple decimal points, more than 2 decimal places, or invalid characters.
 */
export function rupeesToPaise(input: string): number {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Rupees amount cannot be empty');
  }

  // Reject negative values
  if (trimmed.startsWith('-')) {
    throw new Error('Amount cannot be negative');
  }

  // Validate format: digits, optional single decimal point, at most 2 decimal digits
  const regex = /^(\d+)(?:\.(\d{1,2}))?$/;
  const match = trimmed.match(regex);

  if (!match) {
    throw new Error(`Invalid rupee amount format: "${input}"`);
  }

  const integerPartStr = match[1];
  const decimalPartStr = match[2] || '';

  // Parse integer part as BigInt or safe integer
  const integerPart = parseInt(integerPartStr, 10);
  if (!Number.isSafeInteger(integerPart)) {
    throw new Error('Amount exceeds maximum safe integer');
  }

  // Pad decimal part to exactly 2 digits (e.g., "5" -> 50 paise, "05" -> 5 paise, "" -> 0 paise)
  const decimalPart = parseInt(decimalPartStr.padEnd(2, '0'), 10);

  const totalPaise = integerPart * 100 + decimalPart;
  if (!Number.isSafeInteger(totalPaise)) {
    throw new Error('Amount in paise exceeds maximum safe integer');
  }

  return totalPaise;
}

/**
 * Formats integer paise to rupees standard decimal string "0.00"
 */
export function paiseToRupees(paise: number): string {
  if (!Number.isInteger(paise)) {
    throw new Error(`paise must be an integer, received: ${paise}`);
  }

  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const remainingPaise = absPaise % 100;

  const paddedPaise = remainingPaise.toString().padStart(2, '0');
  return `${isNegative ? '-' : ''}${rupees}.${paddedPaise}`;
}

/**
 * Formats integer paise using the Indian numbering system:
 * e.g., ₹1,23,456.78
 */
export function formatINR(
  paise: number,
  options: { showSign?: boolean; showSymbol?: boolean } = {}
): string {
  const { showSign = false, showSymbol = true } = options;

  if (!Number.isInteger(paise)) {
    throw new Error(`paise must be an integer, received: ${paise}`);
  }

  const isNegative = paise < 0;
  const isPositive = paise > 0;
  const absPaise = Math.abs(paise);

  const rupees = Math.floor(absPaise / 100);
  const remPaise = (absPaise % 100).toString().padStart(2, '0');

  // Format rupees part with Indian grouping:
  // Last 3 digits, then comma, then groups of 2 digits
  const rupeeStr = rupees.toString();
  let formattedRupees: string;

  if (rupeeStr.length <= 3) {
    formattedRupees = rupeeStr;
  } else {
    const last3 = rupeeStr.slice(-3);
    const rest = rupeeStr.slice(0, -3);
    // Group remaining into pairs from right to left
    const restFormatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedRupees = `${restFormatted},${last3}`;
  }

  const sign = isNegative ? '-' : showSign && isPositive ? '+' : '';
  const symbol = showSymbol ? '₹' : '';

  return `${sign}${symbol}${formattedRupees}.${remPaise}`;
}

/**
 * Formats balance / settlement message from the perspective of viewerMemberId
 */
export function formatSettlementMessage(
  fromMemberId: string,
  toMemberId: string,
  amountPaise: number,
  viewerMemberId: string,
  memberNames: Record<string, string> = {}
): string {
  if (amountPaise <= 0) {
    return 'All settled up!';
  }

  const fromName = memberNames[fromMemberId] || fromMemberId;
  const toName = memberNames[toMemberId] || toMemberId;
  const formattedAmount = formatINR(amountPaise);

  if (viewerMemberId === fromMemberId) {
    return `You owe ${toName} ${formattedAmount}`;
  } else if (viewerMemberId === toMemberId) {
    return `${fromName} owes you ${formattedAmount}`;
  } else {
    return `${fromName} owes ${toName} ${formattedAmount}`;
  }
}

