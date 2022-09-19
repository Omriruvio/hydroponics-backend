// message template to be sent to invited user
// Hello, as a part of your Hydroponics Network subscription, you have been invited by {{1}} to collaborate on a system named "{{2}}"
// You can now send crop data related to this system with the following format:
// system {{3}} temp <value> ec <value> ph <value>

/**
 * Adds a user to the list of users on a system
 * Sends a whatsapp message to the invited user
 * System must be public, if not, sends an error whatsapp message and response requesting to make the system public
 * If the user is already a part of the systems' users, sends an error whatsapp message and response
 * Utilizes a function that converts phone numbers to be invited from '0501234567' to 'whatsapp:+972501234567' taking into account the country code which will be figured out by the twilio api
 */
