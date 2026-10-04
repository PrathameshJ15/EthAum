import { Doctor } from '../types/index.js'

const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'dr-vikram-oberoi',
    providerId: 'apex-joint-delhi',
    name: 'Dr. Vikram Oberoi, MS, FRCS',
    title: 'Chief of Robotic Joint Reconstruction',
    specialty: 'Adult Knee & Hip Reconstruction',
    experienceYears: 24,
    education: 'AIIMS New Delhi · Fellowship Royal College of Surgeons (Edinburgh)',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dr-ananya-sharma',
    providerId: 'apex-joint-delhi',
    name: 'Dr. Ananya Sharma, MD, DNB',
    title: 'Director of Orthopedic Anesthesiology & Pain Medicine',
    specialty: 'Ultrasound-Guided Regional Nerve Blocks',
    experienceYears: 18,
    education: 'King Edward Memorial Hospital · Fellowship Toronto General (Canada)',
    image: 'https://images.unsplash.com/photo-1594824813583-42be00a6e031?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dr-mehmet-yilmaz',
    providerId: 'acibadem-heart-istanbul',
    name: 'Dr. Mehmet Yilmaz, MD, FEBCTS',
    title: 'Head of Adult Cardiac Surgery',
    specialty: 'Minimally Invasive Aortic & Coronary Interventions',
    experienceYears: 23,
    education: 'Istanbul University Cerrahpasa · Fellowship Zurich University Hospital',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dr-carlos-navarro',
    providerId: 'medica-sur-mexico',
    name: 'Dr. Carlos Navarro, MD',
    title: 'Director of Adult Orthopedic Surgery',
    specialty: 'Direct Anterior Hip & Robotic Knee Arthroplasty',
    experienceYears: 22,
    education: 'UNAM School of Medicine · Fellowship Hospital for Special Surgery NYC (USA)',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dr-somchai-prasert',
    providerId: 'bumrungrad-partner-bangkok',
    name: 'Dr. Somchai Prasert, MD, FICS',
    title: 'Senior Cardiovascular Surgeon',
    specialty: 'Beating Heart Off-Pump Coronary Bypass & Valve Repair',
    experienceYears: 26,
    education: 'Chulalongkorn University · Fellowship Cleveland Clinic (USA)',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-01-01T00:00:00Z',
  },
]

export const doctorService = {
  async listDoctors(filters?: { providerId?: string; specialty?: string }): Promise<Doctor[]> {
    let result = [...MOCK_DOCTORS]
    if (filters?.providerId) {
      result = result.filter((d) => d.providerId === filters.providerId)
    }
    if (filters?.specialty) {
      result = result.filter((d) =>
        d.specialty.toLowerCase().includes(filters.specialty!.toLowerCase())
      )
    }
    return result
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    const d = MOCK_DOCTORS.find((item) => item.id === id)
    return d || null
  },
}
