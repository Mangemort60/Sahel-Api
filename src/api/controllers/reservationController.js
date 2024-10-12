const { db } = require("../../config/firebaseConfig"); // Assurez-vous que ce chemin correspond à votre configuration Firebase
const reservationSchema = require("../../models/reservationModel");
const daysjs = require("dayjs");

const getReservedDates = async (req, res) => {
  try {
    const reservationsSnapshot = await db.collection("reservations").get();

    if (reservationsSnapshot.empty) {
      // Renvoie un tableau vide si aucune réservation n'est trouvée
      return res.status(200).json({ cleaning: [], cooking: [] });
    }

    // Initialiser des objets pour stocker les dates réservées pour chaque type de réservation
    const cleaningReservationCounts = {};
    const cookingReservationCounts = {};

    reservationsSnapshot.forEach((doc) => {
      const { serviceDate, reservationType } = doc.data(); // Récupérer le type de réservation

      if (reservationType === "ménage") {
        // Si la réservation est de type ménage, compter les dates réservées
        if (cleaningReservationCounts[serviceDate]) {
          cleaningReservationCounts[serviceDate] += 1;
        } else {
          cleaningReservationCounts[serviceDate] = 1;
        }
      } else if (reservationType === "cuisine") {
        // Si la réservation est de type cuisine, compter les dates réservées
        if (cookingReservationCounts[serviceDate]) {
          cookingReservationCounts[serviceDate] += 1;
        } else {
          cookingReservationCounts[serviceDate] = 1;
        }
      }
    });

    // Convertir les objets en tableaux pour renvoyer les résultats
    const cleaningReservations = Object.entries(cleaningReservationCounts).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    const cookingReservations = Object.entries(cookingReservationCounts).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    // Renvoyer les dates réservées séparées pour le ménage et la cuisine
    res.status(200).json({
      cleaning: cleaningReservations,
      cooking: cookingReservations,
    });
  } catch (error) {
    console.error("Error fetching reservation counts: ", error);
    res.status(500).json({ message: "Failed to fetch reservation counts" });
  }
};

const getReservationsByUser = async (req, res) => {
  try {
    const shortID = req.query.shortID;
    const reservationType = req.query.reservationType || ""; // Optionnel, par défaut vide
    console.log("shortID:", shortID);

    if (!shortID) {
      return res.status(400).json({ error: "ID utilisateur non disponible." });
    }

    const reservations = [];
    let queryRef = db
      .collection("reservations")
      .where("shortId", "==", shortID);

    // Si un type de réservation est fourni, appliquer le filtre
    if (reservationType) {
      queryRef = queryRef.where("reservationType", "==", reservationType);
    }

    const snapshot = await queryRef.get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "Aucune réservation trouvée pour cet utilisateur." });
    }

    for (const doc of snapshot.docs) {
      let reservation = { id: doc.id, ...doc.data() };

      // Récupérer la sous-collection 'devis' pour chaque réservation
      const devisCollectionRef = db
        .collection("reservations")
        .doc(doc.id)
        .collection("devis");
      const devisSnapshot = await devisCollectionRef.get();

      // Récupérer les devis sous forme de tableau
      const devisArray = [];
      devisSnapshot.forEach((devisDoc) => {
        devisArray.push({ id: devisDoc.id, ...devisDoc.data() });
      });

      // Ajouter les devis à l'objet réservation
      reservation.devis = devisArray;

      // Ajouter la réservation (avec les devis) au tableau des réservations
      reservations.push(reservation);
    }

    // Renvoyer la réponse au client
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

const createPreDemand = async (req, res) => {
  const { reservationData, shortId, email, userFirstName, userName, phone } =
    req.body;

  console.log("USERFIRSTNAME ", userFirstName, "userName", userName);

  try {
    // 1. Vérifier que les données nécessaires sont présentes
    if (
      !reservationData ||
      !shortId ||
      !email ||
      !userFirstName ||
      !userName ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Données de réservation manquantes ou invalides.",
      });
    }

    // 2. Compter le nombre de réservations existantes pour cet utilisateur
    const userReservations = await db
      .collection("reservations")
      .where("shortId", "==", shortId) // Utiliser le shortId reçu directement
      .get();

    // 3. Générer l'ID personnalisé de la nouvelle pré-demande (shortId + nombre de réservations)
    const reservationCount = userReservations.size + 1;
    const reservationShortId = `${shortId}-${reservationCount}`; // Créer un reservationShortId

    // 4. Créer la nouvelle pré-demande (réservation)
    const newPreDemand = {
      ...reservationData,
      phone: phone,
      bookingStatus: "pré-demande",
      reservationType: "petits-travaux", // Statut indiquant que c'est une pré-demande
      createdAt: new Date(), // Date de création de la pré-demande
      emails: {
        confirmationEmailSent: false,
        instructionsKeysEmailSent: false,
        defaultInstructionsEmailSent: false,
      },
      shortId: shortId,
      paymentStatus: "aucun paiement requis pour le moment",
      email: email,
      name: userName,
      firstName: userFirstName,
      chatStatus: false, // Statut du chat (par défaut à false)
      reservationShortId: reservationShortId, // ID personnalisé de la réservation
    };

    // 5. Enregistrer la pré-demande dans Firestore
    const docRef = await db.collection("reservations").add(newPreDemand);

    // 6. Retourner la réponse avec l'ID de pré-demande
    res.json({
      success: true,
      message: "Pré-demande créée avec succès.",
      reservationId: docRef.id, // ID Firestore (long)
      reservationShortId: reservationShortId, // ID personnalisé de réservation (shortId + incrément)
    });
  } catch (error) {
    console.error("Erreur lors de la création de la pré-demande:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur.",
      error: error.message,
    });
  }
};

module.exports = {
  getReservedDates,
  getReservationsByUser,
  createPreDemand,
};
