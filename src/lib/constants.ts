export const BRAND = "VaultPay";

export const NETWORKS = [
  { id: "mtn",     name: "MTN",     color: "#FFCC00", bg: "#1a1600", logo: "MTN" },
  { id: "airtel",  name: "Airtel",  color: "#FF0000", bg: "#1a0000", logo: "AIR" },
  { id: "glo",     name: "Glo",     color: "#00A651", bg: "#001a0d", logo: "GLO" },
  { id: "9mobile", name: "9mobile", color: "#00b350", bg: "#001a0d", logo: "9MB" },
];

export const DATA_BUNDLES: Record<string, { id: string; name: string; validity: string; price: number }[]> = {
  mtn:     [{ id:"d1",name:"100MB",validity:"Daily",price:100},{id:"d2",name:"500MB",validity:"7 Days",price:400},{id:"d3",name:"1GB",validity:"30 Days",price:800},{id:"d4",name:"2GB",validity:"30 Days",price:1500},{id:"d5",name:"5GB",validity:"30 Days",price:3500},{id:"d6",name:"10GB",validity:"30 Days",price:6000}],
  airtel:  [{ id:"d1",name:"200MB",validity:"Daily",price:150},{id:"d2",name:"1GB",validity:"14 Days",price:750},{id:"d3",name:"2GB",validity:"30 Days",price:1400},{id:"d4",name:"3GB",validity:"30 Days",price:2000},{id:"d5",name:"5GB",validity:"30 Days",price:3200},{id:"d6",name:"10GB",validity:"30 Days",price:5500}],
  glo:     [{ id:"d1",name:"200MB",validity:"Daily",price:100},{id:"d2",name:"1GB",validity:"14 Days",price:600},{id:"d3",name:"2GB",validity:"30 Days",price:1200},{id:"d4",name:"5GB",validity:"30 Days",price:2800},{id:"d5",name:"10GB",validity:"30 Days",price:5000},{id:"d6",name:"15GB",validity:"30 Days",price:7000}],
  "9mobile":[{id:"d1",name:"150MB",validity:"Daily",price:100},{id:"d2",name:"500MB",validity:"7 Days",price:450},{id:"d3",name:"1.5GB",validity:"30 Days",price:1000},{id:"d4",name:"3GB",validity:"30 Days",price:1800},{id:"d5",name:"5GB",validity:"30 Days",price:3000},{id:"d6",name:"11.5GB",validity:"30 Days",price:6500}],
};
