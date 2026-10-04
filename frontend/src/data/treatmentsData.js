// Realistic fictional healthcare treatment data for EthAum marketplace
export const TREATMENTS_DATA = [
  {
    id: 'knee-replacement',
    name: 'Total Knee Replacement (TKR)',
    category: 'Orthopedics',
    shortDescription: 'Minimally invasive robotic-assisted joint resurfacing for severe osteoarthritis.',
    longDescription:
      'Total Knee Replacement is an advanced orthopedic surgical procedure that replaces damaged cartilage and bone with high-grade biocompatible titanium and polyethylene implants. EthAum partner hospitals utilize CT-guided robotic navigation systems to preserve collateral ligaments, reduce post-operative pain, and enable ambulation within 24–48 hours.',
    startingPriceUSD: 6500,
    usAvgPriceUSD: 38000,
    ukAvgPriceUSD: 18500,
    savingsPercentage: 75,
    hospitalStayDays: '3–5 days',
    recoveryTimeWeeks: '4–6 weeks',
    suitableFor: [
      'Severe osteoarthritis with daily mobility limitation',
      'Advanced rheumatoid arthritis resistant to pharmacotherapy',
      'Post-traumatic cartilage deterioration',
      'Failed conservative physical therapy and joint injections',
    ],
    image:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    topDestinationIds: ['india', 'thailand', 'mexico'],
    matchedProviderIds: ['apex-joint-delhi', 'bumrungrad-partner-bangkok', 'medica-sur-mexico'],
    journeySteps: [
      {
        title: 'Diagnostic Imaging & Case Review',
        description: 'Upload weight-bearing AP/Lateral X-rays and Coronal knee MRI for AI pre-structuring.',
      },
      {
        title: 'Robotic Pre-Op Planning',
        description: '3D anatomical modeling by orthopedic surgeon and tele-consultation.',
      },
      {
        title: 'Surgical Resurfacing & Inpatient Care',
        description: '90-minute procedure under spinal anesthesia with private recovery suite stay.',
      },
      {
        title: 'Supervised In-Country Physiotherapy',
        description: 'Daily gait training and passive motion therapy before air-travel clearance.',
      },
      {
        title: 'Digital Aftercare & Home Exercises',
        description: 'Bi-weekly tele-rehabilitation milestones coordinated with your local clinician.',
      },
    ],
    faqs: [
      {
        question: 'When is it safe to fly home after knee surgery?',
        answer:
          'Most orthopedic surgeons require patients to remain in-country for 10–14 days following surgery to complete initial wound healing and reduce deep vein thrombosis (DVT) risks during air travel. Prophylactic anticoagulation is provided.',
      },
      {
        question: 'What implant manufacturers are used by partner hospitals?',
        answer:
          'Accredited partner centers exclusively utilize FDA-approved and CE-marked implants from premier manufacturers including Stryker (Mako), Zimmer Biomet, and Smith & Nephew.',
      },
      {
        question: 'Can I perform a video consultation with the surgeon first?',
        answer:
          'Yes. Every Medical Case qualified on EthAum includes a direct 30-minute encrypted tele-consultation with the operating surgeon to review your MRI and discuss surgical approaches.',
      },
    ],
  },
  {
    id: 'cardiac-bypass',
    name: 'Coronary Artery Bypass Grafting (CABG)',
    category: 'Cardiology',
    shortDescription: 'Advanced off-pump beating-heart revascularization for multivessel coronary disease.',
    longDescription:
      'Coronary Artery Bypass Grafting restores vital blood flow to ischemic myocardium by creating biological bypass channels around obstructed coronary arteries. Partner centers specialize in beating-heart (off-pump) techniques and endoscopic vein harvesting, reducing neurological complications and accelerating recovery times.',
    startingPriceUSD: 8500,
    usAvgPriceUSD: 75000,
    ukAvgPriceUSD: 28000,
    savingsPercentage: 82,
    hospitalStayDays: '6–8 days',
    recoveryTimeWeeks: '8–12 weeks',
    suitableFor: [
      'Multivessel coronary artery disease with left main involvement',
      'Failed percutaneous coronary angioplasty / stenting',
      'Stable angina refractory to maximum medical therapy',
      'Ischemic heart disease with preserved or mildly impaired EF',
    ],
    image:
      'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80',
    topDestinationIds: ['india', 'turkey', 'thailand'],
    matchedProviderIds: ['artemis-cardiac-gurgaon', 'acibadem-heart-istanbul', 'bumrungrad-partner-bangkok'],
    journeySteps: [
      {
        title: 'Coronary Angiogram Synthesis',
        description: 'High-resolution DICOM cath-lab cine films reviewed by international cardiology panel.',
      },
      {
        title: 'Multidisciplinary Heart Team Tele-Conference',
        description: 'Comprehensive evaluation between cardiac surgeon, anesthesiologist, and patient.',
      },
      {
        title: 'Off-Pump Bypass Surgery & CCU Stay',
        description: 'Surgical grafting followed by 48-hour continuous hemodynamic cardiac monitoring.',
      },
      {
        title: 'Step-Down Cardiac Rehabilitation',
        description: 'Gradual telemetry-monitored walking and respiratory spirometry training.',
      },
      {
        title: 'Fit-To-Fly Certification & Long-Term Aftercare',
        description: 'Final transthoracic echocardiogram and synchronized digital handover to your cardiologist.',
      },
    ],
    faqs: [
      {
        question: 'How are surgical outcomes and mortality rates benchmarked?',
        answer:
          'EthAum partner cardiac centers submit outcomes to international clinical registries and maintain CABG survival benchmarks exceeding 98.8%, comparable with top quaternary academic institutions worldwide.',
      },
      {
        question: 'What is off-pump beating-heart surgery?',
        answer:
          'Off-pump bypass avoids using a heart-lung cardiopulmonary bypass machine. Specialized cardiac stabilizers steady the operating field while the heart continues pumping, lowering inflammatory risks.',
      },
    ],
  },
  {
    id: 'dental-implants-all-on-4',
    name: 'All-on-4 / Full Arch Dental Restoration',
    category: 'Dentistry',
    shortDescription: 'Immediate-load dental implant bridge restoration using 3D guided surgical templates.',
    longDescription:
      'The All-on-4 protocol permanently replaces an entire arch of missing or failing teeth with a high-strength zirconia prosthesis anchored to four strategically tilted titanium fixtures. Advanced digital smile design and CBCT 3D planning provide functional, aesthetically natural teeth within 48–72 hours.',
    startingPriceUSD: 4200,
    usAvgPriceUSD: 24000,
    ukAvgPriceUSD: 14000,
    savingsPercentage: 78,
    hospitalStayDays: 'Outpatient (5–7 days trip)',
    recoveryTimeWeeks: '1–2 weeks',
    suitableFor: [
      'Complete edentulism or failing natural dentition',
      'Advanced periodontal disease requiring full extraction',
      'Patients with moderate bone resorption seeking to avoid extensive grafting',
    ],
    image:
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80',
    topDestinationIds: ['mexico', 'turkey', 'thailand'],
    matchedProviderIds: ['medica-sur-mexico', 'acibadem-heart-istanbul', 'bumrungrad-partner-bangkok'],
    journeySteps: [
      {
        title: '3D CBCT Scan & Virtual Smile Blueprint',
        description: 'Sub-millimeter planning of implant trajectory and bone density mapping.',
      },
      {
        title: 'Guided Implant Placement',
        description: 'Minimally invasive placement under intravenous conscious sedation.',
      },
      {
        title: 'Immediate Provisional Bridge Delivery',
        description: 'Milled prototype attached within 24–48 hours for immediate aesthetics and light chewing.',
      },
      {
        title: 'Final Prosthetic Fitting & Occlusion Check',
        description: 'High-strength monolithic zirconia arch custom finished and polished.',
      },
    ],
    faqs: [
      {
        question: 'What warranties are provided on the titanium fixtures?',
        answer:
          'Partner dental centers use Nobel Biocare or Straumann titanium fixtures which carry international lifetime warranties valid with registered implantologists globally.',
      },
    ],
  },
  {
    id: 'ivf-fertility',
    name: 'IVF & Preimplantation Genetic Testing (PGT)',
    category: 'Fertility',
    shortDescription: 'Complete in-vitro fertilization cycle with blastocyst vitrification and PGT-A screening.',
    longDescription:
      'EthAum fertility centers combine state-of-the-art embryology cleanrooms, time-lapse embryo incubators (EmbryoScope), and comprehensive chromosomal screening (PGT-A) to achieve industry-leading cumulative clinical pregnancy rates for international intended parents.',
    startingPriceUSD: 4800,
    usAvgPriceUSD: 22000,
    ukAvgPriceUSD: 12500,
    savingsPercentage: 72,
    hospitalStayDays: 'Outpatient (14–18 days trip)',
    recoveryTimeWeeks: 'Immediate to 2 weeks',
    suitableFor: [
      'Unexplained subfertility or advanced maternal age',
      'Recurrent pregnancy loss or prior failed IVF transfers',
      'Male factor infertility requiring ICSI / PICSI',
      'Monogenic hereditary disease prevention (PGT-M)',
    ],
    image:
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80',
    topDestinationIds: ['thailand', 'spain', 'turkey'],
    matchedProviderIds: ['bumrungrad-partner-bangkok', 'acibadem-heart-istanbul'],
    journeySteps: [
      {
        title: 'Ovarian Reserve Profiling & Protocol Selection',
        description: 'Remote baseline hormonal evaluation and customized medication schedule.',
      },
      {
        title: 'Controlled Stimulation & Follicular Monitoring',
        description: 'Transvaginal sonography and estradiol monitoring in accredited partner suite.',
      },
      {
        title: 'Oocyte Retrieval & ICSI Fertilization',
        description: 'Painless ultrasound-guided retrieval under IV sedation with embryology processing.',
      },
      {
        title: 'Blastocyst Culture & PGT-A Genetic Biopsy',
        description: '5-day culture and next-generation sequencing for aneuploidy exclusion.',
      },
      {
        title: 'Elective Frozen Embryo Transfer (eFET)',
        description: 'Synchronized endometrial priming and precision catheter placement.',
      },
    ],
    faqs: [
      {
        question: 'Can I start hormonal stimulation in my home country?',
        answer:
          'Yes. Partner clinics coordinate pre-stimulation protocols with local OB/GYN doctors, reducing required destination travel time down to 9–10 days.',
      },
    ],
  },
  {
    id: 'hip-replacement',
    name: 'Total Hip Arthroplasty (Direct Anterior)',
    category: 'Orthopedics',
    shortDescription: 'Muscle-sparing anterior approach hip replacement allowing rapid mobility.',
    longDescription:
      'Direct Anterior Hip Replacement accesses the hip joint between natural muscle intervals without detaching tendons from the femur. This technique significantly reduces surgical trauma, minimizes post-operative dislocation risks, eliminates traditional movement restrictions, and accelerates return to active life.',
    startingPriceUSD: 7200,
    usAvgPriceUSD: 41000,
    ukAvgPriceUSD: 19500,
    savingsPercentage: 76,
    hospitalStayDays: '3–4 days',
    recoveryTimeWeeks: '3–5 weeks',
    suitableFor: [
      'Avascular necrosis (AVN) of the femoral head',
      'End-stage hip osteoarthritis',
      'Dysplastic hip deformities in young adults',
    ],
    image:
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
    topDestinationIds: ['india', 'thailand', 'mexico'],
    matchedProviderIds: ['apex-joint-delhi', 'medica-sur-mexico', 'bumrungrad-partner-bangkok'],
    journeySteps: [
      {
        title: 'Pelvic CT Scan & Bone Architecture Mapping',
        description: '3D femoral offset calculation and cup sizing.',
      },
      {
        title: 'Anterior Muscle-Sparing Surgery',
        description: 'Direct anterior approach under continuous fluoroscopic verification.',
      },
      {
        title: 'Day-1 Guided Ambulation',
        description: 'Full weight-bearing standing and walking within 12 hours of anesthesia resolution.',
      },
      {
        title: 'Travel Clearance Assessment',
        description: 'Wound check, thromboembolism ultrasound, and airline medical clearance.',
      },
    ],
    faqs: [
      {
        question: 'Why is the Direct Anterior approach preferred?',
        answer:
          'Because no muscles or tendons are cut during the procedure, recovery is typically faster with lower narcotic requirements and no post-op positional restrictions.',
      },
    ],
  },
  {
    id: 'laser-eye-surgery',
    name: 'Custom Wavefront SMILE / Femto-LASIK',
    category: 'Ophthalmology',
    shortDescription: 'Bladeless refractive corneal correction for myopia, hyperopia, and astigmatism.',
    longDescription:
      'Small Incision Lenticule Extraction (SMILE) is the latest evolution in laser refractive surgery. A femtosecond laser creates a tiny microscopic lenticule inside the intact cornea which is removed through a 2mm micro-incision, maintaining higher corneal biomechanical stability and dramatically reducing dry eye symptoms.',
    startingPriceUSD: 1800,
    usAvgPriceUSD: 5500,
    ukAvgPriceUSD: 4200,
    savingsPercentage: 65,
    hospitalStayDays: 'Outpatient (3–4 days trip)',
    recoveryTimeWeeks: '24–48 hours',
    suitableFor: [
      'Myopia from -1.00D to -10.00D with astigmatism',
      'Contact lens intolerance or active lifestyle requirements',
      'Corneal thickness parameters within safe international standards',
    ],
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    topDestinationIds: ['turkey', 'thailand', 'india'],
    matchedProviderIds: ['acibadem-heart-istanbul', 'bumrungrad-partner-bangkok'],
    journeySteps: [
      {
        title: 'Detailed Pentacam Corneal Tomography',
        description: 'Wavefront aberration mapping, pachymetry, and pupil dynamics.',
      },
      {
        title: 'Single-Step Femtosecond Laser Treatment',
        description: '25-second silent laser treatment per eye under numbing drops.',
      },
      {
        title: 'Next-Morning Slit-Lamp Confirmation',
        description: 'Visual acuity check (typically 20/20 within 24 hours) and clearance.',
      },
    ],
    faqs: [
      {
        question: 'How soon can I explore the destination city after SMILE?',
        answer:
          'Most patients enjoy normal sightseeing within 24 hours while wearing protective UV sunglasses and avoiding swimming pools or contact sports.',
      },
    ],
  },
]

export const TREATMENT_CATEGORIES = [
  'All',
  'Orthopedics',
  'Cardiology',
  'Dentistry',
  'Fertility',
  'Ophthalmology',
]
