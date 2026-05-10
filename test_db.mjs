import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const [key, ...val] = line.split("=");
  if (key && val.length) acc[key.trim()] = val.join("=").trim();
  return acc;
}, {});

async function fetchVariations() {
  const networks = ["mtn-data", "airtel-data", "glo-data", "etisalat-data"];
  
  for (const network of networks) {
    console.log(`\nFetching ${network}...`);
    try {
      const res = await fetch(`https://sandbox.vtpass.com/api/service-variations?serviceID=${network}`, {
        headers: {
          "api-key": env.VTPASS_API_KEY,
          "public-key": env.VTPASS_PUBLIC_KEY
        }
      });
      const data = await res.json();
      if (data.content && data.content.varations) {
        console.log(data.content.varations.slice(0, 6).map((v) => ({
          name: v.name,
          price: v.variation_amount,
          code: v.variation_code
        })));
      } else {
        console.log("No variations found:", data);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

fetchVariations();
