const STORAGE_KEY = "tokenwiseAnalytics";


/* =========================================================
   DEMO MODEL PRICING
   ---------------------------------------------------------
   Estimated input-token pricing used for the dashboard demo.

   These are DEMO rates so the UI can show cost savings.
   They should be replaced with the actual pricing of the
   connected models when the project is finalized.
   ========================================================= */

const MODEL_RATES = {
  "GPT OSS 120B": 0.50,
  "GPT OSS 20B": 0.30,
  "Qwen 3.8 27B": 0.20,
  "Gemini 3.5 Flash": 0.15,
  "GPT-4o": 2.50,
  "GPT-4o Mini": 0.15,
  "OpenRouter Free": 0,
  "Nemotron 3 Ultra": 0.50,
  "Gemma 4 26B": 0.20,
  default: 0.50,
};


/* =========================================================
   GET MODEL RATE
   ========================================================= */

function getModelRate(model) {

  return (
    MODEL_RATES[model] ||
    MODEL_RATES.default
  );

}


/* =========================================================
   CALCULATE COST
   ========================================================= */

function calculateCost(tokens, model) {

  const rate =
    getModelRate(model);

  return (
    Number(tokens || 0) /
    1000000
  ) * rate;

}


/* =========================================================
   DEMO DATA
   ========================================================= */

const DEMO_ANALYTICS_DATA = {

  totalTokensBefore: 0,

  totalTokensAfter: 0,

  totalTokensSaved: 0,

  totalCostBefore: 0,

  totalCostAfter: 0,

  totalCostSaved: 0,

  totalRequests: 0,

  conversations: 0,


  modelUsage: [],


  dailyUsage: {},


  activities: [],

};


/* =========================================================
   GET DATE KEY
   ========================================================= */

function getDateKey(date = new Date()) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


/* =========================================================
   CREATE DEMO HISTORY
   ========================================================= */

function createDemoData() {

  const data =
    structuredClone(
      DEMO_ANALYTICS_DATA
    );


  /* =======================================================
     DAILY DEMO DATA
     ======================================================= */

  const demoDays = [

    {
      daysAgo: 6,
      before: 4200,
      after: 3020,
    },

    {
      daysAgo: 5,
      before: 5800,
      after: 4010,
    },

    {
      daysAgo: 4,
      before: 7100,
      after: 4820,
    },

    {
      daysAgo: 3,
      before: 6300,
      after: 4280,
    },

    {
      daysAgo: 2,
      before: 8900,
      after: 5910,
    },

    {
      daysAgo: 1,
      before: 7600,
      after: 5140,
    },

    {
      daysAgo: 0,
      before: 9200,
      after: 6180,
    },

  ];


  demoDays.forEach((item) => {

    const date =
      new Date();

    date.setDate(
      date.getDate() -
      item.daysAgo
    );


    const dateKey =
      getDateKey(date);


    const saved =
      item.before -
      item.after;


    data.dailyUsage[dateKey] = {

      before:
        item.before,

      after:
        item.after,

      saved,

    };


    data.totalTokensBefore +=
      item.before;

    data.totalTokensAfter +=
      item.after;

    data.totalTokensSaved +=
      saved;

  });


  /* =======================================================
     DEMO REQUESTS
     ======================================================= */

  data.totalRequests = 45;

  data.conversations = 45;


  /* =======================================================
     DEMO MODEL USAGE
     ======================================================= */

  data.modelUsage = [

    {
      model: "GPT OSS 120B",
      requests: 18,
      tokensBefore: 17600,
      tokensAfter: 12400,
      tokensSaved: 5200,
    },

    {
      model: "GPT OSS 20B",
      requests: 11,
      tokensBefore: 10100,
      tokensAfter: 6840,
      tokensSaved: 3260,
    },

    {
      model: "Qwen 3.8 27B",
      requests: 9,
      tokensBefore: 7900,
      tokensAfter: 5210,
      tokensSaved: 2690,
    },

    {
      model: "Gemini 3.5 Flash",
      requests: 7,
      tokensBefore: 5800,
      tokensAfter: 3980,
      tokensSaved: 1820,
    },

  ];


  /* =======================================================
     CALCULATE MODEL COSTS
     ======================================================= */

  data.modelUsage =
    data.modelUsage.map(
      (item) => {

        const costBefore =
          calculateCost(
            item.tokensBefore,
            item.model
          );


        const costAfter =
          calculateCost(
            item.tokensAfter,
            item.model
          );


        return {

          ...item,

          tokens:
            item.tokensAfter,

          costBefore,

          costAfter,

          costSaved:
            costBefore -
            costAfter,

        };

      }
    );


  /* =======================================================
     TOTAL COSTS
     ======================================================= */

  data.totalCostBefore =
    data.modelUsage.reduce(
      (sum, item) =>
        sum +
        item.costBefore,
      0
    );


  data.totalCostAfter =
    data.modelUsage.reduce(
      (sum, item) =>
        sum +
        item.costAfter,
      0
    );


  data.totalCostSaved =
    data.totalCostBefore -
    data.totalCostAfter;


  /* =======================================================
     DEMO ACTIVITY
     ======================================================= */

  data.activities = [

    {
      model: "GPT OSS 120B",
      provider: "Groq",
      operation: "Context compression",
      before: 2840,
      after: 1910,
      saved: 930,
      timestamp:
        new Date(
          Date.now() -
          5 * 60000
        ).toISOString(),
    },

    {
      model: "Qwen 3.8 27B",
      provider: "Groq",
      operation: "Context compression",
      before: 3210,
      after: 2180,
      saved: 1030,
      timestamp:
        new Date(
          Date.now() -
          20 * 60000
        ).toISOString(),
    },

    {
      model: "GPT OSS 20B",
      provider: "Groq",
      operation: "Conversation optimization",
      before: 2460,
      after: 1690,
      saved: 770,
      timestamp:
        new Date(
          Date.now() -
          60 * 60000
        ).toISOString(),
    },

    {
      model: "Gemini 3.5 Flash",
      provider: "Google Gemini",
      operation: "Context compression",
      before: 1980,
      after: 1360,
      saved: 620,
      timestamp:
        new Date(
          Date.now() -
          2 * 60 * 60000
        ).toISOString(),
    },

  ];


  return data;

}


