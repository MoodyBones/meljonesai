/**
 * Node: Map Project References - Phase 2
 * 
 * Maps selected project IDs to Sanity reference format.
 * Converts linkedProjectIds array to Sanity reference objects.
 * 
 * @param {object} $json - Data containing application with linkedProjectIds
 * @returns {array} Array with data including linkedProjects in Sanity format
 */

// Extract linked project IDs from AI response
const linkedIds = $json.application && $json.application.linkedProjectIds 
  ? $json.application.linkedProjectIds 
  : [];

// Convert to Sanity reference format
// Note: Project documents must exist in Sanity with matching _id values
const linkedProjects = linkedIds
  .slice(0, 3)  // Max 3 projects (Phase 2 spec)
  .map(id => ({
    _type: 'reference',
    _ref: id  // This should match the _id of the project document in Sanity
  }));

return [{
  json: {
    ...$json,
    linkedProjects
  }
}];
