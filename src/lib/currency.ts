export type SupportedCurrency = 'USD' | 'EUR' | 'TRY' | 'GBP';

export interface CurrencyConfig {
  locale: string;
  currency: SupportedCurrency;
}

export function formatCurrency(
  amount: number,
  config: CurrencyConfig = { locale: 'tr-TR', currency: 'TRY' }
): string {
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    // Fallback
    return `${amount.toFixed(2)} ${config.currency}`;
  }
}

export function formatNumber(
  amount: number,
  locale: string = 'tr-TR'
): string {
  try {
    return new Intl.NumberFormat(locale).format(amount);
  } catch (error) {
    return amount.toString();
  }
}
