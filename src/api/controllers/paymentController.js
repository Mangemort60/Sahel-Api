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


exports.verifyPayment = async (req, res) => {

  const paymentIntentId = req.query.payment_intent;
  
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({ success: true, message: 'Payment succeeded' });
    } else {
      res.json({ success: false, message: 'Payment not succeeded', status: paymentIntent.status });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}