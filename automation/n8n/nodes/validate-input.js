/**
 * Node: Validate Input
 * 
 * Validates required fields from the incoming webhook payload.
 * Ensures jobDescription, companyName, and roleTitle are present.
 * 
 * @param {object} $json - The incoming webhook data
 * @returns {array} Array with validated data object
 * @throws {Error} If required fields are missing
 */

// Validate required fields
const { jobDescription, companyName, roleTitle } = $json;

if (!jobDescription || !companyName || !roleTitle) {
  throw new Error('Missing required field: jobDescription, companyName, or roleTitle');
}

return [{
  json: {
    jobDescription,
    companyName,
    roleTitle,
    receivedAt: new Date().toISOString()
  }
}];
