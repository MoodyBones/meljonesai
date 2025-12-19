/**
 * Node: Generate Slug
 * 
 * Generates a URL-friendly slug from company name and role title.
 * Format: companyname-roletitle (lowercase, alphanumeric + hyphens only)
 * 
 * @param {object} $json - Data containing companyName and roleTitle
 * @returns {array} Array with data including generated slug
 */

const { companyName, roleTitle } = $json;

// Generate slug: lowercase, replace non-alphanumeric with hyphens, remove consecutive hyphens
const slug = (companyName + '-' + roleTitle)
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')  // Remove leading/trailing hyphens
  .substring(0, 50);      // Limit length

return [{
  json: {
    ...$json,
    slug
  }
}];
