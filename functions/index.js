/* eslint-disable linebreak-style */
/* eslint-disable max-len */
require("dotenv").config();

const {
  sendEmailOnKeyReceived,
  sendEmailConfirmationCleaning,
  sendEmailConfirmationCooking,
  sendEmailOnNewAdminMessage,
  sendEmailServiceInProgress,
  sendEmailOnServiceCompletion,
  sendEmailPreRequestConfirmation,
  sendServiceFeePaymentRequestEmail,
  sendConfirmationAndInstructionsEmails,
  sendEmailEstimateReadyForPayment,
  sendEmailConfirmationPayment,
  sendEmailServiceDatesDefined,
} = require("./emails");
const {
  updateReservationStatus,
  handlePaymentStatusAndServiceFee,
} = require("./reservations");

// Envoi un email de confirmation et instructions au client
exports.sendEmailConfirmationCleaning = sendEmailConfirmationCleaning;
// Envoi un email de confirmation pour cuisine
exports.sendEmailConfirmationCooking = sendEmailConfirmationCooking;
// Envoi email nouveau message
exports.sendEmailOnNewAdminMessage = sendEmailOnNewAdminMessage;
// Envoi email service en cours
exports.sendEmailServiceInProgress = sendEmailServiceInProgress;
// Envoi email service terminé
exports.sendEmailOnServiceCompletion = sendEmailOnServiceCompletion;
// Envoi email pré-demande enregistrée
exports.sendEmailPreRequestConfirmation = sendEmailPreRequestConfirmation;
// Envoi email lorsque keyReceived est mis à jour à true
exports.sendEmailOnKeyReceived = sendEmailOnKeyReceived;
// Envoi email demande paiement des frais de service
exports.sendServiceFeePaymentRequestEmail = sendServiceFeePaymentRequestEmail;
// Envoi email confirmer paiement frais de service et instructions clés
exports.sendConfirmationAndInstructionsEmails =
  sendConfirmationAndInstructionsEmails;
// Envoi email confirmer paiement devis
exports.sendEmailConfirmationPayment = sendEmailConfirmationPayment;
// Envoi email devis disponible et demande paiement
exports.sendEmailEstimateReadyForPayment = sendEmailEstimateReadyForPayment;
// passe le statut de la réservation "à venir" à "en cours " le jour de la préstation
exports.updateReservationStatus = updateReservationStatus;
// Fonction pour gérer les mises à jour du paiement (payé ou refusé)
exports.handlePaymentStatusAndServiceFee = handlePaymentStatusAndServiceFee;
// Fonction pour envoyer créneau défini pour petits travaux
exports.sendEmailServiceDatesDefined = sendEmailServiceDatesDefined;
