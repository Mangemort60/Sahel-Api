const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {db} = require('../../config/firebaseConfig')


exports.createPayment = async (req, res) => {
    const { amount } = req.body;
    const amountCentimes = Math.round(amount * 100)

    try {


        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountCentimes, // Montant en centimes
          currency: 'eur', // Ou toute autre devise nécessaire
          // Vous pouvez ajouter d'autres options ici selon vos besoins
        });
    
        // Renvoie le clientSecret au client pour qu'il puisse utiliser l'API Stripe pour finaliser le paiement
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
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

    if (paymentIntent.status === 'succeeded') {
      // Assurez-vous que les données de réservation sont conformes à ce que votre base de données attend
      const newReservation = {
        ...reservationData,
        paymentIntentId, // Stocker l'ID de l'intention de paiement peut être utile pour la traçabilité
        status: 'confirmed', // Vous pouvez ajouter d'autres champs selon vos besoins, comme un statut
        createdAt: new Date(), // Date de création de la réservation
      };

      // Créez la réservation dans la collection 'reservations' de Firestore
      const docRef = await db.collection('reservations').add(newReservation);

      res.json({
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
  }}