// const axios = require("axios");

// // Very reliable servers
// const OVERPASS_SERVERS = [
//   "https://overpass.kumi.systems/api/interpreter",
//   "https://overpass-api.de/api/interpreter"
// ];

// // Supported categories
// const VALID_CATEGORIES = {
//   cafe: { type: "amenity", value: "cafe" },
//   restaurant: { type: "amenity", value: "restaurant" },
//   fast_food: { type: "amenity", value: "fast_food" },
//   bar: { type: "amenity", value: "bar" },
//   pub: { type: "amenity", value: "pub" },
//   bakery: { type: "shop", value: "bakery" },
//   hairdresser: { type: "shop", value: "hairdresser" },
//   beauty: { type: "shop", value: "beauty" },
//   bookstore: { type: "shop", value: "books" },
//   convenience: { type: "shop", value: "convenience" },
//   clothes: { type: "shop", value: "clothes" },
//   electronics: { type: "shop", value: "electronics" },
//   florist: { type: "shop", value: "florist" }
// };

// // Small helper
// const delay = (ms) => new Promise(r => setTimeout(r, ms));

// // Format address nicely
// function formatAddress(tags){
//   if (!tags) return "";
//   const fields = ["addr:housenumber", "addr:street", "addr:city", "addr:postcode"];
//   return fields.map(f => tags[f]).filter(Boolean).join(", ");
// }

// // Get bounding box of the city
// async function getCityBBox(city){
//   const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
//   const res = await axios.get(url, { headers: { "User-Agent": "simple-osm-scraper" } });
//   if (!res.data[0]) throw new Error("City not found");
//   return res.data[0].boundingbox.map(Number);  // [south, north, west, east]
// }

// // Make Overpass query (SUPER FAST)
// function buildQuery(type, value, bbox, limit){
//   const [south, north, west, east] = bbox;
//   return `
//     [out:json][timeout:60];
//     (
//       node["${type}"="${value}"](${south},${west},${north},${east});
//       way["${type}"="${value}"](${south},${west},${north},${east});
//       relation["${type}"="${value}"](${south},${west},${north},${east});
//     );
//     out center ${limit};
//   `.trim();
// }

// // Try Overpass servers one by one
// async function overpassRequest(query){
//   for (const server of OVERPASS_SERVERS){
//     try {
//       const res = await axios.post(server, query, {
//         headers: { "Content-Type": "text/plain" },
//         timeout: 60000
//       });
//       return res.data.elements || [];
//     } catch (e) {
//       console.log(`Overpass failed → ${server}`);
//       await delay(2000);
//     }
//   }
//   return [];
// }

// // Scrape ONE category
// async function scrapeCategory(city, category, limit){
//   const cat = VALID_CATEGORIES[category];
//   if (!cat) return [];

//   const bbox = await getCityBBox(city);
//   const query = buildQuery(cat.type, cat.value, bbox, limit);

//   const elements = await overpassRequest(query);
//   const result = [];

//   for (const el of elements){
//     const tags = el.tags || {};
//     if (!tags.name) continue;

//     result.push({
//       name: tags.name,
//       type: tags.amenity || tags.shop || category,
//       address: formatAddress(tags),
//       phone: tags.phone || tags["contact:phone"] || "",
//       website: tags.website || tags["contact:website"] || "",
//       email: tags.email || tags["contact:email"] || "",
//       lat: el.lat || (el.center && el.center.lat),
//       lon: el.lon || (el.center && el.center.lon),
//       osm_id: el.id
//     });
//   }

//   return result;
// }

// // Main function
// async function scrapeBusinesses(city, categories, limit = 500){
//   const all = [];
//   for (const cat of categories){
//     console.log(`Fetching ${cat}…`);
//     const data = await scrapeCategory(city, cat, limit);
//     all.push(...data);
//     await delay(1500);
//   }

//   // Dedupe
//   const uniq = [];
//   const seen = new Set();
//   for (const x of all){
//     if (!seen.has(x.osm_id)){
//       uniq.push(x);
//       seen.add(x.osm_id);
//     }
//   }
//   return uniq;
// }

// module.exports = { scrapeBusinesses };










// const axios = require("axios");

