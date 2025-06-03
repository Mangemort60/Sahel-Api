const {
  getCleaningRateDetails,
  getCookingRateDetails,
} = require("../../services/quoteService");

const calculateCleaningQuote = async (req, res) => {
  const { sizeRange, numberOfFloors, fruitBasketSelected } = req.body;

  // Traduction des valeurs front → backend
  const sizeRangeMap = {
    lessThan40: "moins_de_40m2",
    from40to80: "entre_40_et_80m2",
    from80to120: "entre_80_et_120m2",
    moreThan120: "superieur_120m2",
  };

  const translatedSizeRange = sizeRangeMap[sizeRange];

  const cleaningRateDetails = {
    moins_de_40m2: {
      logisticCost: 15,
      variableCost: 11,
      productionCost: 25,
      margin: 0.5,
      taxRate: 0.3,
      fruitBasketPrice: 10,
    },
    entre_40_et_80m2: {
      logisticCost: 15,
      variableCost: 14,
      productionCost: 29,
      margin: 0.5,
      taxRate: 0.3,
      fruitBasketPrice: 10,
    },
    entre_80_et_120m2: {
      logisticCost: 15,
      variableCost: 18,
      productionCost: 32,
      margin: 0.7,
      taxRate: 0.3,
      fruitBasketPrice: 10,
    },
    superieur_120m2: {
      logisticCost: 15,
      variableCost: 32,
      productionCost: 48,
      margin: 0.7,
      taxRate: 0.3,
      fruitBasketPrice: 10,
    },
  };

  try {
    const rateDetails = cleaningRateDetails[translatedSizeRange];

    if (!rateDetails) {
      return res.status(404).json({ message: "Size range not found" });
    }

    const {
      variableCost,
      logisticCost,
      productionCost,
      margin,
      taxRate,
      fruitBasketPrice,
    } = rateDetails;

    const marginEuro = productionCost * margin;
    const totalPriceHT = Math.ceil(
      numberOfFloors * variableCost + logisticCost + marginEuro
    );
    const taxesAndVAT = totalPriceHT * taxRate;

    let totalPrice = totalPriceHT + taxesAndVAT;
    if (fruitBasketSelected) {
      totalPrice += fruitBasketPrice;
    }

    totalPrice = Math.round(totalPrice * 100) / 100;

    return res.json({ totalPrice });
  } catch (error) {
    console.error("Error calculating quote:", error);
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
          "9_plus": 29,
        },
      },
      soirMidi: {
        logisticCost: 5,
        margin: 50,
        taxes: 30,
        costVariable: {
          "1_8": 11,
          "9_plus": 12,
        },
      },
    };

    // Vérification si la période existe
    const periodDetails = rateDetails[period];
    if (!periodDetails) {
      return res.status(404).json({ message: "Période non trouvée" });
    }

    const { logisticCost, margin, taxes, costVariable } = periodDetails;

    // Vérification si c'est 9+ personnes
    const isNumberOfPeopleNinePlus =
      numberOfPeople === "9_plus" &&
      exactNumberOfPeople &&
      !isNaN(parseInt(exactNumberOfPeople, 10));

    // Calcul du coût variable de base (1 à 8 personnes)
    let costVariableFinal = isNumberOfPeopleNinePlus
      ? costVariable["9_plus"]
      : costVariable["1_8"];

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
    const totalPriceTTC = totalPriceHT + totalPriceHT * (taxes / 100);

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
      numberOfPeople,
    });

    // Retourner le prix total calculé
    return res.json({ totalPrice: roundedTotalPriceTTC });
  } catch (error) {
    console.error("Error calculating quote:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  calculateCleaningQuote,
  calculateCookingQuote,
};
