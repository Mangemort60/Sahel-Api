const { onSchedule } = require("firebase-functions/v2/scheduler");
const { admin } = require("../firebaseFunctionsConfig");
const { logger } = require("firebase-functions");

// Passe le statut de la réservation "à venir" à "en cours" le jour de la prestation
const updateReservationStatus = onSchedule("every 6 hours", async (event) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalise l'heure pour comparer uniquement les dates

  logger.info(
    "updateReservationStatus function triggered for:",
    today.toISOString()
  );

  try {
    const snapshot = await admin.firestore().collection("reservations").get();

    const updates = [];

    snapshot.forEach((doc) => {
      const reservationDate = doc.data().serviceStartDate;

      // Convertir la date Firestore en objet Date JavaScript
      const reservationDateObject = new Date(reservationDate);
      reservationDateObject.setHours(0, 0, 0, 0); // Normalise l'heure

      // Comparer uniquement les dates, sans l'heure
      if (reservationDateObject.getTime() === today.getTime()) {
        logger.info(`Updating reservation ${doc.id}`);
        updates.push(doc.ref.update({ serviceStatus: "en cours" }));
      }
    });

    await Promise.all(updates);
    logger.info(`Successfully updated ${updates.length} reservations`);
  } catch (error) {
    logger.error("Error updating reservations:", error);
  }
});

module.exports = {
  updateReservationStatus,
};
