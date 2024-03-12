require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongodb_url = process.env.URL;
//"mongodb+srv://prabingiri922:prabingiri922@freecodecamp.dukuurl.mongodb.net/?retryWrites=true&w=majority&appName=freeCodeCamp";
const { MongoClient } = require("mongodb");
const urlparser = require("url");
const dns = require("dns");
// Basic Configuration
const port = process.env.PORT || 3000;

const client = new MongoClient(mongodb_url);
const db = client.db("url_shortener");
const urls = db.collection("urls");

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  console.log(req.body);
  const url = req.body.url;
  const dnslookup = dns.lookup(
    urlparser.parse(url).hostname,
    async (err, address) => {
      if (!address) {
        res.json({ error: "Invalid url" });
      } else {
        const urlCount = await urls.countDocuments({});
        const urlDoc = {
          url,
          short_url: urlCount,
        };
        const results = await urls.insertOne(urlDoc);
        console.log(results);
        res.json({
          original_url: url,
          short_url: urlCount,
        });
      }
    },
  );
});

app.get("/api/shorturl/:urlNum", async (req, res) => {
  const urlNum = req.params.urlNum;
  const urlDoc = await urls.findOne({ short_url: +urlNum });
  res.redirect(urlDoc.url);
});

// app.post("/api/shorturl", function (req, res) {
//   console.log(req.body);
//   const url = req.body.url;

//   // Create a promise wrapper for dns.lookup
//   const dnsLookupPromise = new Promise((resolve, reject) => {
//     dns.lookup(urlparser.parse(url).hostname, (err, address) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(address);
//       }
//     });
//   });

//   // Use async/await to handle the promise
//   (async () => {
//     try {
//       const address = await dnsLookupPromise;
//       if (!address) {
//         res.json({ error: "Invalid url" });
//       } else {
//         const urlCount = await urls.countDocuments({});
//         const urlDoc = {
//           url,
//           short_url: urlCount,
//         };
//         const results = await urls.insertOne(urlDoc);
//         console.log(results);
//         res.json({
//           original_url: url,
//           short_url: urlCount,
//         });
//       }
//     } catch (error) {
//       console.error("DNS lookup error:", error);
//       res.json({ error: "Error during DNS lookup" });
//     }
//   })();
// });

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
