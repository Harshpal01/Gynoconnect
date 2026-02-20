const { response } = require('express');

// Set your app credentials
const credentials = {
	apiKey: 'atsk_fa09fd05b9a7a411c87eaae724ec819a99052947a84262d5107a685c209076e49871bd84',
	username: 'Gynoconnect_sms',
}

// Initialize the SDK
const AfricasTalking = require('africastalking')(credentials);

// Get the SMS service
const sms = AfricasTalking.SMS;

function sendMessage() {
	const options = {
		// Set the numbers you want to send to in international format
		to: '+254731321273', // Airtel number for testing
		// Set your message
		message: "Hello my people",
		// Set your shortCode or senderId (optional, uncomment if needed)
		// from: 'XXYYZZ'
	};

	// That’s it, hit send and we’ll take care of the rest
	sms.send(options)
		.then(response => {
			console.log('API Response:', JSON.stringify(response, null, 2));
		})
		.catch(console.log);
}

sendMessage();
