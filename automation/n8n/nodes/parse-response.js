/**
 * Node: Parse AI Response
 * 
 * Extracts and parses JSON from Gemini API response.
 * Handles various response formats:
 * - Markdown code fences (```json...```)
 * - Plain JSON
 * - Nested response structures
 * 
 * @param {object} $json - The API response
 * @returns {array} Array with parsed application object
 */

const response = $json;
let text = '';

// Extract text from various response formats
try {
  text = response.body || response.text || JSON.stringify(response);
} catch (e) {
  text = JSON.stringify(response);
}

// Try to extract JSON from markdown code fences
const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
let parsed = null;

if (jsonMatch) {
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch (e) {
    console.error('Failed to parse JSON from code fence:', e);
    parsed = null;
  }
}

// If no code fence, try parsing the entire text as JSON
if (!parsed) {
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse response as JSON:', e);
    // Store raw text for debugging
    parsed = { raw: text, error: 'Failed to parse JSON' };
  }
}

// Validate required fields
if (parsed && !parsed.error) {
  const required = ['targetCompany', 'targetRoleTitle', 'customIntroduction', 'alignmentPoints', 'closingStatement'];
  const missing = required.filter(field => !parsed[field]);
  
  if (missing.length > 0) {
    console.warn('Missing required fields:', missing);
    parsed.warning = `Missing fields: ${missing.join(', ')}`;
  }
  
  // Validate alignmentPoints structure
  if (parsed.alignmentPoints && Array.isArray(parsed.alignmentPoints)) {
    const validCategories = ['cx-design', 'automation', 'technical', 'general'];
    const invalidPoints = parsed.alignmentPoints.filter(
      point => !point.category || !point.content || !validCategories.includes(point.category)
    );
    
    if (invalidPoints.length > 0) {
      console.warn('Invalid alignmentPoints structure detected');
      parsed.warning = (parsed.warning || '') + ' Invalid alignmentPoints structure';
    }
  }
}

return [{
  json: {
    application: parsed
  }
}];
