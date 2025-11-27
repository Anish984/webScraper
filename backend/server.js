const express = require("express");
const path = require("path");
const { Parser } = require("json2csv");
const { scrapeBusinesses, VALID_CATEGORIES } = require("./scraper");

const app = express();
const PORT = 3000;

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/businesses", async (req, res)=>{
  const city = req.query.city;
  const categories = (req.query.categories || "").split(",").filter(x=>x);
  const radiusKm = parseFloat(req.query.radiusKm) || 5;
  const maxResults = parseInt(req.query.maxResults) || 1000;
  const format = req.query.format || "json";

  if(!city) return res.status(400).json({error:"Missing city"});
  if(!categories.length) return res.status(400).json({error:"Select at least one category"});

  try{
    const data = await scrapeBusinesses(city, categories, radiusKm, maxResults);
    if(format==="csv"){
      const csv = new Parser().parse(data);
      res.header("Content-Type","text/csv");
      res.header("Content-Disposition",`attachment; filename="businesses_${Date.now()}.csv"`);
      return res.send(csv);
    } else {
      return res.json({count: data.length, results: data});
    }
  }catch(err){
    console.error(err);
    return res.status(500).json({error: err.message});
  }
});

app.listen(PORT, ()=>console.log(`Server running at http://localhost:${PORT}`));



// // server.js
// const express = require("express");
// const path = require("path");
// const { Parser } = require("json2csv");
// const { scrapeBusinesses } = require("./scraper");

// const app = express();
// const PORT = 3000;

// // Serve static frontend
// app.use(express.static(path.join(__dirname, "public")));

// app.get("/api/businesses", async (req, res) => {
//   const city = req.query.city || "";
//   const categoryType = req.query.categoryType || "amenity"; // amenity or shop
//   const categoryValue = req.query.categoryValue || "cafe"; // e.g. cafe, restaurant, hairdresser
//   const radiusKm = parseFloat(req.query.radiusKm || "5");
//   const maxResults = parseInt(req.query.maxResults || "1000", 10);
//   const format = req.query.format || "json"; // json or csv

//   if (!city) {
//     return res.status(400).json({ error: "Missing 'city' parameter" });
//   }

//   try {
//     console.log(
//       `Scraping businesses: city=${city}, ${categoryType}=${categoryValue}, radius=${radiusKm}km, max=${maxResults}`
//     );
//     const businesses = await scrapeBusinesses(
//       city,
//       categoryType,
//       categoryValue,
//       radiusKm,
//       maxResults
//     );

//     if (format === "csv") {
//       const parser = new Parser();
//       const csv = parser.parse(businesses);
//       res.header("Content-Type", "text/csv");
//       res.header(
//         "Content-Disposition",
//         `attachment; filename="businesses_${Date.now()}.csv"`
//       );
//       return res.send(csv);
//     } else {
//       return res.json({
//         count: businesses.length,
//         results: businesses,
//       });
//     }
//   } catch (err) {
//     console.error("Error in /api/businesses:", err.message);
//     return res.status(500).json({ error: "Scraping failed", details: err.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });
