const {
  sendEmailConfirmationCleaning,
} = require("./sendEmailConfirmationCleaning");
const {
  sendEmailConfirmationCooking,
} = require("./sendEmailConfirmationCooking");
const { sendEmailOnKeyReceived } = require("./sendEmailOnKeyReceived");
const { sendEmailOnNewAdminMessage } = require("./sendEmailOnNewAdminMessage");

module.exports = {
  sendEmailConfirmationCleaning,
  sendEmailOnKeyReceived,
  sendEmailConfirmationCooking,
  sendEmailOnNewAdminMessage,
};
