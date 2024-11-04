const formatSizeRange = (sizeRange) => {
  switch (sizeRange) {
    case "lessThan40":
      return "Moins de 40m²";
    case "from40to80":
      return "Entre 40m² et 80m²";
    case "from80to120":
      return "Entre 80m² et 120m²";
    case "moreThan120":
      return "Plus de 120m²";
    default:
      return sizeRange;
  }
};

module.exports = { formatSizeRange };