// // Best Overpass servers (fallback order)
// const OVERPASS_SERVERS = [
//   "https://overpass.kumi.systems/api/interpreter",
//   "https://overpass-api.de/api/interpreter",
//   "https://lz4.overpass-api.de/api/interpreter",
//   "https://overpass.openstreetmap.fr/api/interpreter"
// ];

// const VALID_CATEGORIES = {
//   cafe: { type: "amenity", value: "cafe" },
//   restaurant: { type: "amenity", value: "restaurant" },
//   fast_food: { type: "amenity", value: "fast_food" },
//   bar: { type: "amenity", value: "bar" },
//   pub: { type: "amenity", value: "pub" },
//   bakery: { type: "shop", value: "bakery" },
//   hairdresser: { type: "shop", value: "hairdresser" },
//   beauty: { type: "shop", value: "beauty" },
//   bookstore: { type: "shop", value: "books" },
//   convenience: { type: "shop", value: "convenience" },
//   clothes: { type: "shop", value: "clothes" },
//   electronics: { type: "shop", value: "electronics" },
//   florist: { type: "shop", value: "florist" },
//   jewelry: { type: "shop", value: "jewelry" },
//   sports: { type: "shop", value: "sports" },
//   toy: { type: "shop", value: "toys" }
// };

// // Sleep helper
// const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// function formatAddress(tags){
//   if (!tags) return "";
//   const parts = [];
//   ["addr:housenumber","addr:street","addr:city","addr:state","addr:postcode"].forEach(k=>{
//     if(tags[k]) parts.push(tags[k]);
//   });
//   return parts.join(", ");
// }

// // Get exact city coordinates
// async function getCityCenter(city){
//   const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`;
//   const res = await axios.get(url, { headers: { "User-Agent": "college-osm-scraper/1.0" } });
//   if (!res.data || !res.data[0]) throw new Error("City not found");
//   return {
//     lat: parseFloat(res.data[0].lat),
//     lon: parseFloat(res.data[0].lon)
//   };
// }

// // Build radius query (MUCH FASTER)
// function buildQuery(type, value, lat, lon, radiusKm){
//   return `
// [out:json][timeout:90];
// node["${type}"="${value}"](around:${radiusKm * 1000}, ${lat}, ${lon});
// out body;
// `.trim();
// }

// // Auto retry across Overpass servers
// async function overpassRequest(query){
//   for (let i = 0; i < OVERPASS_SERVERS.length; i++){
//     const url = OVERPASS_SERVERS[i];
//     try {
//       const res = await axios.post(url, query, {
//         headers: { "Content-Type": "text/plain" },
//         timeout: 90000
//       });
//       return res.data.elements || [];
//     } catch (err) {
//       console.log(`Overpass failed (${url}). Retrying...`);
//       await delay(3000);
//     }
//   }
//   return [];
// }

// async function scrapeCategory(city, category, radiusKm){
//   const { type, value } = VALID_CATEGORIES[category];
//   const { lat, lon } = await getCityCenter(city);

//   console.log(`Scraping ${category} within ${radiusKm} km radius...`);

//   const query = buildQuery(type, value, lat, lon, radiusKm);
//   const elements = await overpassRequest(query);

//   const results = [];
//   for(const el of elements){
//     if (!el.tags || !el.tags.name) continue;
//     const tags = el.tags;

//     results.push({
//       name: tags.name,
//       type: tags.amenity || tags.shop || value,
//       address: formatAddress(tags),
//       phone: tags.phone || tags["contact:phone"] || "",
//       website: tags.website || tags["contact:website"] || "",
//       email: tags.email || tags["contact:email"] || "",
//       lat: el.lat,
//       lon: el.lon,
//       osm_id: el.id
//     });
//   }

//   return results;
// }

// async function scrapeBusinesses(city, categories, radiusKm = 5){
//   const all = [];

//   for(const c of categories){
//     if (!VALID_CATEGORIES[c]) continue;

//     const data = await scrapeCategory(city, c, radiusKm);
//     all.push(...data);

//     // Small delay to avoid Overpass bans
//     await delay(3000);
//   }

//   // Deduplicate
//   const unique = [];
//   const seen = new Set();
//   for(const b of all){
//     if (!seen.has(b.osm_id)){
//       unique.push(b);
//       seen.add(b.osm_id);
//     }
//   }

