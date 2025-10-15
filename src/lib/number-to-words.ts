export function convertToWords(num: number): string {
  if (num === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return "";

    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return tens[ten] + (one > 0 ? " " + ones[one] : "");
    }

    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    return (
      ones[hundred] +
      " Hundred" +
      (remainder > 0 ? " and " + convertLessThanThousand(remainder) : "")
    );
  }

  // Handle decimal part
  const parts = num.toFixed(2).split(".");
  const integerPart = Number.parseInt(parts[0]);
  const decimalPart = Number.parseInt(parts[1]);

  if (integerPart === 0 && decimalPart === 0) return "Zero";

  let result = "";

  // Convert integer part
  if (integerPart >= 1000000) {
    const millions = Math.floor(integerPart / 1000000);
    result += convertLessThanThousand(millions) + " Million ";
    const remainder = integerPart % 1000000;
    if (remainder > 0) {
      if (remainder >= 1000) {
        const thousands = Math.floor(remainder / 1000);
        result += convertLessThanThousand(thousands) + " Thousand ";
        const lastPart = remainder % 1000;
        if (lastPart > 0) {
          result += convertLessThanThousand(lastPart);
        }
      } else {
        result += convertLessThanThousand(remainder);
      }
    }
  } else if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    result += convertLessThanThousand(thousands) + " Thousand ";
    const remainder = integerPart % 1000;
    if (remainder > 0) {
      result += convertLessThanThousand(remainder);
    }
  } else {
    result = convertLessThanThousand(integerPart);
  }

  result = result.trim();

  // Add "Birr" or currency
  if (result) {
    result += " Birr";
  }

  // Add decimal part (cents)
  if (decimalPart > 0) {
    result += " and " + convertLessThanThousand(decimalPart) + " Cents";
  }

  return result.trim();
}
