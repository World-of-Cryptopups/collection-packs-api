const fetch = require("cross-fetch");

// filter assets
const filterAssets = async (data) => {
  const confirmedPacks = [];

  const final = [];

  for (const r of data) {
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

// fetch assets
const fetchAssets = async (collection, account, pack_templates) => {
  const r = await fetch(
    `${process.env.ATOMICASSETS_ENDPOINT}/atomicassets/v1/assets?collection_blacklist=bridgebridge,testkogs2222,testkogs3333,testkogstest,mutantwarrio,mutantstest2,33testuplift,44testuplift,series2heros,horrorhorror,horrorstest2,horrorstest3,horrorstest4,horrorstest5,horrorstestx,btcotest2222,btcotest3333,btcotest1234,shynies5test,shynies4test,shyniestest2,shyniestest1,btco22222222,artvndngtst1,elementals11,mteora111111&limit=1000&order=desc&owner=${account}&sort=transferred&page=1&collection_name=${collection}`
  );

  const d = await r.json();

  if (!d.success) {
    return [];
  }

  //   const confirmedPacks = [];
  //   const ignoredPacks = [];
  const final = [];

  for (let i = d.data.length; i--; ) {
    // console.log(confirmedPacks, ignoredPacks, i);

    const r = d.data[i];
    if (pack_templates.includes(r.template.template_id)) {
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
    //   console.log(template);
    //   confirmedPacks.push(template);

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

module.exports = { fetchAssets, fetchClaimAssets, confirmIfPack };
