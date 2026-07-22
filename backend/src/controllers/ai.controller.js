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

// Fallback logic for match-jobs
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

    // If OpenAI is configured and available
    if (openai) {
      try {
        const prompt = `
You are an expert inclusive hiring assistant. Your job is to accurately score how well a job seeker matches each job listing based on skills, accessibility needs, and work preferences.

CANDIDATE PROFILE:
- Skills: ${JSON.stringify(profile.skills || [])}
- Preferred Work Type: ${profile.preferredWorkType || 'any'}
- Disability Type: ${profile.disabilityType || 'not specified'}
- Assistive Technologies Used: ${JSON.stringify(profile.assistiveTech || [])}
- Experience Level: ${profile.experienceLevel || 'not specified'}
- Accommodations Needed: ${profile.accommodationsNeeded || 'none specified'}
- Bio/Headline: ${profile.headline || ''} ${profile.bio || ''}

JOBS TO EVALUATE:
${jobs.map((j, i) => `
Job ${i + 1}:
- ID: ${j._id}
- Title: ${j.title}
- Company: ${j.company}
- Required Skills: ${JSON.stringify(j.skillsRequired || [])}
- Work Type: ${j.workType}
- Job Type: ${j.jobType}
- Accessibility Features: wheelchair=${j.accessibilityFeatures?.wheelchairAccessible}, screenReader=${j.accessibilityFeatures?.screenReaderCompatible}, flexibleHours=${j.accessibilityFeatures?.flexibleHours}, wfh=${j.accessibilityFeatures?.workFromHome}, signLanguage=${j.accessibilityFeatures?.signLanguageSupport}, assistiveTech=${j.accessibilityFeatures?.assistiveTechProvided}
- Description: ${(j.description || '').slice(0, 200)}
`).join('\n')}

SCORING RULES (apply strictly):
1. Skills match (0-40 points): Count how many required skills the candidate has. Score = (matched skills / total required skills) * 40. If candidate has NO matching skills, score must be below 30.
2. Work type match (0-20 points): exact match = 20, remote vs hybrid = 10, complete mismatch = 0.
3. Accessibility match (0-30 points): For visual disability, screenReader=true gives 30. For mobility, wheelchair=true gives 30. For hearing, signLanguage=true gives 30. workFromHome or flexibleHours gives 15 each (max 30). No relevant features = 0.
4. Experience match (0-10 points): fresher=entry level, junior=junior, mid=mid, senior=senior. Matching level = 10, one level off = 5, two+ levels off = 0.

STRICT RULES:
- A job with 0 skill matches AND wrong work type MUST score below 25.
- A job with 3+ skill matches AND correct work type MUST score above 65.
- Be precise, not generous. Scores should reflect real compatibility.
- Reason must mention specific matched/missing skills by name.

Return ONLY a raw JSON array, no markdown, no explanation:
[{"jobId": "exact_id_here", "matchScore": 72, "reason": "Matches 3/4 required skills (React, Node.js, MongoDB). Remote work aligns with preference. Screen reader compatible for visual accessibility."}, ...]
`;

        const response = await openai.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1
        });

        let textResponse = response.choices[0].message.content.trim();
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const matches = JSON.parse(textResponse);
        return res.status(200).json({ success: true, matches });
      } catch (err) {
        console.warn("OpenAI Job Match failed. Falling back to local rules matcher.", err.message);
      }
    }

    // Fallback rule matcher
    const matches = fallbackMatchJobs(profile, jobs);
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
