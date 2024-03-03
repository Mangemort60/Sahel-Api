const { getRateDetails } = require('../../services/quoteService')

const calculateQuote = async (req, res) => {
    const { sizeRange, numberOfFloors } = req.body;
  
    try {
      const rateDetails = await getRateDetails(sizeRange);
  
      if (!rateDetails) {
        return res.status(404).json({ message: 'Size range not found' });
      }
  
      // Calculer le prix total en fonction du nombre d'étages
      const totalPrice = rateDetails.salePricePerFloor +
                         ((rateDetails.marginEuro + rateDetails.variableCost) * numberOfFloors );
  
      return res.json({ totalPrice });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  module.exports = {
    calculateQuote
  };