//   return unique;
// }

// module.exports = { scrapeBusinesses };



// const axios = require("axios");
// const https = require('https');

// const agent = new https.Agent({ family: 4 }); // Force IPv4
// // List of small business categories
// const VALID_CATEGORIES = {
//   cafe: { type: "amenity", value: "cafe" },
//   restaurant: { type: "amenity", value: "restaurant" },
//   fast_food: { type: "amenity", value: "fast_food" },
//   bar: { type: "amenity", value: "bar" },
//   pub: { type: "amenity", value: "pub" },
//   bakery: { type: "shop", value: "bakery" },
//   hairdresser: { type: "shop", value: "hairdresser" },
//   beauty: { type: "shop", value: "beauty" },
//   bookstore: { type: "shop", value: "books" },
//   convenience: { type: "shop", value: "convenience" },
//   clothes: { type: "shop", value: "clothes" },
//   electronics: { type: "shop", value: "electronics" },
//   florist: { type: "shop", value: "florist" },
//   jewelry: { type: "shop", value: "jewelry" },
//   sports: { type: "shop", value: "sports" },
//   toy: { type: "shop", value: "toys" }
// };

// // 1️⃣ Get city coordinates + bounding box
// async function getCityBBox(city){
//   const url = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&q=${encodeURIComponent(city)}&limit=1`;
//   const res = await axios.get(url, { headers: { "User-Agent": "college-osm-scraper/1.0" } });
//   if(!res.data || !res.data[0]) throw new Error("City not found");
//   const place = res.data[0];
//   return {
//     lat: parseFloat(place.lat),
//     lon: parseFloat(place.lon),
//     bbox: place.boundingbox.map(Number) // [south, north, west, east]
//   };
// }

// // 2️⃣ Build Overpass query
// function buildOverpassQueryBBox(bbox, type, value){
//   const [south, north, west, east] = bbox;
//   return `
// [out:json][timeout:25];
// (
//   node["${type}"="${value}"](${south},${west},${north},${east});
//   way["${type}"="${value}"](${south},${west},${north},${east});
// );
// out body;
// >;
// out skel qt;
// `.trim();
// }

// // 3️⃣ Format address
// function formatAddress(tags){
//   if(!tags) return "";
//   const parts = [];
//   ["addr:housenumber","addr:street","addr:city","addr:state","addr:postcode","addr:country"].forEach(k=>{
//     if(tags[k]) parts.push(tags[k]);
//   });
//   return parts.join(", ");
// }

// // 4️⃣ Scrape single category + bounding box with retries
// const OVERPASS_URLS = [
//   "https://overpass-api.de/api/interpreter",
//   "https://overpass.kumi.systems/api/interpreter",
//   "https://lz4.overpass-api.de/api/interpreter",
//   "https://overpass.openstreetmap.ru/api/interpreter"
// ];

// async function scrapeCategoryBBox(bbox, type, value, retries=3){
//   const query = buildOverpassQueryBBox(bbox, type, value);
//   for(let attempt=1; attempt<=retries; attempt++){
//     try{
//       // rotate endpoint each retry
//       const url = OVERPASS_URLS[attempt % OVERPASS_URLS.length];
//       const res = await axios.post(url, query, {
//         headers: { 
//           "Content-Type": "text/plain",
//           "User-Agent": "college-osm-scraper/1.0 (your-email@example.com)"
//         },
//         timeout: 180000
//       });
//       return res.data.elements || [];
//     }catch(err){
//       if(err.response && err.response.status===504){
//         console.log(`504 Timeout for ${value}, retry ${attempt}/${retries}...`);
//         await new Promise(r=>setTimeout(r, 5000));
//       } else if(err.response && err.response.status===403){
//         console.log(`403 Forbidden for ${value}, retry ${attempt}/${retries} with different server...`);
//         await new Promise(r=>setTimeout(r, 5000));
//       } else throw err;
//     }
//   }
//   console.warn(`Failed ${value} after ${retries} attempts`);
//   return [];
// }


