const Job = require('../models/Job');
const OpenAI = require('openai');

const SCHEMES = [
  {
    id: 1,
    name: "NHFDC Loan Scheme",
    description: "National Handicapped Finance and Development Corporation provides concessional loans to persons with disabilities for self-employment, higher education, and vocational training.",
    eligibility: "Indian citizen, 40% or more disability, age between 18-60 years.",
    link: "http://www.nhfdc.nic.in"
  },
  {
    id: 2,
    name: "ADIP Scheme",
    description: "Assistance to Disabled Persons for Purchase/Fitting of Aids and Appliances covers wheelchairs, hearing aids, braille slates, screen readers, and prosthetic limbs.",
    eligibility: "Indian citizen, 40% or more disability, monthly income less than Rs. 30,000.",
    link: "https://disabilityaffairs.gov.in"
  },
  {
    id: 3,
    name: "DDU-GKY PwD Division",
    description: "Deen Dayal Upadhyaya Grameen Kaushalya Yojana offers placement-linked skill training projects for rural youth with disabilities, offering free hostel facilities and job placements.",
    eligibility: "Rural youth, age 15-35 years, disability certificate holder.",
    link: "https://ddugky.gov.in"
  },
  {
    id: 4,
    name: "PMKVY PwD Training",
    description: "Pradhan Mantri Kaushal Vikas Yojana provides free vocational skill training courses specifically designed for PwD job seekers across multiple industry sectors.",
    eligibility: "Disability certificate holder, seeking skill-based employment.",
    link: "https://www.pmkvyofficial.org"
  },
  {
    id: 5,
    name: "NIEPMD Skill Development",
    description: "National Institute for Empowerment of Persons with Multiple Disabilities offers specialized programs, rehabilitation services, and workplace adaptation toolkits.",
    eligibility: "Persons with multiple disabilities, caregivers, or special education students.",
    link: "http://niepmd.tn.nic.in"
  },
  {
    id: 6,
    name: "PM Vishwakarma Scheme (PwD Friendly)",
    description: "Provides skill training, modern tools, and collateral-free loan support for traditional artisans and craftspeople, with specific reservations for PwD.",
    eligibility: "Artisans working in listed trades, disability accommodations supported.",
    link: "https://pmvishwakarma.gov.in"
  },
  {
    id: 7,
    name: "Scholarship for Top Class Education for Students with Disabilities",
    description: "Covers tuition fees, books, and living expenses for students pursuing post-matric or professional degrees in premier colleges.",
    eligibility: "Admission in notified premier institutions, family income < Rs. 6 LPA.",
    link: "https://scholarships.gov.in"
  },
  {
    id: 8,
    name: "CBR Scheme (Community Based Rehabilitation)",
    description: "Provides local rehabilitation services, assistive device repairs, and job referrals in local districts to help individuals with disabilities join the workforce.",
    eligibility: "Persons with disabilities residing in rural and underserved districts.",
    link: "https://disabilityaffairs.gov.in"
  },
  {
    id: 9,
    name: "SIPDA Scheme",
    description: "Scheme for Implementation of Persons with Disabilities Act supports setting up barrier-free spaces, accessible state offices, and special skill cells.",
    eligibility: "State organizations and NGOs supporting PwD job seekers.",
    link: "https://disabilityaffairs.gov.in"
  },
  {
    id: 10,
    name: "National Awards for Empowerment of PwDs",
    description: "Recognizes outstanding achievements of individuals with disabilities, and employers offering exemplary accessibility standards.",
    eligibility: "PwDs with achievements or organizations offering outstanding placement/career paths for PwD.",
    link: "https://disabilityaffairs.gov.in"
  }
];

// Initialize Groq client (OpenAI-compatible)
let openai;
if (process.env.GROQ_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });
}

