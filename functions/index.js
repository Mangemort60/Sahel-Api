/* eslint-disable linebreak-style */
/* eslint-disable max-len */
require("dotenv").config();

const {
  sendEmailOnKeyReceived,
  sendEmailConfirmationCleaning,
  sendEmailConfirmationCooking,
  sendEmailOnNewAdminMessage,
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
// Fonction pour envoyer un email lorsque keyReceived est mis à jour à true
exports.sendEmailOnKeyReceived = sendEmailOnKeyReceived;
// passe le statut de la réservation "à venir" à "en cours " le jour de la préstation
exports.updateReservationStatus = updateReservationStatus;
// Fonction pour gérer les mises à jour du paiement (payé ou refusé)
exports.handlePaymentStatusAndServiceFee = handlePaymentStatusAndServiceFee;