// // 5️⃣ Main scraper
// async function scrapeBusinesses(city, categoryKeys, radiusKm=5){
//   const { lat, lon, bbox } = await getCityBBox(city);
//   const all = [];

//   // Optional: split bbox into 2x2 grid for huge cities
//   const [south, north, west, east] = bbox;
//   const latMid = (south+north)/2;
//   const lonMid = (west+east)/2;
//   const subBBoxes = [
//     [south, latMid, west, lonMid],
//     [south, latMid, lonMid, east],
//     [latMid, north, west, lonMid],
//     [latMid, north, lonMid, east]
//   ];

//   for(const cat of categoryKeys){
//     if(!VALID_CATEGORIES[cat]) continue;
//     const { type, value } = VALID_CATEGORIES[cat];

//     for(const bb of subBBoxes){
//       console.log(`Scraping ${cat} in bbox ${bb}`);
//       const elements = await scrapeCategoryBBox(bb, type, value);
//       for(const el of elements){
//         if(!el.tags || !el.tags.name) continue;
//         const tags = el.tags;
//         all.push({
//           name: tags.name,
//           type: tags.amenity || tags.shop || value,
//           address: formatAddress(tags),
//           phone: tags.phone || tags["contact:phone"] || "",
//           website: tags.website || tags["contact:website"] || tags.url || "",
//           email: tags.email || tags["contact:email"] || "",
//           osm_id: el.id
//         });
//       }
//       // Small pause to reduce Overpass load
//       await new Promise(r=>setTimeout(r, 2000));
//     }
//   }

//   // Remove duplicates by osm_id
//   const unique = [];
//   const seen = new Set();
//   for(const b of all){
//     if(!seen.has(b.osm_id)){
//       unique.push(b);
//       seen.add(b.osm_id);
//     }
//   }

//   // Keep only entries with 2+ contact details
//   const filtered = unique.filter(b=>{
//     let count=0;
//     if(b.phone) count++;
//     if(b.website) count++;
//     if(b.email) count++;
//     return count>=2;
//   });

//   return filtered;
// }

// module.exports = { scrapeBusinesses, VALID_CATEGORIES };


// const axios = require("axios");

// // Full list of common small business categories in OSM
// const VALID_CATEGORIES = {
//   cafe: { type: "amenity", value: "cafe" },
//   restaurant: { type: "amenity", value: "restaurant" },
//   fast_food: { type: "amenity", value: "fast_food" },
//   bar: { type: "amenity", value: "bar" },
//   pub: { type: "amenity", value: "pub" },
//   bakery: { type: "shop", value: "bakery" },
//   hairdresser: { type: "shop", value: "hairdresser" },
//   beauty: { type: "shop", value: "beauty" },
//   bookstore: { type: "shop", value: "books" },
//   convenience: { type: "shop", value: "convenience" },
//   clothes: { type: "shop", value: "clothes" },
//   electronics: { type: "shop", value: "electronics" },
//   florist: { type: "shop", value: "florist" },
//   jewelry: { type: "shop", value: "jewelry" },
//   sports: { type: "shop", value: "sports" },
//   toy: { type: "shop", value: "toys" }
// };

// async function geocodeCity(city) {
//   const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`;
//   const res = await axios.get(url, { headers: { "User-Agent": "college-osm-scraper/1.0" } });
//   if (!res.data || res.data.length === 0) throw new Error("City not found");
//   const place = res.data[0];
//   return { lat: parseFloat(place.lat), lon: parseFloat(place.lon) };
// }

// function buildOverpassQuery(lat, lon, type, value, radiusMeters, maxResults) {
//   return `
// [out:json][timeout:25];
// (
//   node["${type}"="${value}"](around:${radiusMeters},${lat},${lon});
//   way["${type}"="${value}"](around:${radiusMeters},${lat},${lon});
// );
// out body ${maxResults};
// >;
// out skel qt;
// `.trim();
// }

// function formatAddress(tags) {
//   if (!tags) return "";
//   const parts = [];
//   ["addr:housenumber","addr:street","addr:city","addr:state","addr:postcode","addr:country"].forEach(k=>{
//     if(tags[k]) parts.push(tags[k]);
//   });
//   return parts.join(", ");
// }

