const { db } = require('../config/firebaseConfig');

// Service pour récupérer les détails de tarification
const getRateDetails = async (sizeRange) => {
  const pricingRef = db.collection('pricing').doc('vQCOq4rHaUS20VGpFvnS');
  const doc = await pricingRef.get();

  if (!doc.exists) {
    throw new Error('No pricing data found');
  }

  const pricingData = doc.data();
  return pricingData[sizeRange];
};

module.exports = {
  getRateDetails
};