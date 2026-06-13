const fs = require('fs');
const path = require('path');

const emailProvider = require('../providers/email.provider');

const EMAIL_SUBJECTS = {
  VERIFY_EMAIL: 'Verify your email address',
};

const loadTemplate = (templateName) => {
  const templatePath = path.join(__dirname, '..', 'templates', templateName);

  return fs.readFileSync(templatePath, 'utf-8');
};

const renderTemplate = (template, variables) => {
  let renderedTemplate = template;

  Object.entries(variables).forEach(([key, value]) => {
    renderedTemplate = renderedTemplate.replaceAll(`{{${key}}}`, value);
  });

  return renderedTemplate;
};

const sendVerificationEmail = async ({ email, firstName, verificationUrl }) => {
  const template = loadTemplate('verification-email.html');

  const html = renderTemplate(template, {
    firstName,
    verificationUrl,
  });

  await emailProvider.send({
    to: email,
    subject: EMAIL_SUBJECTS.VERIFY_EMAIL,
    html,
  });
};

module.exports = {
  sendVerificationEmail,
};
