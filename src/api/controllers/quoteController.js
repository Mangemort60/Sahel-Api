const { getRateDetails } = require('../../services/quoteService')

const calculateQuote = async (req, res) => {
    const { sizeRange, numberOfFloors, fruitBasketSelected } = req.body;
  
    try {
      const rateDetails = await getRateDetails(sizeRange);
  
      if (!rateDetails) {
        return res.status(404).json({ message: 'Size range not found' });
      }
  
      // Calculer le prix total en fonction du nombre d'étages

      let totalPrice = Math.ceil((numberOfFloors * rateDetails.variableCost) + rateDetails.logisticCost + rateDetails.marginEuro * 1.20);


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