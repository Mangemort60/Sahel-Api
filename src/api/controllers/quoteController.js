const { getRateDetails } = require('../../services/quoteService');

const calculateQuote = async (req, res) => {
    const { sizeRange, numberOfFloors, fruitBasketSelected } = req.body;

    try {
        const rateDetails = await getRateDetails(sizeRange);
        console.log('Rate Details:', rateDetails);

        if (!rateDetails) {
            console.error('Size range not found');
            return res.status(404).json({ message: 'Size range not found' });
        }

        const { variableCost, logisticCost, productionCost, margin, taxRate, fruitBasketPrice } = rateDetails;

        if ([variableCost, logisticCost, productionCost, margin, taxRate].some(value => value == null || isNaN(Number(value)))) {
            throw new Error('Invalid rate details');
        }

        const marginEuro = Number(productionCost) * Number(margin);
        console.log('Margin Euro:', marginEuro);

        const totalPriceHT = Math.ceil((numberOfFloors * Number(variableCost)) + Number(logisticCost) + marginEuro);
        console.log('Total Price HT:', totalPriceHT);

        const taxesAndVAT = totalPriceHT * Number(taxRate);
        console.log('Taxes and VAT:', taxesAndVAT);

        let totalPrice = totalPriceHT + taxesAndVAT;
        console.log('Total Price before Fruit Basket:', totalPrice);

        if (fruitBasketSelected) {
            totalPrice += Number(fruitBasketPrice);
            console.log('Total Price after adding Fruit Basket:', totalPrice);
        }

        totalPrice = Math.round(totalPrice * 100) / 100;
        console.log('Total Price Final:', totalPrice);

        return res.json({ totalPrice });
    } catch (error) {
        console.error('Error calculating quote:', error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    calculateQuote
};
