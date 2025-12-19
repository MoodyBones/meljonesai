/**
 * Node: Format Response
 * 
 * Formats the final success response to send back to the webhook caller.
 * 
 * @param {object} $json - Data including slug
 * @returns {array} Array with success response object
 */

return [{
  json: {
    success: true,
    slug: $json.slug,
    message: 'Application draft created successfully',
    status: 'ai-generated'
  }
}];
