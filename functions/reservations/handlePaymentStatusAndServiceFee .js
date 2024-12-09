const { admin } = require("../firebaseFunctionsConfig");
const functions = require("firebase-functions");

// Fonction pour gérer les mises à jour du paiement (payé ou refusé)
const handlePaymentStatusAndServiceFee = functions.firestore
  .document("reservations/{reservationId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const reservationId = context.params.reservationId;

    try {
      // Vérifier si le statut de réservation a changé à "confirmé"
      if (
        before.bookingStatus !== "confirmé" &&
        after.bookingStatus === "confirmé"
      ) {
        console.log(`La réservation ${reservationId} a été confirmée.`);

        // Mettre à jour le statut de paiement à "en attente de paiement des frais de service"
        await admin.firestore().doc(`reservations/${reservationId}`).update({
          paymentStatus: "en attente de paiement des frais de service",
          "serviceFeeInfo.status": "pending",
        });
        console.log(
          `Statut de paiement mis à jour pour la réservation ${reservationId} : en attente de paiement des frais de service.`
        );
      }

      // Vérifier si le statut de paiement a changé dans la sous-collection "devis"
      if (before.paymentStatus !== after.paymentStatus) {
        const devisId = context.params.devisId;

        if (after.paymentStatus === "payé") {
          console.log(
            `Le devis ${devisId} pour la réservation ${reservationId} a été payé.`
          );

          // Mettre à jour le devis comme payé
          await admin
            .firestore()
            .doc(`reservations/${reservationId}/devis/${devisId}`)
            .update({
              paymentStatus: "payé",
              paidAt: new Date().toISOString(), // Ajouter une date de paiement si nécessaire
            });
        } else if (after.paymentStatus === "refusé") {
          console.log(
            `Le devis ${devisId} pour la réservation ${reservationId} a été refusé.`
          );

          // Mettre à jour le devis pour refléter le refus
          await admin
            .firestore()
            .doc(`reservations/${reservationId}/devis/${devisId}`)
            .update({
              status: "refusé",
            });
        }
      }
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du statut pour la réservation ${reservationId}:`,
        error
      );
    }
  });

module.exports = { handlePaymentStatusAndServiceFee };
