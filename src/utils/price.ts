// Price formatting utilities
export const arabicDigits = (n: string) => {
  const map: Record<string, string> = {
    '0': '٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩',',':',','.' : '.'
  };
  return n.split("").map(ch => map[ch] ?? ch).join("");
};

export const formatPrice = (amount: number, lang: 'en'|'ar' = 'en') => {
  if (!Number.isFinite(amount)) amount = 0;
  // Format number with two decimals
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  if (lang === 'ar') {
    // Use Arabic numerals and append Arabic currency label
    const digits = arabicDigits(formatted);
    return `${digits} ج.م`;
  }

  return `${formatted} EGP`;
};

export default formatPrice;
