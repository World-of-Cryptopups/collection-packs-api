const express = require("express");

const app = express();

const cors = require("cors");
const { fetchAssets, fetchClaimAssets } = require("./fetcher");

// use cors
app.use(cors());

app.get("/", async (req, res) => {
  const { collection, account } = req.query;

  if (collection === "" || account === "") {
    res.status(200).json([]);
  }

  const r = await fetchAssets(collection, account);

  console.log(r.length);

  res.status(200).json(r);
});

app.get("/claimassets", async (req, res) => {
  const { scope } = req.query;

  if (scope === "") {
    res.status(200).json([]);
  }

  const r = await fetchClaimAssets(scope);

  return res.status(200).json(r.rows);
});

// run this only in dev environment
if (process.env.NODE_ENV === "development") {
  app.listen(8000, () => {
    console.log("Listening on http://localhost:8000");
  });
}

// export 'app'
module.exports = app;