// async function scrapeCategory(city, categoryKey, radiusKm=5, maxResults=1000) {
//   if (!VALID_CATEGORIES[categoryKey]) throw new Error("Invalid category: "+categoryKey);
//   const { type, value } = VALID_CATEGORIES[categoryKey];
//   const geo = await geocodeCity(city);
//   const radiusMeters = radiusKm*1000;
//   const query = buildOverpassQuery(geo.lat, geo.lon, type, value, radiusMeters, maxResults);
//   const res = await axios.post("https://overpass-api.de/api/interpreter", query, {
//     headers: { "Content-Type": "text/plain", "User-Agent": "college-osm-scraper/1.0" },
//     timeout: 60000
//   });
//   const elements = res.data.elements || [];
//   const businesses = [];
//   for(const el of elements){
//     if(!el.tags || !el.tags.name) continue;
//     const tags = el.tags;
//     businesses.push({
//       name: tags.name,
//       type: tags.amenity || tags.shop || value,
//       address: formatAddress(tags),
//       phone: tags.phone || tags["contact:phone"] || "",
//       website: tags.website || tags["contact:website"] || tags.url || "",
//       email: tags.email || tags["contact:email"] || "",
//       osm_id: el.id
//     });
//   }
//   return businesses;
// }

// async function scrapeBusinesses(city, categoryKeys, radiusKm=5, maxResults=1000) {
//   let all = [];
//   for(const cat of categoryKeys){
//     try{
//       const data = await scrapeCategory(city, cat, radiusKm, maxResults);
//       all = all.concat(data);
//     }catch(err){
//       console.error("Error scraping category", cat, err.message);
//     }
//   }

//   // Remove duplicates by OSM ID
//   const unique = [];
//   const seen = new Set();
//   for(const b of all){
//     if(!seen.has(b.osm_id)){
//       unique.push(b);
//       seen.add(b.osm_id);
//     }
//   }

//   // Keep only businesses with at least 2 contact points
//   const uniqueWith2Contacts = unique.filter(b => {
//     let count = 0;
//     if(b.phone) count++;
//     if(b.website) count++;
//     if(b.email) count++;
//     return count >= 2;
//   });

//   return uniqueWith2Contacts;
// }

// module.exports = { scrapeBusinesses, VALID_CATEGORIES };


// osmScraper.js
// const axios = require("axios");

// const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// /**
//  * Very simple geocoder using Nominatim (OSM)
//  * You can replace this with a proper geocoding API later if you want.
//  */
// async function geocodeCity(city) {
//   // const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//   //   city
//   // )}&limit=1`;
//   const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(city)}&limit=1`;
//   const res = await axios.get(url, {
//     headers: {
//       "User-Agent": "college-project-osm-scraper/1.0",
//     },
//   });

//   if (!res.data || res.data.length === 0) {
//     throw new Error("City not found");
//   }

//   const place = res.data[0];
//   return {
//     lat: parseFloat(place.lat),
//     lon: parseFloat(place.lon),
//     display_name: place.display_name,
//   };
// }

// /**
//  * Build Overpass QL query string.
//  * categoryType: 'amenity' or 'shop'
//  * categoryValue: e.g. 'cafe', 'hairdresser', 'restaurant'
//  * radiusMeters: radius in meters around the city center
//  */
// function buildOverpassQuery(lat, lon, categoryType, categoryValue, radiusMeters, max) {
//   // around:RADIUS,LAT,LON
//   // We query both nodes and ways (buildings) with that tag
//   return `
// [out:json][timeout:25];
// (
//   node["${categoryType}"="${categoryValue}"](around:${radiusMeters},${lat},${lon});
//   way["${categoryType}"="${categoryValue}"](around:${radiusMeters},${lat},${lon});
// );
// out body ${max};
// >;
// out skel qt;
// `.trim();
// }

// /**
//  * Format OSM tags into a nice address string.
//  */
// function formatAddress(tags = {}) {
//   const parts = [];
//   if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
//   if (tags["addr:street"]) parts.push(tags["addr:street"]);
//   if (tags["addr:city"]) parts.push(tags["addr:city"]);
//   if (tags["addr:state"]) parts.push(tags["addr:state"]);
//   if (tags["addr:postcode"]) parts.push(tags["addr:postcode"]);
//   if (tags["addr:country"]) parts.push(tags["addr:country"]);
//   return parts.join(", ");
// }