// Fallback logic for match-jobs (retained for reference, no longer called by matchJobs)
const fallbackMatchJobs = (profile, jobs) => {
  return jobs.map(job => {
    let score = 50; // Base score
    const reasons = [];

    // 1. Preferred Work Type match
    if (profile.preferredWorkType && job.workType) {
      if (profile.preferredWorkType === job.workType) {
        score += 15;
        reasons.push(`Matches preferred work style: ${job.workType}.`);
      } else {
        score -= 5;
      }
    }

    // 2. Skills Match
    const seekerSkills = (profile.skills || []).map(s => s.toLowerCase());
    const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());
    if (jobSkills.length > 0) {
      const matched = jobSkills.filter(s => seekerSkills.includes(s));
      const ratio = matched.length / jobSkills.length;
      score += Math.round(ratio * 25);
      if (matched.length > 0) {
        reasons.push(`Matches your skills: ${matched.join(', ')}.`);
      }
    }

    // 3. Accessibility matching
    const features = job.accessibilityFeatures || {};
    const disType = (profile.disabilityType || '').toLowerCase();
    
    if (disType === 'visual') {
      if (features.screenReaderCompatible) {
        score += 15;
        reasons.push("Fully screen-reader compatible.");
      } else {
        score -= 10;
      }
    } else if (disType === 'mobility') {
      if (features.wheelchairAccessible) {
        score += 15;
        reasons.push("Job site is wheelchair accessible.");
      } else {
        score -= 10;
      }
    } else if (disType === 'hearing') {
      if (features.signLanguageSupport) {
        score += 15;
        reasons.push("Sign language support available.");
      }
    }

    if (features.flexibleHours) {
      score += 5;
      reasons.push("Offers flexible schedules.");
    }
    if (features.workFromHome) {
      score += 5;
      reasons.push("Offers Work From Home options.");
    }

    score = Math.min(100, Math.max(0, score));

    return {
      jobId: job._id,
      matchScore: score,
      reason: reasons.length > 0 ? reasons.join(' ') : 'Good baseline alignment with your skills and preferred job properties.'
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

// ---------------------------------------------------------------------------
// Deterministic scoring helper — no AI involved
// ---------------------------------------------------------------------------
const EXPERIENCE_ORDER = ['fresher', 'junior', 'mid', 'senior'];

const calculateMatchScore = (profile, job) => {
  const requiredSkills = (job.skillsRequired || []).map(s => s.toLowerCase());
  const candidateSkills = (profile.skills || []).map(s => s.toLowerCase());

  // --- Skills (0-40) ---
  let skillScore = 0;
  let matchedSkills = [];
  let missingSkills = [];
  if (requiredSkills.length > 0) {
    matchedSkills = requiredSkills.filter(s => candidateSkills.includes(s));
    missingSkills  = requiredSkills.filter(s => !candidateSkills.includes(s));
    skillScore = (matchedSkills.length / requiredSkills.length) * 40;
  }

  // --- Work type (0-20) ---
  let workTypeScore = 0;
  let workTypeNote = '';
  const preferredWork = (profile.preferredWorkType || '').toLowerCase();
  const jobWork       = (job.workType || '').toLowerCase();
  if (preferredWork && jobWork) {
    if (preferredWork === jobWork) {
      workTypeScore = 20;
      workTypeNote  = `Work type is an exact match (${job.workType}).`;
    } else if (
      (preferredWork === 'remote' && jobWork === 'hybrid') ||
      (preferredWork === 'hybrid' && jobWork === 'remote')
    ) {
      workTypeScore = 10;
      workTypeNote  = `Partial work-type match (preferred ${profile.preferredWorkType}, job offers ${job.workType}).`;
    } else {
      workTypeScore = 0;
      workTypeNote  = `Work-type mismatch (preferred ${profile.preferredWorkType}, job offers ${job.workType}).`;
    }
  }

  // --- Accessibility (0-30) ---
  let accessibilityScore = 0;
  let accessibilityNote  = '';
  const features = job.accessibilityFeatures || {};
  const disType  = (profile.disabilityType || '').toLowerCase();

  if (disType === 'visual' && features.screenReaderCompatible) {
    accessibilityScore = 30;
    accessibilityNote  = 'Screen reader compatible for visual accessibility.';
  } else if (disType === 'mobility' && features.wheelchairAccessible) {
    accessibilityScore = 30;
    accessibilityNote  = 'Wheelchair accessible for mobility support.';
  } else if (disType === 'hearing' && features.signLanguageSupport) {
    accessibilityScore = 30;
    accessibilityNote  = 'Sign language support available.';
  } else {
    const accParts = [];
    if (features.workFromHome)   { accessibilityScore += 15; accParts.push('work from home'); }
    if (features.flexibleHours)  { accessibilityScore += 15; accParts.push('flexible hours'); }
    accessibilityScore = Math.min(30, accessibilityScore);
    accessibilityNote  = accParts.length > 0
      ? `Offers ${accParts.join(' and ')}.`
      : 'No specific accessibility features matched.';
  }

  // --- Experience (0-10) ---
  let experienceScore = 0;
  let experienceNote  = '';
  const candidateExp = (profile.experienceLevel || '').toLowerCase();
  const jobExp       = (job.experienceLevel    || '').toLowerCase();

  if (candidateExp && EXPERIENCE_ORDER.includes(candidateExp)) {
    if (jobExp && EXPERIENCE_ORDER.includes(jobExp)) {
      const diff = Math.abs(EXPERIENCE_ORDER.indexOf(candidateExp) - EXPERIENCE_ORDER.indexOf(jobExp));
      if (diff === 0) {
        experienceScore = 10;
        experienceNote  = `Experience level matches (${job.experienceLevel}).`;
      } else if (diff === 1) {
        experienceScore = 5;
        experienceNote  = `Experience level is one step off (candidate: ${profile.experienceLevel}, job: ${job.experienceLevel}).`;
      } else {
        experienceScore = 0;
        experienceNote  = `Experience level mismatch (candidate: ${profile.experienceLevel}, job: ${job.experienceLevel}).`;
      }
    } else {
      experienceScore = 5; // no job-level specified — partial credit
      experienceNote  = 'Experience level not specified for this job.';
    }
  } else {
    experienceScore = 5; // no candidate level — partial credit
    experienceNote  = 'Experience level not specified in profile.';
  }

  const score = Math.min(100, Math.max(0, Math.round(
    skillScore + workTypeScore + accessibilityScore + experienceScore
  )));

  return { score, matchedSkills, missingSkills, workTypeNote, accessibilityNote, experienceNote };
};

// ---------------------------------------------------------------------------
// JS-only templated reason — used when AI is unavailable or fails
// ---------------------------------------------------------------------------
const buildTemplatedReason = ({ matchedSkills, missingSkills, workTypeNote, accessibilityNote, experienceNote }) => {
  const parts = [];
  if (matchedSkills.length > 0) {
    parts.push(`Matches ${matchedSkills.length} skill(s): ${matchedSkills.join(', ')}.`);
  } else {
    parts.push('No required skills matched.');
  }
  if (missingSkills.length > 0) {
    parts.push(`Missing: ${missingSkills.join(', ')}.`);
  }
  if (workTypeNote)      parts.push(workTypeNote);
  if (accessibilityNote) parts.push(accessibilityNote);
  if (experienceNote)    parts.push(experienceNote);
  return parts.join(' ');
};

// POST /api/ai/match-jobs
exports.matchJobs = async (req, res, next) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ message: 'Profile data is required for matching' });
    }

    const jobs = await Job.find({ isActive: true });
    if (!jobs || jobs.length === 0) {
      return res.status(200).json({ success: true, matches: [] });
    }

    // Step 1: Compute deterministic scores for every job in JS
    const scoredJobs = jobs.map(job => ({
      job,
      ...calculateMatchScore(profile, job)
    }));

    // Step 2: If Groq is configured, ask AI to write ONE reason sentence per job
    //         based on the already-computed score data. AI must NOT change any score.
    if (openai) {
      try {
        const reasonPrompt = `
You are an inclusive hiring assistant. Scores have already been computed by a deterministic algorithm.
Your ONLY task is to write one natural, human-friendly sentence explaining each match score.
Do NOT invent or change any score. Do NOT add markdown. Do NOT include any text outside the JSON array.

CANDIDATE: disability=${profile.disabilityType || 'not specified'}, preferredWork=${profile.preferredWorkType || 'any'}, experience=${profile.experienceLevel || 'not specified'}

JOBS (with pre-computed scoring data):
${scoredJobs.map((s, i) => `
Job ${i + 1}:
- jobId: ${s.job._id}
- title: ${s.job.title} at ${s.job.company}
- matchScore: ${s.score}
- matchedSkills: ${JSON.stringify(s.matchedSkills)}
- missingSkills: ${JSON.stringify(s.missingSkills)}
- workTypeNote: ${s.workTypeNote}
- accessibilityNote: ${s.accessibilityNote}
- experienceNote: ${s.experienceNote}
`).join('')}

Return ONLY a raw JSON array — one object per job, in the same order:
[{"jobId": "<exact id>", "reason": "<one sentence>"}, ...]
`;

        const response = await openai.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: reasonPrompt }],
          temperature: 0.3
        });

        let textResponse = response.choices[0].message.content.trim();
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiReasons = JSON.parse(textResponse);

        // Build a lookup map from jobId -> AI reason
        const reasonMap = {};
        aiReasons.forEach(r => { if (r.jobId && r.reason) reasonMap[String(r.jobId)] = r.reason; });

        // Step 3: Merge AI reasons onto deterministic scores
        const matches = scoredJobs
          .map(s => ({
            jobId:      s.job._id,
            matchScore: s.score,
            reason:     reasonMap[String(s.job._id)] || buildTemplatedReason(s)
          }))
          .sort((a, b) => b.matchScore - a.matchScore);

        return res.status(200).json({ success: true, matches });
      } catch (err) {
        console.warn('Groq reason generation failed, using templated reasons.', err.message);
      }
    }

    // Step 4: No AI or AI failed — use deterministic scores with templated reasons
    const matches = scoredJobs
      .map(s => ({
        jobId:      s.job._id,
        matchScore: s.score,
        reason:     buildTemplatedReason(s)
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, matches });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/check-resume
exports.checkResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ message: 'Resume text is required' });
    }

    if (openai) {
      try {
        const prompt = `
          Review this resume text from an inclusive job board candidate perspective.
          Identify areas of improvement, especially for presentation, accessibility compatibility, formatting, and highlighting assistive technology skills or accommodations.
          
          Resume Text:
          ${resumeText}

          Provide exactly 4-5 clear, actionable improvements in a JSON list format.
          Example: ["Suggestion 1", "Suggestion 2"]. Do not include markdown code block syntax.
        `;

        const response = await openai.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        });

        let textResponse = response.choices[0].message.content.trim();
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const suggestions = JSON.parse(textResponse);
        return res.status(200).json({ success: true, improvements: suggestions });
      } catch (err) {
        console.warn("OpenAI Resume Check failed. Falling back to rule-based parser.", err.message);
      }
    }

    // Rule-based fallback
    const text = resumeText.toLowerCase();
    const suggestions = [
      "Structure your resume with clear header hierarchies (Contact, Summary, Experience, Skills, Education) so screen readers can parse it efficiently.",
      "Add a 'Preferred Accommodations' or 'Assistive Tech' section if you wish to let inclusive employers know your tooling configuration.",
      "Quantify achievements in your work history (e.g., 'improved page load by 20%') instead of just listing tasks."
    ];

    if (text.length < 150) {
      suggestions.push("Your resume text seems a bit short. Add details about recent coursework, project GitHub links, or volunteer experience.");
    }
    if (!text.includes('react') && !text.includes('javascript') && !text.includes('html')) {
      suggestions.push("Explicitly list technical skills and development languages (e.g. JavaScript, HTML/CSS, Node.js) to pass applicant sorting bots.");
    }
    if (!text.includes('linkedin') && !text.includes('portfolio')) {
      suggestions.push("Incorporate clickable links to your LinkedIn profile or portfolio websites so employers can review your visual/accessible designs directly.");
    }

    res.status(200).json({ success: true, improvements: suggestions.slice(0, 5) });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/match-schemes
