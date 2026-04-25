export const BRAND = "VaultPay";

export const NETWORKS = [
  { id: "mtn",     name: "MTN",     color: "#FFCC00", bg: "#1a1600", logo: "MTN" },
  { id: "airtel",  name: "Airtel",  color: "#FF0000", bg: "#1a0000", logo: "AIR" },
  { id: "glo",     name: "Glo",     color: "#00A651", bg: "#001a0d", logo: "GLO" },
  { id: "9mobile", name: "9mobile", color: "#00b350", bg: "#001a0d", logo: "9MB" },
];

export const DATA_BUNDLES: Record<string, { id: string; name: string; validity: string; price: number }[]> = {
  mtn: [
    { id: "mtn-10mb-100", name: "100MB", validity: "24 hrs", price: 100 },
    { id: "mtn-50mb-200", name: "200MB", validity: "2 days", price: 200 },
    { id: "mtn-100mb-1000", name: "1.5GB", validity: "30 days", price: 1000 },
    { id: "mtn-500mb-2000", name: "4.5GB", validity: "30 days", price: 2000 },
    { id: "mtn-20hrs-1500", name: "6GB", validity: "7 days", price: 1500 },
    { id: "mtn-3gb-2500", name: "6GB", validity: "30 days", price: 2500 },
  ],
  airtel: [
    { id: "airt-50", name: "25MB", validity: "Daily", price: 50 },
    { id: "airt-100", name: "75MB", validity: "Daily", price: 100 },
    { id: "airt-200", name: "200MB", validity: "3 Days", price: 200 },
    { id: "airt-500", name: "750MB", validity: "14 Days", price: 500 },
    { id: "airt-1000", name: "1.5GB", validity: "30 Days", price: 1000 },
    { id: "airt-2000", name: "4.5GB", validity: "30 Days", price: 2000 },
  ],
  glo: [
    { id: "glo100", name: "105MB", validity: "2 days", price: 100 },
    { id: "glo200", name: "350MB", validity: "4 days", price: 200 },
    { id: "glo500", name: "1.05GB", validity: "14 days", price: 500 },
    { id: "glo1000", name: "2.5GB", validity: "30 days", price: 1000 },
    { id: "glo2000", name: "5.8GB", validity: "30 days", price: 2000 },
    { id: "glo2500", name: "7.7GB", validity: "30 days", price: 2500 },
  ],
  "9mobile": [
    { id: "eti-100", name: "100MB", validity: "1 day", price: 100 },
    { id: "eti-200", name: "650MB", validity: "1 day", price: 200 },
    { id: "eti-500", name: "500MB", validity: "30 days", price: 500 },
    { id: "eti-1000", name: "1.5GB", validity: "30 days", price: 1000 },
    { id: "eti-2000", name: "4.5GB", validity: "30 days", price: 2000 },
    { id: "eti-5000", name: "15GB", validity: "30 days", price: 5000 },
  ],
};
