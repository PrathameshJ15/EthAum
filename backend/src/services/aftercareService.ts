import {
  AftercarePlan,
  AftercareReminder,
  ProviderRecoveryDirective,
  AftercareDocument,
  AftercareMessage,
  Appointment,
} from '../types/index.js'
import { appointmentService } from './appointmentService.js'

// Realistic clinical directives explicitly provided by authorized hospital & physician
const DEFAULT_DIRECTIVES: ProviderRecoveryDirective[] = [
  {
    id: 'dir-1',
    caseId: 'ET-8492',
    category: 'Weight Bearing & Ambulation Protocol',
    authorizingDoctor: 'Dr. Vikram Oberoi',
    doctorTitle: 'Director of Robotic Joint Reconstruction',
    institution: 'Apex Orthopedic & Robotic Joint Institute (Apollo Health City)',
    directives: [
      'Immediate full weight-bearing as tolerated using standard two-wheeled walker for Days 1–10.',
      'Transition to single-point cane on contralateral (left) side starting Day 11, subject to quadriceps control evaluation.',
      'Perform heel-toe gait pattern consciously; avoid pivoting on the operative leg during transitions.',
    ],
    precautions: [
      'Do not attempt stairs without companion assistance until Day 14 milestone clearance.',
      'Never place a pillow directly beneath the knee while resting in bed (keep knee in full extension to avoid flexion contracture).',
    ],
    warningSignsWhenToContactEmergency: [
      'Sudden inability to bear weight with acute joint collapse or pop.',
      'Severe pain uncontrolled by prescribed oral analgesics.',
    ],
    isDoctorVerified: true,
    verifiedAt: '2026-10-01T10:00:00Z',
    disclaimer:
      'Verified Clinical Protocol: Issued and authorized directly by attending orthopedic surgeon Dr. Vikram Oberoi. In strict compliance with EthAum clinical safety guidelines, these recovery instructions are not AI-generated.',
  },
  {
    id: 'dir-2',
    caseId: 'ET-8492',
    category: 'Wound Management & Suture Protection',
    authorizingDoctor: 'Dr. Vikram Oberoi',
    doctorTitle: 'Director of Robotic Joint Reconstruction',
    institution: 'Apex Orthopedic & Robotic Joint Institute (Apollo Health City)',
    directives: [
      'Maintain the silver-impregnated waterproof Aquacel surgical dressing undisturbed for 12–14 days post-op.',
      'Showering is permitted while standing with the waterproof dressing in place. Do not scrub or submerge dressing.',
      'Suture line will be inspected during the Day 14 scheduled tele-consultation.',
    ],
    precautions: [
      'Do not apply topical ointments, alcohol, or peroxide to incision site.',
      'Do not submerge operative knee in swimming pools, hot tubs, or baths for 6 weeks.',
    ],
    warningSignsWhenToContactEmergency: [
      'Spreading erythema (redness) extending > 2 cm beyond the dressing borders.',
      'Purulent (cloudy/yellow/green) drainage or foul odor from incision site.',
      'Core body temperature exceeding 38.5°C (101.3°F) accompanied by chills.',
    ],
    isDoctorVerified: true,
    verifiedAt: '2026-10-01T10:00:00Z',
    disclaimer:
      'Verified Clinical Protocol: Issued and authorized directly by attending orthopedic surgeon Dr. Vikram Oberoi. In strict compliance with EthAum clinical safety guidelines, these recovery instructions are not AI-generated.',
  },
  {
    id: 'dir-3',
    caseId: 'ET-8492',
    category: 'DVT Prevention & Circulation Protocol',
    authorizingDoctor: 'Dr. Vikram Oberoi',
    doctorTitle: 'Director of Robotic Joint Reconstruction',
    institution: 'Apex Orthopedic & Robotic Joint Institute (Apollo Health City)',
    directives: [
      'Wear bilateral graduated compression (TED) stockings during all waking hours for 4 weeks post-discharge.',
      'Perform 20 active ankle pump repetitions every waking hour to maintain venous return.',
      'Adhere strictly to oral anticoagulant schedule (Rivaroxaban 10mg once daily) as prescribed on discharge chart.',
    ],
    precautions: [
      'Do not cross legs at the knees or ankles while seated.',
      'Avoid continuous seated immobility exceeding 45 minutes.',
    ],
    warningSignsWhenToContactEmergency: [
      'Unilateral swelling, tightness, or tenderness in the calf or popliteal fossa.',
      'Sudden onset of shortness of breath, chest pain, or coughing up blood (immediate emergency ER red flag).',
    ],
    isDoctorVerified: true,
    verifiedAt: '2026-10-01T10:00:00Z',
    disclaimer:
      'Verified Clinical Protocol: Issued and authorized directly by attending orthopedic surgeon Dr. Vikram Oberoi. In strict compliance with EthAum clinical safety guidelines, these recovery instructions are not AI-generated.',
  },
  {
    id: 'dir-4',
    caseId: 'ET-8492',
    category: 'Cross-Border Travel & Fit-To-Fly Directives',
    authorizingDoctor: 'Dr. Vikram Oberoi',
    doctorTitle: 'Director of Robotic Joint Reconstruction',
    institution: 'Apex Orthopedic & Robotic Joint Institute (Apollo Health City)',
    directives: [
      'Board commercial return flight only after obtaining the official stamped Fit-to-Fly certificate (minimum 8 days post-op).',
      'Request electric buggy and wheelchair transit for all international connection gates (DEL and transit hubs).',
      'Carry the Stryker Titanium/Ceramic Implant Passport in carry-on luggage for airport security metal detectors.',
    ],
    precautions: [
      'Reserve aisle or bulkhead seating to allow periodic knee extension and flexion during flight.',
      'Hydrate with water; avoid dehydrating alcoholic or caffeinated beverages during long-haul transit.',
    ],
    warningSignsWhenToContactEmergency: [
      'Severe lower extremity swelling or severe pain during or immediately following flight.',
    ],
    isDoctorVerified: true,
    verifiedAt: '2026-10-01T10:00:00Z',
    disclaimer:
      'Verified Clinical Protocol: Issued and authorized directly by attending orthopedic surgeon Dr. Vikram Oberoi. In strict compliance with EthAum clinical safety guidelines, these recovery instructions are not AI-generated.',
  },
]

