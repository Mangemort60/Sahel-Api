const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {db} = require('../../config/firebaseConfig')


exports.createPayment = async (req, res) => {
  const { amount, email, shortId , name} = req.body; // Assurez-vous d'inclure shortId dans la requête
  const amountCentimes = Math.round(amount * 100);

  console.log(email);
  try {
    // Récupération du document utilisateur basé sur shortId
    const usersRef = db.collection('users');
    const queryRef = await usersRef.where('shortId', '==', shortId).get();

    let customerId;

    if (!queryRef.empty) {
      // L'utilisateur existe dans Firestore
      const userDoc = queryRef.docs[0];
      const userData = userDoc.data();
      customerId = userData.stripeCustomerId;

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
        await userDoc.ref.set({ stripeCustomerId: customer.id }, { merge: true });
        
        customerId = customer.id;
      }
    } 
    // Création du PaymentIntent avec le customerId existant ou nouvellement créé
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCentimes,
      currency: 'eur',
      customer: customerId,
      receipt_email: email,
      payment_method_types: ['card']
    });


    // Renvoie le clientSecret au client pour qu'il puisse finaliser le paiement
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const { paymentIntentId, reservationData, reservationType } = req.body;

  try {
    // Vérifiez si la réservation existe déjà
    const existingReservation = await db.collection('reservations')
      .where('paymentIntentId', '==', paymentIntentId)
      .get();

    if (!existingReservation.empty) {
      return res.json({ success: true, message: 'Réservation déjà créée pour cet ID d\'intention de paiement.', existing: true });
    }

    // Récupérer l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const isBeforeOrAfter = reservationData.beforeOrAfter;

    if (paymentIntent.status === 'succeeded') {

      // 1. Récupérer l'ID utilisateur (shortId)
      const userShortId = reservationData.shortId;

      // 2. Compter le nombre de réservations existantes pour cet utilisateur
      const userReservations = await db.collection('reservations')
        .where('shortId', '==', userShortId)
        .get();

      // 3. Incrémenter de 1 pour générer l'ID de la nouvelle réservation
      const reservationCount = userReservations.size + 1; // Nombre de réservations + 1
      const reservationShortId = `${userShortId}-${reservationCount}`; // Combiner l'ID utilisateur avec le nombre

      // 4. Créer la nouvelle réservation
      let newReservation = {
        reservationType: reservationType,
        ...reservationData,
        paymentIntentId,
        bookingStatus: 'confirmé',
        serviceStatus: 'à venir',
        createdAt: new Date(),
        emails: {
          confirmationEmailSent: false,
          instructionsKeysEmailSent: false,
          defaultInstructionsEmailSent: false,
        },
        chatStatus: true,
        reservationShortId: reservationShortId, // Ajout de l'ID personnalisé de réservation
      };

      // Ajout conditionnel du champ keyReceived
      if (isBeforeOrAfter === "before") {
        newReservation = {
          ...newReservation,
          keyReceived: false,
        };
      }

      // 5. Enregistrer la réservation dans Firestore
      const docRef = await db.collection('reservations').add(newReservation);

      // Récupérer les informations utilisateur et gérer le client Stripe comme dans votre code existant

      // 6. Retourner la réponse avec l'ID de réservation
      res.json({
        success: true,
        message: 'Paiement réussi et réservation créée.',
        reservationId: docRef.id,           // ID Firestore (long)
        reservationShortId: reservationShortId,  // ID personnalisé de réservation (shortId + incrément)
      });
    } else {
      res.json({ success: false, message: 'Paiement non réussi.' });
    }
  } catch (error) {
    console.error("Error verifying payment and creating reservation:", error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.', error: error.message });
  }
};
