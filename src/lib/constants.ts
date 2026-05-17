export const BRAND = "VaultPay";

export const NETWORKS = [
  { id: "mtn",     name: "MTN",     color: "#FFCC00", bg: "#1a1600", logo: "MTN" },
  { id: "airtel",  name: "Airtel",  color: "#FF0000", bg: "#1a0000", logo: "AIR" },
  { id: "glo",     name: "Glo",     color: "#00A651", bg: "#001a0d", logo: "GLO" },
  { id: "9mobile", name: "9mobile", color: "#00b350", bg: "#001a0d", logo: "9MB" },
];

export const DATA_BUNDLES: Record<string, { id: string; name: string; validity: string; price: number }[]> = {
  mtn: [
    { id: "fafo-mtn-500mb-2d",  name: "500MB", validity: "2 Days",  price: 220 },
    { id: "fafo-mtn-1gb-1d",    name: "1GB",   validity: "1 Day",   price: 260 },
    { id: "fafo-mtn-1gb-7d",    name: "1GB",   validity: "7 Days",  price: 420 },
    { id: "fafo-mtn-1gb-30d",   name: "1GB",   validity: "30 Days", price: 545 },
    { id: "fafo-mtn-2gb-30d",   name: "2GB",   validity: "30 Days", price: 820 },
    { id: "fafo-mtn-5gb-30d",   name: "5GB",   validity: "30 Days", price: 1900 },
    { id: "fafo-mtn-10gb-30d",  name: "10GB",  validity: "30 Days", price: 4500 },
    { id: "fafo-mtn-20gb-30d",  name: "20GB",  validity: "30 Days", price: 7500 },
  ],
  airtel: [
    { id: "fafo-airtel-150mb-1d",  name: "150MB", validity: "1 Day",   price: 61 },
    { id: "fafo-airtel-600mb-2d",  name: "600MB", validity: "2 Days",  price: 220 },
    { id: "fafo-airtel-1gb-1d",    name: "1GB",   validity: "1 Day",   price: 500 },
    { id: "fafo-airtel-1gb-7d",    name: "1GB",   validity: "7 Days",  price: 800 },
    { id: "fafo-airtel-2gb-30d",   name: "2GB",   validity: "30 Days", price: 1500 },
    { id: "fafo-airtel-4gb-30d",   name: "4GB",   validity: "30 Days", price: 2500 },
    { id: "fafo-airtel-8gb-30d",   name: "8GB",   validity: "30 Days", price: 3000 },
    { id: "fafo-airtel-10gb-30d",  name: "10GB",  validity: "30 Days", price: 4000 },
  ],
  glo: [
    { id: "fafo-glo-200mb-14d",  name: "200MB", validity: "14 Days", price: 88 },
    { id: "fafo-glo-1gb-7d",     name: "1GB",   validity: "7 Days",  price: 340 },
    { id: "fafo-glo-1gb-30d",    name: "1GB",   validity: "30 Days", price: 425 },
    { id: "fafo-glo-2gb-30d",    name: "2GB",   validity: "30 Days", price: 836 },
    { id: "fafo-glo-5gb-30d",    name: "5GB",   validity: "30 Days", price: 2090 },
    { id: "fafo-glo-10gb-7d",    name: "10GB",  validity: "7 Days",  price: 2000 },
    { id: "fafo-glo-38gb-30d",   name: "38GB",  validity: "30 Days", price: 9500 },
  ],
  "9mobile": [
    { id: "fafo-9m-83mb-1d",    name: "83MB",  validity: "1 Day",   price: 102 },
    { id: "fafo-9m-250mb-7d",   name: "250MB", validity: "7 Days",  price: 199 },
    { id: "fafo-9m-500mb-30d",  name: "500MB", validity: "30 Days", price: 245 },
    { id: "fafo-9m-1gb-30d",    name: "1GB",   validity: "30 Days", price: 490 },
    { id: "fafo-9m-2gb-30d",    name: "2GB",   validity: "30 Days", price: 980 },
    { id: "fafo-9m-3gb-30d",    name: "3GB",   validity: "30 Days", price: 1470 },
    { id: "fafo-9m-5gb-30d",    name: "5GB",   validity: "30 Days", price: 2450 },
  ],
};
