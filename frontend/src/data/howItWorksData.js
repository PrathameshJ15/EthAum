// Interactive How It Works steps for EthAum journey
export const HOW_IT_WORKS_STEPS = [
  {
    stepNumber: 1,
    id: 'discover',
    title: 'Discover Treatment Options',
    subtitle: 'Transparent procedures, realistic global pricing & verified destinations',
    description:
      'Search across accredited international hospital centers. Compare clinical specialties, standard length of hospital stay, travel requirements, and typical cost savings (60%–85% compared to North America and private UK hospitals).',
    badge: 'Step 1 · Explore',
    iconName: 'Search',
    highlight: 'Zero hidden fees or algorithmic markups',
    details: [
      'Over 40 complex surgical and elective procedures',
      'Benchmark price ranges for JCI-accredited facilities',
      'Realistic destination travel times and visa policies',
    ],
    demoPreview: {
      tag: 'Discovery Search',
      title: 'Robotic Knee Replacement',
      meta: 'India · Thailand · Mexico',
      value: 'From $6,500 USD',
    },
  },
  {
    stepNumber: 2,
    id: 'create-case',
    title: 'Create Your Medical Case',
    subtitle: 'One single digital health dossier that you control',
    description:
      'The Medical Case is the heart of EthAum. Instead of filling out fragmented hospital forms and repeating your history to dozens of agents, you create a private, patient-owned Case file once.',
    badge: 'Step 2 · Patient Case',
    iconName: 'FolderPlus',
    highlight: 'You own your records; not the platform or brokers',
    details: [
      'Document your primary symptoms and medical goals',
      'State preferred travel timeframes and budget boundaries',
      'Designate companions or family members with viewing access',
    ],
    demoPreview: {
      tag: 'Medical Case #ET-9182',
      title: 'Orthopedic Joint Assessment',
      meta: 'Patient: Sarah J. · Age: 58',
      value: 'Status: Draft Initialized',
    },
  },
  {
    stepNumber: 3,
    id: 'upload-records',
    title: 'Upload Diagnostic Records',
    subtitle: 'Support for high-resolution DICOM scans, lab PDFs & notes',
    description:
      'Easily drag and drop existing MRI, CT, X-ray, or blood test files. Your documents are encrypted both in transit and at rest in our secure HIPAA-aligned document vault.',
    badge: 'Step 3 · Secure Vault',
    iconName: 'UploadCloud',
    highlight: 'Granular permissions: choose which hospital views which scan',
    details: [
      'Direct DICOM and PACS image viewer compatibility',
      'Automatic checksum validation and anti-virus screening',
      'Real-time access logs showing exactly when doctors inspect records',
    ],
    demoPreview: {
      tag: 'Document Vault',
      title: 'Knee_MRI_Coronal_2026.dcm',
      meta: 'Size: 18.4 MB · Format: DICOM',
      value: '✓ Verified & Encrypted',
    },
  },
  {
    stepNumber: 4,
    id: 'ai-organization',
    title: 'AI Clinical Case Synthesis',
    subtitle: 'Structuring disorganized PDFs into surgical coordination summaries',
    description:
      'Our backend AI service (powered by Grok) structures messy diagnostic reports into a normalized clinical timeline. It highlights potentially missing prerequisites—like recent blood chemistries or operative notes—so surgeons can review your case without delay.',
    badge: 'Step 4 · AI Coordination',
    iconName: 'Sparkles',
    highlight: 'Administrative coordination only — AI never diagnoses or prescribes',
    details: [
      'Automated document classification (MRI, X-ray, Pathology, Prescription)',
      'Identification of missing clinical pre-requisites',
      'Synthesized briefing packet for Chief Medical Officers',
    ],
    demoPreview: {
      tag: 'AI Coordination Summary',
      title: 'Grok Case Briefing Ready',
      meta: 'Identified: Grade IV Chondral Loss',
      value: '⚠ Advisory: Pre-op ECG recommended',
    },
  },
  {
    stepNumber: 5,
    id: 'provider-matching',
    title: 'Accredited Provider Matching',
    subtitle: 'Matching based on clinical specialty, hospital volume & preferences',
    description:
      'EthAum calculates an objective compatibility score matching your clinical requirements with verified hospital centers that specialize in your exact procedure, languages, and travel constraints.',
    badge: 'Step 5 · Matching',
    iconName: 'Building2',
    highlight: 'Objective clinical compatibility score, not paid advertisements',
    details: [
      'Hospital annual procedure volume benchmarks',
      'Surgeon fellowship credentials & complication rates',
      'Direct availability matching your scheduled vacation or leave',
    ],
    demoPreview: {
      tag: 'Matched Quaternary Center',
      title: 'Apex Orthopedic & Joint Institute',
      meta: 'JCI Accredited · 15,000+ Robotic Surgeries',
      value: '98% Compatibility Score',
    },
  },
  {
    stepNumber: 6,
    id: 'compare-quotes',
    title: 'Compare Transparent Quotes',
    subtitle: 'Side-by-side normalized quotes with itemized inclusions',
    description:
      'Receive official institutional quotes from participating hospitals. Compare room categories, surgical fees, implant manufacturers, and included physical therapy side-by-side with zero hidden extras.',
    badge: 'Step 6 · Transparent Pricing',
    iconName: 'Receipt',
    highlight: 'Clear itemization: know exactly what is included vs excluded',
    details: [
      'Standardized item breakdown across all hospital quotes',
      'Direct institutional rates without broker markups',
      'Guaranteed pricing protection for 60 days',
    ],
    demoPreview: {
      tag: 'Quote Comparison',
      title: 'All-Inclusive Surgical Package',
      meta: 'Hospital Stay: 4 Nights · Stryker Mako',
      value: '$6,500 USD (All-in)',
    },
  },
  {
    stepNumber: 7,
    id: 'consultation',
    title: 'Direct Tele-Consultation',
    subtitle: 'Encrypted video call directly with your operating surgeon',
    description:
      'Meet your lead surgeon face-to-face over secure high-definition video before booking travel. Discuss surgical approach, implant choices, anesthesia type, and your personal recovery expectations.',
    badge: 'Step 7 · Video Consult',
    iconName: 'Video',
    highlight: 'Speak directly with the doctor who will perform your surgery',
    details: [
      '30-minute dedicated consultation slot',
      'Live screen sharing of your 3D MRI scans with the surgeon',
      'Dedicated medical interpreter on the call if needed',
    ],
    demoPreview: {
      tag: 'Telehealth Session',
      title: 'Consult with Dr. Vikram Oberoi',
      meta: 'Scheduled: Tomorrow, 2:00 PM EST',
      value: '✓ Confirmed on Calendar',
    },
  },
  {
    stepNumber: 8,
    id: 'treatment-aftercare',
    title: 'Treatment Booking & Aftercare',
    subtitle: 'Arrival concierge, inpatient care, and coordinated home recovery',
    description:
      'From VIP airport pickup and hospital check-in to in-country physiotherapy and tele-rehab when you return home, EthAum tracks your entire journey with milestone check-ins and digital handovers to your local doctor.',
    badge: 'Step 8 · Full Journey Care',
    iconName: 'HeartHandshake',
    highlight: 'Continuous post-discharge tracking and milestone check-ins',
    details: [
      'Private airport transfers & companion lodging coordination',
      'Daily in-hospital concierge check-ins',
      'Post-operative digital rehabilitation tracker for 6 months',
    ],
    demoPreview: {
      tag: 'Journey Tracker',
      title: 'Discharged & Traveling Home',
      meta: 'Fit-To-Fly Certificate Issued',
      value: 'Aftercare Milestones: Active',
    },
  },
]
