const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { db } = require("../../config/firebaseConfig");

exports.createPayment = async (req, res) => {
  const { amount, email, shortId, name, feesType, reservationId, devisId } =
    req.body;
  const amountCentimes = Math.round(amount * 100);

  console.log("RESERVATION ID ", reservationId, "TYPE", feesType);

  try {
    // Récupération du document utilisateur basé sur shortId
    const usersRef = db.collection("users");
    const queryRef = await usersRef.where("shortId", "==", shortId).get();

    let customerId;

    if (!queryRef.empty) {
      // L'utilisateur existe dans Firestore
      const userDoc = queryRef.docs[0];
      const userData = userDoc.data();
      customerId = userData.stripeCustomerId;

      console.log(
        "Vérification des paramètres avant la création du PaymentIntent :",
        {
          amount: amountCentimes,
          email,
          shortId,
          name,
          feesType,
          reservationId,
          devisId, // Vérifiez si devisId est défini
        }
      );

      if (!customerId) {
        // Si l'utilisateur n'a pas de customerId, créez un nouveau client Stripe
        const customer = await stripe.customers.create({
          email: email,
          name: name,
          metadata: {
            shortId: shortId,
          },
        });

        // Mise à jour du document utilisateur avec le nouveau stripeCustomerId
        await userDoc.ref.set(
          { stripeCustomerId: customer.id },
          { merge: true }
        );

        customerId = customer.id;
      }
    }

    // Création du PaymentIntent avec le customerId existant ou nouvellement créé
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCentimes,
      currency: "eur",
      customer: customerId,
      receipt_email: email,
      payment_method_types: ["card"],
      metadata: {
        shortId: shortId,
        type: feesType,
        reservationId: reservationId,
        devisId: devisId,
      },
    });

    // Renvoie le clientSecret au client pour qu'il puisse finaliser le paiement
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const {
    paymentIntentId,
    reservationData,
    reservationType,
    reservationId,
    devisId,
  } = req.body;

  try {
    console.log(
      "Vérification du paiement pour paymentIntentId:",
      paymentIntentId
    );
    console.log("reservationId:", reservationId);
    console.log("devisId:", devisId);
    console.log("reservationType:", reservationType);

    // Récupérer l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log("Détails du PaymentIntent récupérés:", paymentIntent);

    if (paymentIntent.status !== "succeeded") {
      console.warn("Le paiement n'a pas abouti. Statut:", paymentIntent.status);
      return res.json({ success: false, message: "Paiement non réussi." });
    }

    // Gestion des "petits-travaux" (pré-demande déjà créée)
    if (reservationType === "petits-travaux" && reservationId) {
      const reservationRef = db.collection("reservations").doc(reservationId);
      const reservationDoc = await reservationRef.get();

      if (!reservationDoc.exists) {
        console.error(
          "Réservation non trouvée pour reservationId:",
          reservationId
        );
        return res
          .status(404)
          .json({ success: false, message: "Réservation non trouvée." });
      }

      const existingReservation = reservationDoc.data();
      console.log("Réservation trouvée:", existingReservation);

      // Vérifier si le paiement concerne les frais de service
      if (
        paymentIntent.metadata.type === "serviceFees" &&
        paymentIntent.metadata.reservationId === reservationId
      ) {
        console.log(
          "Paiement des frais de service confirmé pour reservationId:",
          reservationId
        );
        await reservationRef.update({
          paymentStatus: "frais de service payés",
        });
        return res.json({
          success: true,
          message: "Paiement des frais de service confirmé.",
        });
      }

      // Vérifier si le paiement concerne un devis spécifique uniquement si `devisId` est défini
      if (devisId && paymentIntent.metadata.type === "devisPayment") {
        console.log("Vérification du devis avec devisId:", devisId);
        const devisRef = reservationRef.collection("devis").doc(devisId);
        const devisDoc = await devisRef.get();

        if (!devisDoc.exists) {
          console.error("Devis non trouvé pour devisId:", devisId);
          return res
            .status(404)
            .json({ success: false, message: "Devis non trouvé." });
        }

        const existingDevis = devisDoc.data();
        console.log("Devis trouvé:", existingDevis);

        console.log(
          "Vérification des devisId avant la comparaison : devisId des métadonnées:",
          paymentIntent.metadata.devisId,
          "devisId de la requête:",
          devisId
        );

        // Comparer l'ID de PaymentIntent dans les métadonnées pour vérifier le paiement du devis
        if (paymentIntent.metadata.devisId === devisId) {
          console.log(
            "paymentIntentDevisID ",
            paymentIntent.metadata.devisId,
            " devisId fourni",
            devisId
          );

          console.log("Paiement du devis confirmé pour devisId:", devisId);
          await devisRef.update({
            paymentStatus: "payé",
            status: "accepté",
            paidAt: new Date().toISOString(),
          });
          return res.json({
            success: true,
            message: "Paiement du devis confirmé.",
          });
        } else {
          console.warn("L'ID de devis dans les métadonnées ne correspond pas.");
        }
      }

      // Si aucun paiement attendu pour les petits travaux n'est trouvé
      console.warn(
        "Le paiement ne correspond à aucun paiement attendu pour les petits travaux."
      );
      return res.status(400).json({
        success: false,
        message: "Le paiement ne correspond à aucun paiement attendu.",
      });
    }

    // Logique pour les autres types de réservations (nouvelle réservation après paiement réussi)
    console.log("Vérification pour les autres types de réservations...");
    const existingReservation = await db
      .collection("reservations")
      .where("paymentIntentId", "==", paymentIntentId)
      .get();

    if (!existingReservation.empty) {
      console.log(
        "Réservation déjà existante trouvée avec le paymentIntentId:",
        paymentIntentId
      );
      return res.json({
        success: true,
        message: "Réservation déjà créée pour cet ID d'intention de paiement.",
        existing: true,
      });
    }

    // Si aucune réservation existante, création d'une nouvelle réservation
    const isBeforeOrAfter = reservationData.beforeOrAfter;
    console.log("Création d'une nouvelle réservation...");

    // 1. Récupérer l'ID utilisateur (shortId)
    const userShortId = reservationData.shortId;
    console.log("User shortId:", userShortId);

    // 2. Compter le nombre de réservations existantes pour cet utilisateur
    const userReservations = await db
      .collection("reservations")
      .where("shortId", "==", userShortId)
      .get();
    console.log(
      "Nombre de réservations existantes pour cet utilisateur:",
      userReservations.size
    );

    // 3. Incrémenter de 1 pour générer l'ID de la nouvelle réservation
    const reservationCount = userReservations.size + 1;
    const reservationShortId = `${userShortId}-${reservationCount}`;

    // 4. Créer la nouvelle réservation
    let newReservation = {
      reservationType: reservationType,
      ...reservationData,
      paymentIntentId,
      bookingStatus: "confirmé",
      serviceStatus: "à venir",
      createdAt: new Date(),
      emails: {
        confirmationEmailSent: false,
        instructionsKeysEmailSent: false,
        defaultInstructionsEmailSent: false,
      },
      chatStatus: true,
      reservationShortId: reservationShortId,
    };

    if (isBeforeOrAfter === "before") {
      newReservation = {
        ...newReservation,
        keyReceived: false,
      };
    }

    // 5. Enregistrer la nouvelle réservation dans Firestore
    const docRef = await db.collection("reservations").add(newReservation);
    console.log("Nouvelle réservation créée avec ID:", docRef.id);

    // 6. Retourner la réponse avec l'ID de réservation
    res.json({
      success: true,
      message: "Paiement réussi et réservation créée.",
      reservationId: docRef.id,
      reservationShortId: reservationShortId,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du paiement et mise à jour de la réservation:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur.",
      error: error.message,
    });
  }
};
