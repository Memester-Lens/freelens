import { IFormValues } from "../components/Form/ServiceForm";

export function extractCreateServiceDetails(inputString: string): IFormValues {
  // Define regular expressions for amount and token name extraction
  const amountPattern = /\b\d+(\.\d+)?\b/;
  const tokenNamePattern = /\b[A-Z]+\b/;

  inputString = inputString.replace('/create-gig ', '');

  // Extract title
  const title = inputString.split(' for ')[0].trim();

  // Extract amount
  const amountMatch = inputString.match(amountPattern);
  const rateAmount = amountMatch ? parseFloat(amountMatch[0]) : 1;

  // Extract token name
  const tokenNameMatch = inputString.match(tokenNamePattern);
  const rateToken = tokenNameMatch ? tokenNameMatch[0] : 'MATIC';

  return { title, rateAmount, rateToken, keywords: '', about: '' };
}

export function extractID(inputString: string): string | null {
  console.log(inputString);
  const idPattern = /id:(\d+(?:-\d+)?)/;
  const matches = inputString.match(idPattern);
  if (matches && matches.length === 2) {
    return matches[1];
  }
  return null;
}