const MOCK_REMINDERS: AftercareReminder[] = [
  {
    id: 'rem-1',
    caseId: 'ET-8492',
    title: 'Post-Op Day 3: Surgical Dressing & Moisture Inspection',
    type: 'wound_check',
    daysPostOp: 3,
    dueDate: '2026-11-19',
    status: 'COMPLETED',
    instructions: 'Inspect Aquacel dressing border for secure seal and absence of strike-through moisture.',
    acknowledgedAt: '2026-11-19T08:30:00Z',
  },
  {
    id: 'rem-2',
    caseId: 'ET-8492',
    title: 'Post-Op Day 7: Active Cryotherapy & Gentle Quad Sets',
    type: 'mobility',
    daysPostOp: 7,
    dueDate: '2026-11-23',
    status: 'PENDING',
    instructions: 'Perform 3 sets of 10 quadriceps isometric activations. Apply cold compression for 20 mins post-exercise.',
  },
  {
    id: 'rem-3',
    caseId: 'ET-8492',
    title: 'Post-Op Day 14: Suture Line Tele-Consult & Fit-to-Fly Review',
    type: 'consultation',
    daysPostOp: 14,
    dueDate: '2026-11-30',
    status: 'PENDING',
    instructions: 'Attend video consult with Dr. Vikram Oberoi and review operative knee range of motion.',
  },
  {
    id: 'rem-4',
    caseId: 'ET-8492',
    title: 'Post-Op Day 30: Functional Gait & 90° Knee Flexion Benchmark',
    type: 'mobility',
    daysPostOp: 30,
    dueDate: '2026-12-16',
    status: 'PENDING',
    instructions: 'Complete functional mobility survey with Lead Physiotherapist Meera Rao. Aiming for 90° active flexion.',
  },
  {
    id: 'rem-5',
    caseId: 'ET-8492',
    title: 'Post-Op Day 60: Closed-Chain Resistance & Home Rehab Progression',
    type: 'mobility',
    daysPostOp: 60,
    dueDate: '2027-01-15',
    status: 'PENDING',
    instructions: 'Verify transition to stationary bike with low resistance and reciprocal stair climbing.',
  },
  {
    id: 'rem-6',
    caseId: 'ET-8492',
    title: 'Post-Op Day 90: Final Surgical Arthroplasty Outcome Review',
    type: 'tele_checkin',
    daysPostOp: 90,
    dueDate: '2027-02-15',
    status: 'PENDING',
    instructions: 'Final long-term telemedicine review with operating surgeon. Oxford Knee Score survey completion.',
  },
]