/* =========================================================
   GET ANALYTICS DATA
   ========================================================= */

export function getAnalyticsData() {

  const stored =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (!stored) {

    const demoData =
      createDemoData();


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        demoData
      )
    );


    return demoData;

  }


  try {

    const parsed =
      JSON.parse(stored);


    /*
     * Migration / safety defaults
     */

    return {

      ...DEMO_ANALYTICS_DATA,

      ...parsed,

      modelUsage:
        parsed.modelUsage || [],

      dailyUsage:
        parsed.dailyUsage || {},

      activities:
        parsed.activities || [],

    };

  } catch {

    const demoData =
      createDemoData();


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        demoData
      )
    );


    return demoData;

  }

}


/* =========================================================
   RECORD ANALYTICS
   ========================================================= */

export function recordAnalytics({

  model,

  provider,

  tokensBefore = 0,

  tokensAfter = 0,

  tokensSaved = 0,

  operation =
    "Context compression",

}) {

  const data =
    getAnalyticsData();


  const modelName =
    model ||
    "Unknown Model";


  const before =
    Number(tokensBefore) || 0;


  const after =
    Number(tokensAfter) || 0;


  const saved =
    Number(tokensSaved) || 0;


  /* =======================================================
     COST
     ======================================================= */

  const costBefore =
    calculateCost(
      before,
      modelName
    );


  const costAfter =
    calculateCost(
      after,
      modelName
    );


  const costSaved =
    costBefore -
    costAfter;


  /* =======================================================
     TOTALS
     ======================================================= */

  data.totalTokensBefore +=
    before;


  data.totalTokensAfter +=
    after;


  data.totalTokensSaved +=
    saved;


  data.totalCostBefore +=
    costBefore;


  data.totalCostAfter +=
    costAfter;


  data.totalCostSaved +=
    costSaved;


  data.totalRequests += 1;


  data.conversations += 1;


  /* =======================================================
     MODEL
     ======================================================= */

  if (!Array.isArray(
    data.modelUsage
  )) {

    data.modelUsage = [];

  }


  let modelEntry =
    data.modelUsage.find(
      (item) =>
        item.model ===
        modelName
    );


  if (!modelEntry) {

    modelEntry = {

      model:
        modelName,

      requests: 0,

      tokensBefore: 0,

      tokensAfter: 0,

      tokensSaved: 0,

      tokens: 0,

      costBefore: 0,

      costAfter: 0,

      costSaved: 0,

    };


    data.modelUsage.push(
      modelEntry
    );

  }


  modelEntry.requests += 1;


  modelEntry.tokensBefore +=
    before;


  modelEntry.tokensAfter +=
    after;


  modelEntry.tokensSaved +=
    saved;


  modelEntry.tokens =
    modelEntry.tokensAfter;


  modelEntry.costBefore +=
    costBefore;


  modelEntry.costAfter +=
    costAfter;


  modelEntry.costSaved +=
    costSaved;


  /* =======================================================
     DAILY DATA
     ======================================================= */

  const today =
    getDateKey();


  if (!data.dailyUsage[today]) {

    data.dailyUsage[today] = {

      before: 0,

      after: 0,

      saved: 0,

    };

  }


  data.dailyUsage[today].before +=
    before;


  data.dailyUsage[today].after +=
    after;


  data.dailyUsage[today].saved +=
    saved;


  /* =======================================================
     RECENT ACTIVITY
     ======================================================= */

  if (!Array.isArray(
    data.activities
  )) {

    data.activities = [];

  }


  data.activities.unshift({

    model:
      modelName,

    provider,

    operation,

    before,

    after,

    saved,

    costSaved,

    timestamp:
      new Date().toISOString(),

  });


  data.activities =
    data.activities.slice(
      0,
      20
    );


  /* =======================================================
     SAVE
     ======================================================= */

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(
      data
    )

  );

}


/* =========================================================
   RESET DEMO DATA
   ========================================================= */

export function resetAnalyticsData() {

  const demoData =
    createDemoData();


  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(
      demoData
    )

  );


  return demoData;

}