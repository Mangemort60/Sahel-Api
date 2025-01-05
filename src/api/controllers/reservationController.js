const { db } = require("../../config/firebaseConfig"); // Assurez-vous que ce chemin correspond à votre configuration Firebase
const reservationSchema = require("../../models/reservationModel");
const dayjs = require("dayjs");

const getReservedDates = async (req, res) => {
  try {
    const reservationsSnapshot = await db.collection("reservations").get();

    if (reservationsSnapshot.empty) {
      return res.status(200).json({ cleaning: [], cooking: [] });
    }

    const cleaningReservationCounts = {};
    const cookingReservationCounts = {};

    reservationsSnapshot.forEach((doc) => {
      const { reservationType, serviceDate, serviceDates, serviceStartDate } =
        doc.data();

      // Priorité : serviceStartDate (ISO 8601) > serviceDates.startDate > serviceDate
      const dateToUse =
        serviceStartDate || serviceDates?.startDate || serviceDate;

      if (!dateToUse) return; // Ignore si aucune date n'est présente

      // Utiliser dayjs pour la normalisation
      const normalizedDate = dayjs(dateToUse).format("YYYY-MM-DD");

      // Gestion des réservations selon le type
      if (reservationType === "ménage") {
        cleaningReservationCounts[normalizedDate] =
          (cleaningReservationCounts[normalizedDate] || 0) + 1;
      } else if (reservationType === "cuisine") {
        cookingReservationCounts[normalizedDate] =
          (cookingReservationCounts[normalizedDate] || 0) + 1;
      }
    });

    // Conversion des objets en tableaux
    const cleaningReservations = Object.entries(cleaningReservationCounts).map(
      ([date, count]) => ({ date, count })
    );

    const cookingReservations = Object.entries(cookingReservationCounts).map(
      ([date, count]) => ({ date, count })
    );

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
    console.log(
      "Requête reçue pour shortID:",
      shortID,
      "et type:",
      reservationType
    );

    if (!shortID) {
      return res.status(400).json({ error: "ID utilisateur non disponible." });
    }

    let queryRef = db
      .collection("reservations")
      .where("shortId", "==", shortID);

    // Si un type de réservation est fourni, appliquer le filtre
    if (reservationType) {
      queryRef = queryRef.where("reservationType", "==", reservationType);
    }

    const snapshot = await queryRef.get();

    if (snapshot.empty) {
      // Retourner un tableau vide au lieu d'un 404
      return res.status(200).json([]);
    }

    const reservations = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const reservation = { id: doc.id, ...doc.data() };

        // Récupérer la sous-collection 'devis' pour cette réservation
        const devisCollectionRef = db
          .collection("reservations")
          .doc(doc.id)
          .collection("devis");

        const devisSnapshot = await devisCollectionRef.get();

        // Ajouter les devis à l'objet réservation
        reservation.devis = devisSnapshot.docs.map((devisDoc) => ({
          id: devisDoc.id,
          ...devisDoc.data(),
        }));

        return reservation;
      })
    );

    // Renvoyer les réservations au frontend
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
        serviceFeeConfirmationEmailSent: false,
        preRequestEmailSent: false,
      },
      serviceFeeInfo: {
        amount: 100,
        viewedByClient: false,
        status: "",
      },
      serviceDates: {
        startDate: null,
        endDate: null,
      },
      serviceStartDate: null,
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
