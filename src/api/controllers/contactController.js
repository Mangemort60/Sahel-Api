const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const contactSchema = require('../../models/contactFormModel')

const sendContactForm = async (req, res) => {
  const { name, firstname, phoneNumber, email, details } = req.body;

    // Valider les données du formulaire
    const { error } = contactSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details.map(detail => detail.message) });
    }

  // Valider les données du formulaire
  if (!name || !firstname || !phoneNumber || !email || !details ) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  // Configure API key authorization: api-key
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.SENDINBLUE_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: "hahaddaoui@gmail.com" }];
  sendSmtpEmail.sender = { email: email, name: `${firstname} ${name}` };
  sendSmtpEmail.subject = `Nouveau message de ${firstname, name}`;
  sendSmtpEmail.textContent = `Nom: ${name}\nEmail: ${email}\nMessage: ${details}`;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.status(200).json({ message: 'Message envoyé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
};

module.exports = { sendContactForm };