// /**
//  * Main function: scrapeBusinesses
//  * @param {string} cityName - e.g. "New York, USA" or "Tokyo, Japan"
//  * @param {string} categoryType - 'amenity' or 'shop'
//  * @param {string} categoryValue - e.g. 'cafe', 'hairdresser'
//  * @param {number} radiusKm - search radius in km
//  * @param {number} maxResults - max number of elements requested from Overpass (up to several thousands)
//  */
// async function scrapeBusinesses(
//   cityName,
//   categoryType = "amenity",
//   categoryValue = "cafe",
//   radiusKm = 5,
//   maxResults = 1000
// ) {
//   // 1. Geocode city
//  async function geocodeCity(cityName) {
//   const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cityName)}&limit=1`;

//   try {
//     const res = await axios.get(photonUrl);
//     if (res.data.features?.length) {
//       const f = res.data.features[0];
//       return {
//         lat: f.geometry.coordinates[1],
//         lon: f.geometry.coordinates[0],
//         display_name: cityName
//       };
//     }
//   } catch (e) {
//     console.log("Photon failed → Trying fallback...");
//   }

//   // fallback: maps.co (Nominatim clone but less strict)
//   const fallbackUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(cityName)}`;

//   const res2 = await axios.get(fallbackUrl);

//   if (res2.data?.length) {
//     return {
//       lat: parseFloat(res2.data[0].lat),
//       lon: parseFloat(res2.data[0].lon),
//       display_name: res2.data[0].display_name
//     };
//   }

//   throw new Error("City not found in Photon or fallback.");
// }

//   // console.log("Geocoded:", geo.display_name, geo.lat, geo.lon);

//   const radiusMeters = radiusKm * 1000;

//   // 2. Build Overpass query
// function buildOverpassQuery(lat, lon, categoryType, categoryValue, radiusMeters, max) {
//   return `
// [out:json][timeout:30];
// (
//   node["${categoryType}"="${categoryValue}"](around:${radiusMeters},${lat},${lon});
//   way["${categoryType}"="${categoryValue}"](around:${radiusMeters},${lat},${lon});
//   relation["${categoryType}"="${categoryValue}"](around:${radiusMeters},${lat},${lon});
// );
// out center ${max};
// `.trim();
// }

//   console.log("Sending Overpass query...");

//   const res = await axios.post(
//     OVERPASS_URL,
//     query,
//     {
//       headers: {
//         "Content-Type": "text/plain",
//         "User-Agent": "college-project-osm-scraper/1.0",
//       },
//       timeout: 60000,
//     }
//   );

//   const data = res.data;
//   if (!data || !data.elements) {
//     return [];
//   }

//   // 3. Extract relevant info from elements
//   const businesses = [];

//   for (const el of data.elements) {
//     if (!el.tags) continue;

//     const tags = el.tags;
//     const name = tags.name || "";
//     if (!name) continue; // skip elements without a name (often not useful)

//     const address = formatAddress(tags);
//     const phone = tags.phone || tags["contact:phone"] || "";
//     const website =
//       tags.website ||
//       tags["contact:website"] ||
//       tags.url ||
//       "";
//     const email = tags.email || tags["contact:email"] || "";

//     const type = tags.amenity || tags.shop || categoryValue;

//     businesses.push({
//       name,
//       type,
//       address,
//       phone,
//       website,
//       email,
//       osm_id: el.id,
//     });
//   }

//   console.log(`Found ${businesses.length} businesses.`);
//   return businesses;
// }

// module.exports = {
//   scrapeBusinesses,
// };











const axios = require("axios");

// Overpass servers (fallback)
const OVERPASS_SERVERS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter"
];

// Sleep helper
const delay = (ms) => new Promise(r => setTimeout(r, ms));

