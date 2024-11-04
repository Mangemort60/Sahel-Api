const { onSchedule } = require("firebase-functions/v2/scheduler");
const { admin } = require("../firebaseFunctionsConfig");
const { logger } = require("firebase-functions");

// passe le statut de la réservation "à venir" à "en cours " le jour de la préstation
const updateReservationStatus = onSchedule("every 6 hours", async (event) => {
  const currentDate = new Date();
  logger.info(
    "updateReservationStatus function triggered at: ",
    currentDate.toISOString()
  );

  const today = new Date();
  const dateString = `${today.getDate().toString().padStart(2, "0")}-${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${today.getFullYear()}`;

  logger.info("Filtering reservations with date:", dateString);

  try {
    const snapshot = await admin
      .firestore()
      .collection("reservations")
      .where("serviceDate", "==", dateString)
      .where("serviceStatus", "==", "à venir")
      .get();

    logger.info(`Found ${snapshot.size} reservations to update`);

    const updates = [];
    snapshot.forEach((doc) => {
      logger.info(`Updating reservation ${doc.id}`);
      updates.push(doc.ref.update({ serviceStatus: "en cours" }));
    });

    await Promise.all(updates);
    logger.info("Updated reservations successfully");
  } catch (error) {
    logger.error("Error updating reservations", error);
    throw new Error("Error updating reservations");
  }
});

module.exports = {
  updateReservationStatus,
};
