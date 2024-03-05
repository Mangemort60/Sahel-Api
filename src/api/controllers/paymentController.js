const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../../config/firebaseConfig'); // Assurez-vous que ce chemin est correct pour votre configuration Firebase


exports.createPayment = async (req, res) => {
    const { amount, reservationId } = req.body;
    const amountCentimes = Math.round(amount * 100)

    try {
        // Vérification de l'existence et du statut de la réservation
        const reservationDoc = await db.collection('reservations').doc(reservationId).get();
        
        if (!reservationDoc.exists) {
            return res.status(404).json({ message: "Reservation not found." });
        }
        
        const reservation = reservationDoc.data();
        if (reservation.status !== "pending") {
            // Assurez-vous que le statut de la réservation est toujours en attente et non déjà payé ou annulé
            return res.status(400).json({ message: "Reservation is not valid for payment." });
        }
        
        // Création du PaymentIntent si la réservation est valide
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountCentimes,
            currency: 'eur',
            metadata: { reservationId }, // Enregistrement de l'ID de réservation dans les métadonnées pour référence future
        });

        res.status(201).send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
};