/* ---------------------------------------------------------
   SAFE GEOCODER (PHOTON + FALLBACK)
--------------------------------------------------------- */
async function geocodeCity(cityName) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cityName)}&limit=1`;

  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "my-hobby-scraper/1.0" }
    });

    if (res.data?.features?.length) {
      const f = res.data.features[0];
      return {
        display_name: cityName,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0]
      };
    }
  } catch (e) {
    console.log("Photon failed → trying fallback…");
  }

  // fallback (geocode.maps.co)
  const url2 = `https://geocode.maps.co/search?q=${encodeURIComponent(cityName)}`;
  const r2 = await axios.get(url2);

  if (r2.data?.length) {
    return {
      display_name: r2.data[0].display_name,
      lat: parseFloat(r2.data[0].lat),
      lon: parseFloat(r2.data[0].lon)
    };
  }

  throw new Error("City not found in any geocoder");
}

/* ---------------------------------------------------------
   OVERPASS QUERY BUILDER
--------------------------------------------------------- */
function buildOverpassQuery(lat, lon, categoryType, categoryValue, radiusMeters, max) {
  return `
    [out:json][timeout:30];
    (
      node["${categoryType}"="${categoryValue}"](around:${radiusMeters}, ${lat}, ${lon});
      way["${categoryType}"="${categoryValue}"](around:${radiusMeters}, ${lat}, ${lon});
      relation["${categoryType}"="${categoryValue}"](around:${radiusMeters}, ${lat}, ${lon});
    );
    out center ${max};
  `.trim();
}

/* ---------------------------------------------------------
   FORMAT ADDRESS
--------------------------------------------------------- */
function formatAddress(tags = {}) {
  const parts = [];
  if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
  if (tags["addr:street"]) parts.push(tags["addr:street"]);
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  if (tags["addr:state"]) parts.push(tags["addr:state"]);
  if (tags["addr:postcode"]) parts.push(tags["addr:postcode"]);
  return parts.join(", ");
}

/* ---------------------------------------------------------
   OVERPASS REQUEST (with fallback)
--------------------------------------------------------- */
async function overpassQuery(query) {
  for (const server of OVERPASS_SERVERS) {
    try {
      const res = await axios.post(server, query, {
        headers: { "Content-Type": "text/plain" },
        timeout: 60000
      });
      return res.data.elements || [];
    } catch (err) {
      console.log(`Overpass failed → ${server}`);
      await delay(1500);
    }
  }
  return [];
}

/* ---------------------------------------------------------
   SCRAPE ONE CATEGORY
--------------------------------------------------------- */
async function scrapeOneCategory(cityName, categoryType, categoryValue, radiusKm, maxResults) {
  const geo = await geocodeCity(cityName);
  const radius = radiusKm * 1000;

  console.log("Geocoded:", geo.display_name);

  const query = buildOverpassQuery(
    geo.lat,
    geo.lon,
    categoryType,
    categoryValue,
    radius,
    maxResults
  );

  console.log("Sending Overpass query…");

  const elements = await overpassQuery(query);

  const results = [];

  for (const el of elements) {
    if (!el.tags) continue;
    const tags = el.tags;
    if (!tags.name) continue;

    results.push({
      name: tags.name,
      type: tags.amenity || tags.shop || categoryValue,
      address: formatAddress(tags),
      phone: tags.phone || tags["contact:phone"] || "",
      website: tags.website || tags["contact:website"] || "",
      email: tags.email || tags["contact:email"] || "",
      lat: el.lat || el.center?.lat,
      lon: el.lon || el.center?.lon,
      osm_id: el.id
    });
  }

  return results;
}

/* ---------------------------------------------------------
   MAIN FUNCTION  — MULTIPLE CATEGORIES
--------------------------------------------------------- */
async function scrapeBusinesses(cityName, categories, radiusKm = 5, maxResults = 1000) {
  const all = [];

  for (const category of categories) {
    const [categoryType, categoryValue] = 
      category === "fast_food" || category === "restaurant" || category === "bar" || category === "pub" || category === "cafe"
      ? ["amenity", category]
      : ["shop", category];

    const data = await scrapeOneCategory(cityName, categoryType, categoryValue, radiusKm, maxResults);
    all.push(...data);

    await delay(1500); // avoid rate limit
  }

  // Deduplicate
  const seen = new Set();
  return all.filter(x => {
    if (seen.has(x.osm_id)) return false;
    seen.add(x.osm_id);
    return true;
  });
}

module.exports = { scrapeBusinesses };
