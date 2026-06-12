const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDER_EMAIL || 'contact@afrikpay.tech'; // Set your verified sender email

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (to, name) => {
  if (!process.env.SENDGRID_API_KEY) return;
  const msg = {
    to,
    from: FROM_EMAIL,
    subject: 'Bienvenue chez AfrikPay !',
    html: `
      <div style="font-family: Arial, sans-serif; max-w-xl mx-auto p-4">
        <h2 style="color: #2D3748;">Bienvenue, ${name} !</h2>
        <p>Nous sommes ravis de vous compter parmi nos marchands sur <strong>AfrikPay</strong>.</p>
        <p>Vous pouvez dès à présent accéder à votre tableau de bord, configurer vos clés API, et commencer à accepter des paiements et effectuer des retraits.</p>
        <br>
        <p>Si vous avez besoin d'aide, n'hésitez pas à nous contacter.</p>
        <br>
        <p>L'équipe AfrikPay</p>
      </div>
    `,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

/**
 * Send Withdrawal Status Email
 */
const sendWithdrawalStatusEmail = async (to, name, amount, status) => {
  if (!process.env.SENDGRID_API_KEY) return;
  
  const isCompleted = status === 'completed';
  const statusText = isCompleted ? 'approuvé' : 'rejeté';
  const color = isCompleted ? '#38A169' : '#E53E3E';

  const msg = {
    to,
    from: FROM_EMAIL,
    subject: `Mise à jour de votre demande de retrait (${statusText})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-w-xl mx-auto p-4">
        <h2 style="color: #2D3748;">Bonjour ${name},</h2>
        <p>Votre demande de retrait d'un montant de <strong>${amount} XOF</strong> a été <span style="color: ${color}; font-weight: bold;">${statusText}</span>.</p>
        ${isCompleted ? '<p>Les fonds devraient être disponibles sur votre compte de destination très prochainement.</p>' : '<p>Veuillez vérifier votre tableau de bord ou contacter le support pour plus de détails sur la raison du rejet.</p>'}
        <br>
        <p>Cordialement,</p>
        <p>L'équipe AfrikPay</p>
      </div>
    `,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending withdrawal status email:', error);
  }
};

/**
 * Send Country Access Status Email
 */
const sendCountryAccessEmail = async (to, name, countryCode, status) => {
  if (!process.env.SENDGRID_API_KEY) return;

  const isAuthorized = status === 'authorized';
  const statusText = isAuthorized ? 'approuvée' : 'rejetée';
  const color = isAuthorized ? '#38A169' : '#E53E3E';

  const msg = {
    to,
    from: FROM_EMAIL,
    subject: `Mise à jour de votre accès au pays ${countryCode} (${statusText})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-w-xl mx-auto p-4">
        <h2 style="color: #2D3748;">Bonjour ${name},</h2>
        <p>Votre demande d'accès au marché <strong>${countryCode}</strong> a été <span style="color: ${color}; font-weight: bold;">${statusText}</span> par nos administrateurs.</p>
        ${isAuthorized ? '<p>Vous pouvez désormais traiter des paiements dans ce pays.</p>' : '<p>Si vous pensez qu\\'il s\\'agit d\\'une erreur, n\\'hésitez pas à contacter notre support.</p>'}
        <br>
        <p>Cordialement,</p>
        <p>L'équipe AfrikPay</p>
      </div>
    `,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending country access status email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendWithdrawalStatusEmail,
  sendCountryAccessEmail,
};
