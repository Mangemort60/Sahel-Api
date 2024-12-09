const { db } = require("../../config/firebaseConfig");

// notificationsController.js
exports.getDetailedBadgeStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    const reservationsSnapshot = await db
      .collection("reservations")
      .where("shortId", "==", userId) // Utilisation de shortId pour identifier l'utilisateur
      .get();

    // if (reservationsSnapshot.empty) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Aucune réservation trouvée pour cet utilisateur.",
    //   });
    // }

    // Initialiser la structure notifDetails
    const notifDetails = [];
    let totalNotifications = 0;

    // Parcourir les réservations
    for (const reservationDoc of reservationsSnapshot.docs) {
      const reservationData = reservationDoc.data();
      const reservationType = reservationData.reservationType; // Utilisation de reservationType comme catégorie

      // Variables de contrôle pour chaque réservation
      let hasUnreadMessages = false;
      let hasPendingServiceFees = false;
      let hasPendingInvoicePayments = false;
      let notificationCount = 0;

      // Vérifier s'il y a des messages non lus venant de Admin ou SuperAdmin
      if (reservationData.messages) {
        hasUnreadMessages = reservationData.messages.some(
          (msg) =>
            !msg.readByClient &&
            (msg.sender === "Admin" || msg.sender === "SuperAdmin")
        );
      }

      // Vérifier les frais de service en attente
      if (reservationData.serviceFeeInfo?.status === "pending") {
        hasPendingServiceFees = true;
      }

      // Vérifier les devis impayés dans la sous-collection `devis`
      const devisSnapshot = await reservationDoc.ref.collection("devis").get();
      hasPendingInvoicePayments = devisSnapshot.docs.some(
        (doc) => doc.data().paymentStatus === "en attente de paiement"
      );

      // Compter les notifications spécifiques pour chaque réservation
      if (hasUnreadMessages) notificationCount++;
      if (hasPendingServiceFees) notificationCount++;
      if (hasPendingInvoicePayments) notificationCount++;

      // Ajouter une entrée pour cette réservation si des notifications sont présentes
      if (notificationCount > 0) {
        totalNotifications += notificationCount;

        notifDetails.push({
          reservationId: reservationDoc.id,
          reservationType,
          notificationCount,
          unreadMessages: hasUnreadMessages,
          pendingServiceFees: hasPendingServiceFees,
          pendingInvoicePayments: hasPendingInvoicePayments,
        });
      }
    }

    // Structurer la réponse
    const badgeStatus = {
      totalNotifications,
      notifDetails,
    };

    res.status(200).json(badgeStatus);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur.",
    });
  }
};
