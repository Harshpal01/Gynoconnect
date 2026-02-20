const dotenv = require('dotenv');
dotenv.config();

// SMS Service using Africa's Talking (popular in Kenya)
// You can also use Twilio or any other SMS provider

// For Africa's Talking:
// npm install africastalking

let AfricasTalking;
let sms;

// Debug: Log credentials (masked)
const apiKey = process.env.AT_API_KEY;
const username = process.env.AT_USERNAME;
console.log('📱 SMS Config:');
console.log(`   Username: ${username}`);
console.log(`   API Key: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5) : 'NOT SET'}`);

try {
  AfricasTalking = require('africastalking');
  const africastalking = AfricasTalking({
    apiKey: apiKey,
    username: username,
  });
  sms = africastalking.SMS;
  console.log('   Status: Africa\'s Talking SDK initialized');
} catch (error) {
  console.log('   Status: Africa\'s Talking SMS not configured -', error.message);
}

// Format phone number for Kenya
const formatPhoneNumber = (phone) => {
  if (phone === null || phone === undefined) return null;

  const phoneStr = String(phone).trim();
  if (!phoneStr) return null;

  // Remove any spaces or special characters
  let cleaned = phoneStr.replace(/[\s\-\(\)]/g, '');
  
  // If starts with 0, replace with +254
  if (cleaned.startsWith('0')) {
    cleaned = '+254' + cleaned.substring(1);
  }
  
  // If starts with 254, add +
  if (cleaned.startsWith('254')) {
    cleaned = '+' + cleaned;
  }
  
  // If doesn't start with +, add +254
  if (!cleaned.startsWith('+')) {
    cleaned = '+254' + cleaned;
  }
  
  return cleaned;
};

