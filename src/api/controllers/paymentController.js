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
    });


    // Renvoie le clientSecret au client pour qu'il puisse finaliser le paiement
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const { paymentIntentId, reservationData } = req.body;

  try {
    const existingReservation = await db.collection('reservations')
      .where('paymentIntentId', '==', paymentIntentId)
      .get();

    if (!existingReservation.empty) {
      // Si une réservation existe déjà, ne créez pas de nouvelle réservation
      return res.json({ success: true, message: 'Réservation déjà créée pour cet ID d\'intention de paiement.', existing: true });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const isBeforeOrAfter = reservationData.formData.beforeOrAfter

     
    if (paymentIntent.status === 'succeeded') {
      // Créez la réservation dans la collection 'reservations' de Firestore
      let newReservation = {
        ...reservationData,
        paymentIntentId,
        bookingStatus: 'confirmé',
        serviceStatus: 'à venir',
        createdAt: new Date(),
        emails : {
          confirmationEmailSent: false,
          instructionsKeysEmailSent: false,
          defaultInstructionsEmailSent: false,

        },
        chatStatus: true,
      };

      // Ajout conditionnel du champ keyReceived
      if (isBeforeOrAfter === "before") {
        newReservation = {
          ...newReservation,
          keyReceived: false,
        };
      }
      const docRef = await db.collection('reservations').add(newReservation);

    // Récupération du document utilisateur basé sur shortId
    const userRef = db.collection('users').where('shortId', '==', reservationData.shortId);
    const userDocSnapshot = await userRef.get();

    let customerId;

    if (!userDocSnapshot.empty) {
      const userDoc = userDocSnapshot.docs[0];
      const userData = userDoc.data();
      customerId = userData.stripeCustomerId;

      if (!customerId) {
        // Création d'un nouveau client Stripe si aucun customerId n'est trouvé
        const customer = await stripe.customers.create({
          email: reservationData.email,
          name: reservationData.name,
          metadata: {
            shortId: reservationData.shortId,
          },
        });

        // Mise à jour du document utilisateur avec le nouveau stripeCustomerId
        await userDoc.ref.set({ stripeCustomerId: customer.id }, { merge: true });

        customerId = customer.id;
      }

      stripe.paymentIntents.create({
        amount: 2000, // Montant en centimes
        currency: 'eur',
        receipt_email: reservationData.email, // Assurez-vous que cet e-mail est bien celui du client
      });

    } else {
      // Gérer l'absence de document utilisateur, si nécessaire
      console.error('Aucun utilisateur trouvé avec le shortId fourni.');
    }      res.json({
        success: true,
        message: 'Paiement réussi et réservation créée.',
        reservationId: docRef.id, // Retourner l'ID de la réservation créée peut être utile pour le client
      });
    } else {
      res.json({ success: false, message: 'Paiement non réussi.' });
    }
  } catch (error) {
    console.error("Error verifying payment and creating reservation:", error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.', error: error.message });
  }
};