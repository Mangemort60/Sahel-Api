const {
  sendEmailConfirmationCleaning,
} = require("./sendEmailConfirmationCleaning");
const {
  sendEmailConfirmationCooking,
} = require("./sendEmailConfirmationCooking");
const { sendEmailOnKeyReceived } = require("./sendEmailOnKeyReceived");
const { sendEmailOnNewAdminMessage } = require("./sendEmailOnNewAdminMessage");
const {
  sendEmailOnServiceCompletion,
} = require("./sendEmailOnServiceCompletion");
const { sendEmailServiceInProgress } = require("./sendEmailServiceInProgress");
const {
  sendEmailPreRequestConfirmation,
} = require("./sendPreRequestConfirmationEmail");
const {
  sendServiceFeePaymentRequestEmail,
} = require("./sendServiceFeePaymentRequestEmail");

module.exports = {
  sendEmailConfirmationCleaning,
  sendEmailOnKeyReceived,
  sendEmailConfirmationCooking,
  sendEmailOnNewAdminMessage,
  sendEmailServiceInProgress,
  sendEmailOnServiceCompletion,
  sendEmailPreRequestConfirmation,
  sendServiceFeePaymentRequestEmail,
};
