const { getCleaningRateDetails, getCookingRateDetails } = require('../../services/quoteService');

const calculateCleaningQuote = async (req, res) => {
    const { sizeRange, numberOfFloors, fruitBasketSelected } = req.body;

    try {
        const rateDetails = await getCleaningRateDetails(sizeRange);
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


const calculateCookingQuote = async (req, res) => {
    const { period, numberOfPeople } = req.body;

    try {
        // Récupère les détails tarifaires en fonction de la période et du nombre de personnes
        const rateDetails = await getCookingRateDetails(period, numberOfPeople);

        if (!rateDetails) {
            return res.status(404).json({ message: 'Rate details not found' });
        }

        const { coutLogistique, coutProduction, coutVariable, marge, taxes } = rateDetails;

        if ([coutLogistique, coutProduction, coutVariable, marge, taxes].some(value => value == null || isNaN(Number(value)))) {
            throw new Error('Invalid pricing configuration');
        }

        // Calcul du prix HT
        const marginEuro = Number(coutProduction) * (Number(marge) / 100);
        const totalPriceHT = Math.ceil(Number(coutVariable) + Number(coutLogistique) + marginEuro);

        // Calcul du prix TTC
        const taxesAndVAT = totalPriceHT * (Number(taxes) / 100);
        let totalPrice = totalPriceHT + taxesAndVAT;

        // Arrondir à deux décimales
        totalPrice = Math.round(totalPrice * 100) / 100;

        return res.json({ totalPrice });
    } catch (error) {
        console.error('Error calculating quote:', error);
        return res.status(500).json({ message: error.message });
    }
};



module.exports = {
    calculateCleaningQuote,
    calculateCookingQuote
};
