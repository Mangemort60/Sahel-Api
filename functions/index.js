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
// passe le statut de la réservation "à venir" à "en cours " le jour de la préstation
exports.updateReservationStatus = updateReservationStatus;
// Fonction pour gérer les mises à jour du paiement (payé ou refusé)
exports.handlePaymentStatusAndServiceFee = handlePaymentStatusAndServiceFee;
