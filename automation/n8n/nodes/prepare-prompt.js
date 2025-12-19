/**
 * Node: Prepare Prompt (Structured) - Phase 2
 * 
 * Builds a structured prompt for Gemini API that generates Phase 2 schema format.
 * Instructs the model to output JSON with:
 * - alignmentPoints array (with category + content)
 * - researchContext object (painPoints, keywords, proofPoints)
 * - Other application fields
 * 
 * @param {object} $json - The validated input data
 * @returns {array} Array with prompt object
 */

const p = $json;

// Sample project data (should be fetched from Sanity in production)
const projects = [
  { id: 'P-01', name: 'Pivot Platform', focus: 'Product Strategy', keyMetric: 'transformed near-zero returns to active re-engagement' },
  { id: 'P-02', name: 'Future-Proof Foundation', focus: 'Frontend Architecture', keyMetric: 'saved 6+ months development time' },
  { id: 'P-03', name: 'Ops Autopilot', focus: 'Workflow Automation', keyMetric: 'eliminated manual job matching process' },
  { id: 'P-04', name: 'Knowledge Transfer Engine', focus: 'Documentation & Onboarding', keyMetric: 'reduced onboarding from weeks to 20 minutes' },
  { id: 'P-05', name: 'Career Stories Platform', focus: 'AI-assisted development', keyMetric: 'accelerated 0→1 development' }
];

const prompt = `You are an assistant that outputs JSON only.

Given the job description and the candidate's portfolio, produce a JSON object with the following structure:

{
  "targetCompany": "Company name from job posting",
  "targetRoleTitle": "Role title from job posting",
  "customIntroduction": "2-3 short sentences introducing the candidate",
  "alignmentPoints": [
    { "category": "cx-design", "content": "One bullet point about CX/design alignment" },
    { "category": "automation", "content": "One bullet point about automation experience" },
    { "category": "technical", "content": "One bullet point about technical fit" }
  ],
  "closingStatement": "One sentence closing statement",
  "linkedProjectIds": ["P-01"],
  "researchContext": {
    "painPoints": ["Company challenge 1", "Company challenge 2"],
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "proofPoints": ["metric1", "metric2"]
  }
}

Categories for alignmentPoints:
- "cx-design": User experience, design thinking, product strategy
- "automation": Process automation, workflow optimization, efficiency
- "technical": Technical skills, tools, technologies
- "general": General fit, culture, values

Job Description:
${p.jobDescription}

Available Projects:
${JSON.stringify(projects, null, 2)}

Company: ${p.companyName}
Role: ${p.roleTitle}

Return only valid JSON. Do not include markdown code fences or explanations.`;

return [{
  json: {
    prompt,
    companyName: p.companyName,
    roleTitle: p.roleTitle
  }
}];