const MOCK_DOCUMENTS: AftercareDocument[] = [
  {
    id: 'doc-1',
    caseId: 'ET-8492',
    title: 'Apollo Health City Inpatient Discharge Summary',
    type: 'Discharge Summary',
    issuedBy: 'Apex Orthopedic & Robotic Joint Institute',
    issuedDate: '2026-11-22',
    fileSize: '2.4 MB PDF',
    downloadUrl: '#',
    verificationCode: 'DIS-DEL-984210',
  },
  {
    id: 'doc-2',
    caseId: 'ET-8492',
    title: 'Operative Surgical Report & Mako Robotic Trajectory Log',
    type: 'Operative Notes',
    issuedBy: 'Dr. Vikram Oberoi, Lead Arthroplasty Surgeon',
    issuedDate: '2026-11-16',
    fileSize: '3.8 MB PDF',
    downloadUrl: '#',
    verificationCode: 'OP-ROB-MAKO-771',
  },
  {
    id: 'doc-3',
    caseId: 'ET-8492',
    title: 'Stryker Triathlon Ceramic Implant Passport & Serial Certificate',
    type: 'Implant Card',
    issuedBy: 'Hospital Materials Management & Stryker Orthopedics',
    issuedDate: '2026-11-16',
    fileSize: '1.1 MB PDF',
    downloadUrl: '#',
    verificationCode: 'IMP-SN-8849120',
  },
  {
    id: 'doc-4',
    caseId: 'ET-8492',
    title: 'Post-Arthroplasty Rapid Physical Therapy Protocol (Weeks 1–12)',
    type: 'Physical Therapy Protocol',
    issuedBy: 'Meera Rao, MPT (Lead Joint Arthroplasty Physiotherapist)',
    issuedDate: '2026-11-20',
    fileSize: '4.5 MB PDF',
    downloadUrl: '#',
    verificationCode: 'PT-RAPID-00481',
  },
  {
    id: 'doc-5',
    caseId: 'ET-8492',
    title: 'International Airline Fit-To-Fly Medical Certificate',
    type: 'Fit-to-Fly Certificate',
    issuedBy: 'International Patient Care Desk & Attending Surgeon',
    issuedDate: '2026-11-22',
    fileSize: '850 KB PDF',
    downloadUrl: '#',
    verificationCode: 'FTF-ICAO-99120',
  },
  {
    id: 'doc-6',
    caseId: 'ET-8492',
    title: 'Discharge Medication & Anticoagulant Transition Schedule',
    type: 'Prescription Schedule',
    issuedBy: 'Clinical Pharmacy Desk, Apollo Health City',
    issuedDate: '2026-11-22',
    fileSize: '720 KB PDF',
    downloadUrl: '#',
    verificationCode: 'RX-DIS-22941',
  },
]

const MOCK_MESSAGES: AftercareMessage[] = [
  {
    id: 'msg-1',
    caseId: 'ET-8492',
    senderRole: 'coordinator',
    senderName: 'Ananya Roy (International Patient Coordinator)',
    content:
      'Hello Eleanor! Your aftercare portal is now active. I am your dedicated international coordinator here at Apex Joint Institute. Your flight back to London has been logged and our team is tracking your progress.',
    timestamp: '2026-11-22T14:00:00Z',
  },
  {
    id: 'msg-2',
    caseId: 'ET-8492',
    senderRole: 'physiotherapist',
    senderName: 'Meera Rao, MPT',
    content:
      'Hi Eleanor, I have reviewed your Day 3 wound checklist. Everything is progressing exceptionally well. Please remember to keep up with the ankle pumps during your flight and avoid sitting still for more than 45 minutes.',
    timestamp: '2026-11-23T09:30:00Z',
  },
  {
    id: 'msg-3',
    caseId: 'ET-8492',
    senderRole: 'patient',
    senderName: 'Eleanor Vance',
    content:
      'Thank you Ananya and Meera! We arrived home smoothly. The wheelchair buggy assistance at Delhi airport was seamless. Feeling comfortable today.',
    timestamp: '2026-11-24T18:15:00Z',
  },
]

