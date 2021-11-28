const express = require("express");

const app = express();

const cors = require("cors");
const { fetchAssets, fetchClaimAssets, fetchUnclaims } = require("./fetcher");

// use cors
app.use(cors());

app.get("/", async (req, res) => {
  const { collection, account, pack_templates } = req.query;

  if (collection === "" || account === "" || !pack_templates) {
    res.status(200).json([]);
    return;
  }

  const r = await fetchAssets(collection, account, pack_templates);

  res.status(200).json(r);
});

app.get("/claimassets", async (req, res) => {
  const { scope } = req.query;

  if (scope === "") {
    res.status(200).json([]);
    return;
  }

  const r = await fetchClaimAssets(scope);

  return res.status(200).json(r.rows);
});

app.get("/unclaims", async (req, res) => {
  const { collection, account } = req.query;

  if (collection === "" || account === "") {
    res.status(200).json([]);
    return;
  }

  const r = await fetchUnclaims(collection, account);

  return res.status(200).json(r);
});

// run this only in dev environment
if (process.env.NODE_ENV === "development") {
  app.listen(8000, () => {
    console.log("Listening on http://localhost:8000");
  });
}

// export 'app'
module.exports = app;
