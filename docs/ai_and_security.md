# EthAum — AI, Privacy & Security Specification

## 1. AI Philosophy

EthAum uses AI for healthcare coordination, not clinical decision-making.

AI should reduce administrative complexity while keeping the patient and healthcare professionals in control.

## 2. Supported AI Tasks

### Document Classification

Input:
- Uploaded medical document

Output:

```json
{
  "category": "Medical Imaging",
  "document_type": "MRI",
  "date": "2026-09-12"
}
```

### Case Summary

AI summarizes:
- Requested treatment
- Available records
- Patient-provided information
- Missing information

The summary is informational and coordination-focused.

### Missing Information

AI can identify potentially missing coordination information.

Example:

```text
✓ Treatment selected
✓ MRI uploaded
✓ X-Ray uploaded
⚠ Recent consultation report missing
```

### Provider Matching Explanation

The platform calculates structured matching factors.

Possible factors:

```text
Treatment compatibility
Specialty
Budget
Destination
Availability
Accreditation/trust data
Language/preferences
```

AI explains the structured result.

It must not decide who is medically best.

## 3. AI Safety

AI must not:

- Diagnose
- Prescribe
- Recommend medication
- Decide whether surgery is necessary
- Guarantee outcomes
- Guarantee provider quality
- Replace a doctor
- Make emergency decisions

## 4. AI Disclaimer

Use:

> AI-generated information is for coordination and informational purposes and does not replace professional medical advice.

## 5. API Security

Never expose:

```text
XAI_API_KEY
SUPABASE_SERVICE_KEY
DJANGO_SECRET_KEY
```

to the frontend.

Use:

```text
React
 ↓
Django
 ↓
Grok
```

## 6. Medical Record Security

Patient controls provider access.

Example:

```text
ABC Hospital

☑ MRI
☑ Blood Report
☐ Prescription
☐ Previous History

[Grant Access]
```

## 7. Access Logging

Log:

- Who accessed the record
- Which record
- Action
- Timestamp
- Relevant device/IP metadata where legally appropriate

Example:

```text
12 Oct
Dr. Sharma viewed MRI.pdf

11 Oct
Patient granted ABC Hospital access
```

## 8. Data Handling

For production:

- Encrypt data in transit
- Encrypt stored medical documents
- Restrict database access
- Apply least privilege
- Validate uploads
- Limit file size
- Scan files where appropriate
- Log sensitive actions
- Implement account/data export and deletion workflows
- Conduct jurisdiction-specific legal and regulatory review

## 9. Consent

Consent should be explicit and understandable.

Do not hide medical-record sharing behind generic terms.

## 10. Emergency Handling

If user input suggests an emergency, the platform should not attempt diagnosis.

Show:

> If this may be an emergency, contact your local emergency service or seek immediate local medical care.

## 11. Production Note

The hackathon MVP can demonstrate privacy and access-control concepts, but production healthcare deployment requires formal legal, privacy, security and regulatory review.
