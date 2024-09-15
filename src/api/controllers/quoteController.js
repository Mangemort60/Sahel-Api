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
    const { period, numberOfPeople, exactNumberOfPeople } = req.body;

    try {
        // Stockage des données directement dans le contrôleur
        const rateDetails = {
            journee: {
                logisticCost: 5,
                margin: 50,
                taxes: 30,
                costVariable: {
                    "1_8": 28,
                    "9_plus": 29
                }
            },
            soirMidi: {
                logisticCost: 5,
                margin: 50,
                taxes: 30,
                costVariable: {
                    "1_8": 11,
                    "9_plus": 12
                }
            }
        };

        // Vérification si la période existe
        const periodDetails = rateDetails[period];
        if (!periodDetails) {
            return res.status(404).json({ message: 'Période non trouvée' });
        }

        const { logisticCost, margin, taxes, costVariable } = periodDetails;

        // Vérification si c'est 9+ personnes
        const isNumberOfPeopleNinePlus = numberOfPeople === '9_plus' && exactNumberOfPeople && !isNaN(parseInt(exactNumberOfPeople, 10));

        // Calcul du coût variable de base (1 à 8 personnes)
        let costVariableFinal = isNumberOfPeopleNinePlus ? costVariable['9_plus'] : costVariable['1_8'];

        // Si 9+ personnes, calculer le coût supplémentaire
        if (isNumberOfPeopleNinePlus) {
            const personnesSupplementaires = parseInt(exactNumberOfPeople, 10) - 8;
            if (personnesSupplementaires > 0) {
                // Ajout de 1,2€ par personne supplémentaire
                const coutSuppPersonne = personnesSupplementaires * 1.2;
                costVariableFinal += coutSuppPersonne; // Ajout du coût supplémentaire
            }
        } else if (numberOfPeople > 8) {
            // Si nous sommes dans le cas de plus de 8 personnes mais sans exactNumberOfPeople, on suppose exactNumberOfPeople = numberOfPeople
            const personnesSupplementaires = parseInt(numberOfPeople, 10) - 8;
            if (personnesSupplementaires > 0) {
                const coutSuppPersonne = personnesSupplementaires * 1.2;
                costVariableFinal += coutSuppPersonne;
            }
        }

        // Calcul du coût de production (logistique + coût variable ajusté)
        const coutDeProduction = logisticCost + costVariableFinal;

        // Calcul de la marge en euro (marge en pourcentage appliquée au coût de production)
        const margeEnEuro = coutDeProduction * (margin / 100);

        // Calcul du prix HT (coût de production + marge en euro)
        const totalPriceHT = margeEnEuro + coutDeProduction;

        // Calcul du prix TTC (ajout des taxes)
        const totalPriceTTC = totalPriceHT + (totalPriceHT * (taxes / 100));

        // Arrondir à deux décimales
        const roundedTotalPriceTTC = Math.round(totalPriceTTC * 100) / 100;

        // Debug : Afficher les valeurs calculées pour vérifier
        console.log({
            logisticCost,
            costVariableFinal,
            coutDeProduction,
            margeEnEuro,
            totalPriceHT,
            totalPriceTTC,
            roundedTotalPriceTTC,
            exactNumberOfPeople,
            numberOfPeople
        });

        // Retourner le prix total calculé
        return res.json({ totalPrice: roundedTotalPriceTTC });
    } catch (error) {
        console.error('Error calculating quote:', error);
        return res.status(500).json({ message: error.message });
    }
};





module.exports = {
    calculateCleaningQuote,
    calculateCookingQuote
};
