const { getRateDetails } = require('../../services/quoteService')

const calculateQuote = async (req, res) => {
    const { sizeRange, numberOfFloors, fruitBasketSelected } = req.body;
  
    try {
      const rateDetails = await getRateDetails(sizeRange);
  
      if (!rateDetails) {
        return res.status(404).json({ message: 'Size range not found' });
      }
  
      // Calculer le prix total en fonction du nombre d'étages

      let marginEuro = rateDetails.productionCost * rateDetails.margin 
      
      let totalPriceHT = Math.ceil((numberOfFloors * rateDetails.variableCost) + rateDetails.logisticCost + marginEuro);
      
      let taxesAndVAT = totalPriceHT* rateDetails.taxRate

      let totalPrice = (totalPriceHT + taxesAndVAT).toFixed(2)

      if (fruitBasketSelected) {
      totalPrice += rateDetails.fruitBasketPrice; // Ajoute 15 € au prix total
      }
  
      return res.json({ totalPrice });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  module.exports = {
    calculateQuote
  };