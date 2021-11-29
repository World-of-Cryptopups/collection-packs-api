const fetch = require("cross-fetch");

// filter assets
const filterAssets = async (data) => {
  const confirmedPacks = [];

  const final = [];

  for (const r of data) {
    if (!r.template) return;

    const template = r.template.template_id;

    // if pack is already confirmed, ok already
    if (confirmedPacks.includes(template)) {
      final.push(r);
      continue;
    }

    const confirm = await confirmIfPack(template);
    if (confirm) {
      confirmedPacks.push(template);

      final.push(r);
    }
  }

  return final;
};

const assetFetcher = async (collection, account = null, ids = null) => {
  const url = `${
    process.env.ATOMICASSETS_ENDPOINT
  }/atomicassets/v1/assets?limit=1000&order=desc${
    account ? `&owner=${account}` : ""
  }&sort=transferred&collection_name=${collection}${ids ? `&ids=${ids}` : ""}`;

  const r = await fetch(url);

  return await r.json();
};

// fetch assets
const fetchAssets = async (collection, account, schema_pack) => {
  const d = await assetFetcher(collection, account);

  if (!d.success) {
    return [];
  }

  //   const confirmedPacks = [];
  //   const ignoredPacks = [];
  const final = [];

  for (let i = d.data.length; i--; ) {
    const r = d.data[i];

    if (!r.template) continue;

    if (schema_pack.includes(r.schema.schema_name)) {
      final.push(r);
    }

    // if (ignoredPacks.includes(template)) continue;

    // // if pack is already confirmed, ok already
    // if (confirmedPacks.includes(template)) {
    //   final.push(r);
    //   continue;
    // }

    // const confirm = await confirmIfPack(template);
    // if (confirm) {
    //   confirmedPacks.push(template);

    //   console.log(template);

    //   final.push(r);
    //   continue;
    // }

    // ignoredPacks.push(template);
  }

  return final;
};

const fetchClaimAssets = async (scope) => {
  const r = await fetch(`${process.env.WAX_ENDPOINT}/v1/chain/get_table_rows`, {
    method: "POST",
    body: JSON.stringify({
      code: "atomicpacksx",
      scope: scope,
      table: "unboxassets",
      index_position: 1,
      limit: 1000,
      json: true,
    }),
  });

  return await r.json();
};

// check if template is a pack
const confirmIfPack = async (templateid) => {
  const r = await fetch(`${process.env.WAX_ENDPOINT}/v1/chain/get_table_rows`, {
    method: "POST",
    body: JSON.stringify({
      code: "atomicpacksx",
      scope: "atomicpacksx",
      table: "packs",
      index_position: 2,
      limit: 1,
      key_type: "i64",
      lower_bound: templateid,
      upper_bound: templateid,
      json: true,
    }),
  });

  const d = await r.json();

  // template is a pack
  if (d.rows.length > 0) {
    return true;
  }

  return false;
};

const fetchUnclaims = async (collection, account) => {
  const r = await fetch(`${process.env.WAX_ENDPOINT}/v1/chain/get_table_rows`, {
    method: "POST",
    body: JSON.stringify({
      json: true,
      code: "atomicpacksx",
      scope: "atomicpacksx",
      table: "unboxpacks",
      table_key: "unboxer",
      lower_bound: account,
      upper_bound: account,
      index_position: 2,
      key_type: "name",
      limit: 1000,
      reverse: false,
      show_payer: false,
    }),
  });

  const x = await r.json();

  // check length
  if (x.rows.length === 0) {
    return [];
  }

  const assetids = x.rows.map((r) => r.pack_asset_id);
  const d = await assetFetcher(collection, null, assetids.join(","));

  return d.data;
};

module.exports = {
  fetchAssets,
  fetchClaimAssets,
  fetchUnclaims,
  confirmIfPack,
};
