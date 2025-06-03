const { db } = require("../config/firebaseConfig");

// Service pour récupérer les détails de tarification du ménage
const getCleaningRateDetails = async (sizeRange) => {
  const pricingRef = db.collection("pricing").doc("vQCOq4rHaUS20VGpFvnS");
  const doc = await pricingRef.get();

  if (!doc.exists) {
    throw new Error("No pricing data found");
  }

  const pricingData = doc.data();
  return pricingData[sizeRange];
};

// Service pour récupérer les détails de tarification de la cuisine
const getCookingRateDetails = async (periode, nombreDePersonnes) => {
  // Construire la clé du champ basé sur la période et le nombre de personnes
  const fieldKey = `${periode}_${nombreDePersonnes}`; // Par exemple: "journee_1_8"

  // Récupérer le document CookingServiceRates
  const pricingRef = db.collection("pricing").doc("CookingServiceRates");
  const doc = await pricingRef.get();

  if (!doc.exists) {
    throw new Error("No pricing data found");
  }

  const pricingData = doc.data();

  // Extraire le champ spécifique
  const rateDetails = pricingData[fieldKey];

  if (!rateDetails) {
    throw new Error(`No pricing data found for key: ${fieldKey}`);
  }

  return rateDetails;
};

module.exports = {
  getCleaningRateDetails,
  getCookingRateDetails,
};
