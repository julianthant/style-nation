// Price formatting utilities

// Format price as currency (assuming price is in cents)
export function formatPrice(priceInCents: number): string {
  const priceInDollars = priceInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInDollars);
}

// Format price as plain number string (without currency symbol)
export function formatPriceNumber(priceInDollars: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInDollars);
}