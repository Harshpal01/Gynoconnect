const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const emailPort = Number.parseInt(process.env.EMAIL_PORT || '587', 10);
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.warn('⚠️ EMAIL_USER / EMAIL_PASS not set. Email notifications will fail until configured.');
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Format time to 12-hour format
const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    // Handle different time formats
    let hours, minutes;
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      hours = date.getUTCHours();
      minutes = date.getUTCMinutes();
    } else if (timeString.includes(':')) {
      const parts = timeString.split(':');
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else {
      return timeString;
    }
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch (error) {
    return timeString;
  }
};

// Send reschedule notification
const sendRescheduleNotification = async (to, appointmentDetails) => {
  const { patientName, appointmentDate, appointmentTime, reason, doctorName } = appointmentDetails;

  const mailOptions = {
    from: `"Gynoconnect Hospital" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔄 Appointment Rescheduled - Gynoconnect Hospital',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #5f6FFF; color: white; padding: 20px; text-align: center;">
          <h1>🔄 Appointment Rescheduled</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear ${patientName},</p>
          <p>Your appointment has been rescheduled. Here are the updated details:</p>
          <div style="background-color: #F5F7FB; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>⏰ Time:</strong> ${formatTime(appointmentTime)}</p>
            <p><strong>📋 Reason:</strong> ${reason}</p>
            ${doctorName ? `<p><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>` : ''}
          </div>
          <p>If this new time does not work for you, please contact us to make changes.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">Best regards,<br><strong>Gynoconnect Hospital</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✉️ Reschedule notification sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send reschedule notification:', error.message);
    return { success: false, error: error.message };
  }
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (to, appointmentDetails) => {
  const { patientName, appointmentDate, appointmentTime, reason, doctorName } = appointmentDetails;

  const mailOptions = {
    from: `"Gynoconnect Hospital" <${process.env.EMAIL_USER}>`,
    to,
    subject: '✅ Appointment Confirmed - Gynoconnect Hospital',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #5f6FFF; color: white; padding: 20px; text-align: center;">
          <h1>✅ Appointment Confirmed</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear ${patientName},</p>
          <p>Your appointment has been confirmed with the following details:</p>
          <div style="background-color: #F5F7FB; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>⏰ Time:</strong> ${formatTime(appointmentTime)}</p>
            <p><strong>📋 Reason:</strong> ${reason}</p>
            ${doctorName ? `<p><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>` : ''}
          </div>
          <p>Please arrive 10 minutes early for your appointment.</p>
          <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">Best regards,<br><strong>Gynoconnect Hospital</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✉️ Confirmation email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send 24-hour appointment reminder email
const sendAppointmentReminder = async (to, appointmentDetails) => {
  const { patientName, appointmentDate, appointmentTime, reason, doctorName } = appointmentDetails;

  const mailOptions = {
    from: `"Gynoconnect Hospital" <${process.env.EMAIL_USER}>`,
    to,
    subject: '⏰ Appointment Tomorrow - Gynoconnect Hospital',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #F97316; color: white; padding: 20px; text-align: center;">
          <h1>⏰ Reminder: Appointment Tomorrow</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear ${patientName},</p>
          <p>This is a friendly reminder that you have an appointment <strong>tomorrow</strong>:</p>
          <div style="background-color: #FFF7ED; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F97316;">
            <p><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>⏰ Time:</strong> ${formatTime(appointmentTime)}</p>
            <p><strong>📋 Reason:</strong> ${reason}</p>
            ${doctorName ? `<p><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>` : ''}
          </div>
          <p>Please arrive 10 minutes early.</p>
          <p><strong>What to bring:</strong></p>
          <ul>
            <li>Valid ID or insurance card</li>
            <li>List of current medications</li>
            <li>Any relevant medical records</li>
          </ul>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">Best regards,<br><strong>Gynoconnect Hospital</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✉️ 24-hour reminder email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send reminder email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send same-day appointment reminder email
const sendSameDayReminder = async (to, appointmentDetails) => {
  const { patientName, appointmentDate, appointmentTime, reason, doctorName } = appointmentDetails;

  const mailOptions = {
    from: `"Gynoconnect Hospital" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔔 Appointment Today! - Gynoconnect Hospital',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
          <h1>🔔 Your Appointment is Today!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear ${patientName},</p>
          <p>This is a reminder that your appointment is <strong>today</strong>:</p>
          <div style="background-color: #ECFDF5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <p><strong>📅 Date:</strong> Today, ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>⏰ Time:</strong> ${formatTime(appointmentTime)}</p>
            <p><strong>📋 Reason:</strong> ${reason}</p>
            ${doctorName ? `<p><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>` : ''}
          </div>
          <p style="font-size: 16px; color: #10B981;"><strong>Please arrive 10 minutes before your scheduled time.</strong></p>
          <p>We look forward to seeing you!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">Best regards,<br><strong>Gynoconnect Hospital</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✉️ Same-day reminder email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send same-day reminder email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send cancellation notification
const sendCancellationNotification = async (to, appointmentDetails) => {
  const { patientName, appointmentDate, appointmentTime, reason } = appointmentDetails;

  const mailOptions = {
    from: `"Gynoconnect Hospital" <${process.env.EMAIL_USER}>`,
    to,
    subject: '❌ Appointment Cancelled - Gynoconnect Hospital',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #EF4444; color: white; padding: 20px; text-align: center;">
          <h1>❌ Appointment Cancelled</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear ${patientName},</p>
          <p>Your appointment has been cancelled:</p>
          <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <p><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>⏰ Time:</strong> ${formatTime(appointmentTime)}</p>
            <p><strong>📋 Reason:</strong> ${reason}</p>
          </div>
          <p>If you would like to reschedule, please book a new appointment through our system.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">Best regards,<br><strong>Gynoconnect Hospital</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✉️ Cancellation notification sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send cancellation notification:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendSameDayReminder,
  sendCancellationNotification,
  sendRescheduleNotification,
};