// Format time for display
const formatTime = (timeValue) => {
  if (!timeValue) return '';
  if (timeValue.includes('T')) {
    const timePart = timeValue.split('T')[1]?.split('.')[0];
    if (timePart) {
      const [hours, minutes] = timePart.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
  }
  if (timeValue.includes(':')) {
    const [hours, minutes] = timeValue.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  return timeValue;
};

// Send appointment confirmation SMS
const sendAppointmentConfirmationSMS = async (phone, appointmentDetails) => {
  const { patientName, appointmentDate, appointmentTime, doctorName } = appointmentDetails;
  const formattedPhone = formatPhoneNumber(phone);
  
  if (!formattedPhone) {
    console.log('Invalid phone number:', phone);
    return false;
  }

  const message = `Hi ${patientName}, your appointment at Gynoconnect is confirmed for ${new Date(appointmentDate).toLocaleDateString()} at ${formatTime(appointmentTime)}${doctorName ? ` with ${doctorName}` : ''}. Please arrive 10 mins early.`;

  try {
    if (sms && process.env.AT_API_KEY) {
      const result = await sms.send({
        to: [formattedPhone],
        message: message,
      });
      console.log('SMS sent successfully:', result);
      return true;
    } else {
      // Log SMS for development/testing
      console.log('📱 SMS (not sent - configure AT_API_KEY):');
      console.log(`   To: ${formattedPhone}`);
      console.log(`   Message: ${message}`);
      return true;
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
};

// Send reschedule SMS
const sendRescheduleSMS = async (phone, appointmentDetails) => {
  const { patientName, appointmentDate, appointmentTime, doctorName } = appointmentDetails;
  const formattedPhone = formatPhoneNumber(phone);

  if (!formattedPhone) {
    console.log('Invalid phone number:', phone);
    return false;
  }

  const message = `Hi ${patientName}, your appointment at Gynoconnect has been RESCHEDULED to ${new Date(appointmentDate).toLocaleDateString()} at ${formatTime(appointmentTime)}${doctorName ? ` with ${doctorName}` : ''}. Please arrive 10 mins early.`;

  try {
    if (sms && process.env.AT_API_KEY) {
      const result = await sms.send({
        to: [formattedPhone],
        message: message,
      });
      console.log('Reschedule SMS sent successfully:', result);
      return true;
    } else {
      console.log('📱 Reschedule SMS (not sent - configure AT_API_KEY):');
      console.log(`   To: ${formattedPhone}`);
      console.log(`   Message: ${message}`);
      return true;
    }
  } catch (error) {
    console.error('Failed to send reschedule SMS:', error);
    return false;
  }
};

// Send appointment reminder SMS
const sendAppointmentReminderSMS = async (phone, appointmentDetails) => {
  const { patientName, appointmentDate, appointmentTime, doctorName } = appointmentDetails;
  const formattedPhone = formatPhoneNumber(phone);
  
  if (!formattedPhone) {
    console.log('Invalid phone number:', phone);
    return false;
  }

  const message = `REMINDER: Hi ${patientName}, you have an appointment tomorrow at Gynoconnect on ${new Date(appointmentDate).toLocaleDateString()} at ${formatTime(appointmentTime)}${doctorName ? ` with ${doctorName}` : ''}. Reply YES to confirm.`;

  try {
    if (sms && process.env.AT_API_KEY) {
      const result = await sms.send({
        to: [formattedPhone],
        message: message,
      });
      console.log('Reminder SMS sent successfully:', result);
      return true;
    } else {
      console.log('📱 SMS Reminder (not sent - configure AT_API_KEY):');
      console.log(`   To: ${formattedPhone}`);
      console.log(`   Message: ${message}`);
      return true;
    }
  } catch (error) {
    console.error('Failed to send reminder SMS:', error);
    return false;
  }
};

// Send same-day reminder SMS
const sendSameDayReminderSMS = async (phone, appointmentDetails) => {
  const { patientName, appointmentTime, doctorName } = appointmentDetails;
  const formattedPhone = formatPhoneNumber(phone);
  
  if (!formattedPhone) {
    console.log('Invalid phone number:', phone);
    return false;
  }

  const message = `Hi ${patientName}, reminder: Your appointment at Gynoconnect is TODAY at ${formatTime(appointmentTime)}${doctorName ? ` with ${doctorName}` : ''}. See you soon!`;

  try {
    if (sms && process.env.AT_API_KEY) {
      const result = await sms.send({
        to: [formattedPhone],
        message: message,
      });
      console.log('Same-day reminder SMS sent successfully:', result);
      return true;
    } else {
      console.log('📱 Same-Day SMS Reminder (not sent - configure AT_API_KEY):');
      console.log(`   To: ${formattedPhone}`);
      console.log(`   Message: ${message}`);
      return true;
    }
  } catch (error) {
    console.error('Failed to send same-day reminder SMS:', error);
    return false;
  }
};

// Send cancellation SMS
const sendCancellationSMS = async (phone, appointmentDetails) => {
  const { patientName, appointmentDate, appointmentTime } = appointmentDetails;
  const formattedPhone = formatPhoneNumber(phone);
  
  if (!formattedPhone) {
    console.log('Invalid phone number:', phone);
    return false;
  }

  const message = `Hi ${patientName}, your appointment at Gynoconnect on ${new Date(appointmentDate).toLocaleDateString()} at ${formatTime(appointmentTime)} has been cancelled. Please book again if needed.`;

  try {
    if (sms && process.env.AT_API_KEY) {
      const result = await sms.send({
        to: [formattedPhone],
        message: message,
      });
      console.log('Cancellation SMS sent successfully:', result);
      return true;
    } else {
      console.log('📱 Cancellation SMS (not sent - configure AT_API_KEY):');
      console.log(`   To: ${formattedPhone}`);
      console.log(`   Message: ${message}`);
      return true;
    }
  } catch (error) {
    console.error('Failed to send cancellation SMS:', error);
    return false;
  }
};

module.exports = {
  sendAppointmentConfirmationSMS,
  sendAppointmentReminderSMS,
  sendSameDayReminderSMS,
  sendCancellationSMS,
  sendRescheduleSMS,
  formatPhoneNumber,
};