exports.matchSchemes = async (req, res, next) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ message: 'Profile data is required for matching schemes' });
    }

    if (openai) {
      try {
        const prompt = `
          Analyze this candidate profile and select the most relevant schemes from the following list of Indian disability government schemes:
          ${JSON.stringify(SCHEMES)}

          Candidate Profile:
          - Disability Type: ${profile.disabilityType}
          - Disability Severity: ${profile.disabilitySeverity}
          - Assistive Tech: ${JSON.stringify(profile.assistiveTech)}
          - Education Level: ${profile.education}
          - Work type preference: ${profile.preferredWorkType}

          Return a JSON array of the top 3-4 matched schemes. For each scheme, return:
          - id: The numeric scheme ID
          - name: The scheme name
          - description: Short explanation of how it helps this specific candidate
          - eligibility: Eligibility criteria
          - link: Official link

          Format your response as a raw JSON array ONLY.
        `;

        const response = await openai.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        });

        let textResponse = response.choices[0].message.content.trim();
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const matched = JSON.parse(textResponse);
        return res.status(200).json({ success: true, schemes: matched });
      } catch (err) {
        console.warn("OpenAI Scheme Match failed. Falling back to local rules matcher.", err.message);
      }
    }

    // Local rule-based matcher
    const matched = [];
    const dis = (profile.disabilityType || '').toLowerCase();
    const exp = (profile.experienceLevel || '').toLowerCase();

    // NHFDC Loan scheme is for everyone
    matched.push(SCHEMES[0]);
    // PMKVY Skill training is for everyone
    matched.push(SCHEMES[3]);

    if (['visual', 'hearing', 'mobility'].includes(dis)) {
      matched.push(SCHEMES[1]); // ADIP Assistance
    }
    if (dis === 'cognitive' || dis === 'other') {
      matched.push(SCHEMES[4]); // NIEPMD
    }
    if (exp === 'fresher' || exp === 'junior') {
      matched.push(SCHEMES[2]); // DDU-GKY Skill training
    }
    if (profile.education && profile.education.length > 5) {
      matched.push(SCHEMES[6]); // Scholarship
    }

    // fallback matching adjustments if not enough matches
    if (matched.length < 4) {
      matched.push(SCHEMES[7]); // CBR Scheme
      matched.push(SCHEMES[5]); // Vishwakarma Scheme
    }

    // Deduplicate
    const uniqueMatches = Array.from(new Map(matched.map(s => [s.id, s])).values()).slice(0, 5);

    res.status(200).json({ success: true, schemes: uniqueMatches });
  } catch (error) {
    next(error);
  }
};