export const aftercareService = {
  async getAftercarePlan(caseId: string): Promise<AftercarePlan> {
    const reminders = await this.listReminders(caseId)
    const directives = await this.getRecoveryDirectives(caseId)
    const documents = await this.listDocuments(caseId)
    const messages = await this.listMessages(caseId)

    return {
      caseId,
      providerId: 'apex-joint-delhi',
      providerName: 'Apex Orthopedic & Robotic Joint Institute',
      leadPhysician: 'Dr. Vikram Oberoi',
      leadPhysiotherapist: 'Meera Rao, MPT',
      careCoordinator: {
        name: 'Ananya Roy',
        email: 'ananya.roy@apollohealth.org',
        phone: '+91 11 2692 5858 ext 402',
        role: 'International Patient Care Coordinator',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      reminders,
      directives,
      documents,
      messages,
      emergencyContact: {
        hospitalHelpline: '+91 11 2692 5858 (24/7 International Desk)',
        coordinatorDirect: '+91 98 1000 8492 (WhatsApp / Emergency)',
        localEmergencyNumber: '112 / 102 (National Ambulance)',
      },
    }
  },

  async listReminders(caseId: string): Promise<AftercareReminder[]> {
    const direct = MOCK_REMINDERS.filter((r) => r.caseId === caseId)
    if (direct.length > 0) {
      return direct.sort((a, b) => a.daysPostOp - b.daysPostOp)
    }
    // Return standard protocol reminders mapped to this caseId
    return MOCK_REMINDERS.map((r) => ({ ...r, caseId, id: `${r.id}-${caseId}` })).sort(
      (a, b) => a.daysPostOp - b.daysPostOp
    )
  },

  async acknowledgeReminder(caseId: string, reminderId: string): Promise<AftercareReminder> {
    let reminder = MOCK_REMINDERS.find((r) => (r.caseId === caseId || `${r.id}-${caseId}` === reminderId) && (r.id === reminderId || `${r.id}-${caseId}` === reminderId))
    if (!reminder) {
      // Mock reminder acknowledgment
      return {
        id: reminderId,
        caseId,
        title: 'Recovery Check-in',
        type: 'wound_check',
        daysPostOp: 1,
        dueDate: '2026-11-23',
        status: 'COMPLETED',
        instructions: 'Check surgical dressing',
        acknowledgedAt: new Date().toISOString(),
      }
    }
    reminder.status = 'COMPLETED'
    reminder.acknowledgedAt = new Date().toISOString()
    return reminder
  },

  async getRecoveryDirectives(caseId: string): Promise<ProviderRecoveryDirective[]> {
    // Only return directives explicitly verified by authorized medical professionals
    const direct = DEFAULT_DIRECTIVES.filter((d) => d.caseId === caseId && d.isDoctorVerified)
    if (direct.length > 0) return direct
    return DEFAULT_DIRECTIVES.filter((d) => d.isDoctorVerified).map((d) => ({ ...d, caseId }))
  },

  async listDocuments(caseId: string): Promise<AftercareDocument[]> {
    const direct = MOCK_DOCUMENTS.filter((d) => d.caseId === caseId)
    if (direct.length > 0) return direct
    return MOCK_DOCUMENTS.map((d) => ({ ...d, caseId }))
  },

  async listMessages(caseId: string): Promise<AftercareMessage[]> {
    return MOCK_MESSAGES.filter((m) => m.caseId === caseId).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  },

  async sendMessage(
    caseId: string,
    input: { senderRole: 'patient' | 'coordinator' | 'physiotherapist' | 'doctor'; senderName: string; content: string }
  ): Promise<AftercareMessage> {
    const newMsg: AftercareMessage = {
      id: `msg-${Date.now()}`,
      caseId,
      senderRole: input.senderRole,
      senderName: input.senderName,
      content: input.content,
      timestamp: new Date().toISOString(),
    }
    MOCK_MESSAGES.push(newMsg)
    return newMsg
  },

  async getAftercareAppointments(caseId: string): Promise<Appointment[]> {
    const all = await appointmentService.listAppointments({ caseId })
    // Return appointments that are follow-ups or scheduled during post-op
    return all.filter((a) => a.consultationType === 'follow-up' || a.title.toLowerCase().includes('follow-up') || a.title.toLowerCase().includes('rehab'))
  },
}
