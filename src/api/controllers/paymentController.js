const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


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