export const toArabicNumerals = (num: number | string): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (d) => arabicNumbers[parseInt(d)]);
};

export const formatPrice = (amount: number, language: string): string => {
  // Conversion rate: 1 INR = 0.26 EGP (as per requirement)
  const egpAmount = Math.round(amount * 0.26);
  
  if (language === 'ar') {
    return `${toArabicNumerals(egpAmount)} ج.م`;
  } else {
    return `EGP ${egpAmount}`;
  }
};