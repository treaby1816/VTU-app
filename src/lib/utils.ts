export const BRAND = "VaultPay";
export const CURRENCY = "₦";

export const fmtN = (n: number) => 
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const generateTxId = () => 
  "VP" + Math.random().toString(36).substring(2, 10).toUpperCase();

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const NETWORKS = [
  { id: "mtn", name: "MTN", color: "#FFCC00", logo: "M" },
  { id: "airtel", name: "Airtel", color: "#FF0000", logo: "A" },
  { id: "glo", name: "Glo", color: "#00FF00", logo: "G" },
  { id: "9mobile", name: "9mobile", color: "#006600", logo: "9" },
];
