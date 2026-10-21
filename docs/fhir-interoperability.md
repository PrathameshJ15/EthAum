# HL7 FHIR R4 Interoperability Prototype Specification

**Version:** 1.0.0  
**FHIR Standard:** HL7 FHIR Release 4 (R4) — v4.0.1 (`http://hl7.org/fhir/R4/`)  
**Implementation Phase:** Phase 31  
**Lead Engineer:** Ayusha  
**Target Branch:** `feature/ehr-fhir-prototype`  

---

> [!IMPORTANT]
> **Interoperability Prototype Disclaimer:**  
> This implementation is an **interoperability prototype** designed to validate, preview, export, and stage healthcare records in standard HL7 FHIR R4 format. It does **not** claim direct production connectivity to live hospital EHR systems (such as Epic, Cerner/Oracle Health, or Allscripts) unless an authorized institutional interface engine, mutual TLS (mTLS) certificate exchange, and SMART-on-FHIR OAuth2 credentials have been verified and configured.

---

## 1. Architecture Overview

EthAum is an AI-powered international healthcare marketplace facilitating cross-border medical travel. When international patients seek care across institutions (e.g., from the UK or US to accredited surgical centers in India or Thailand), healthcare records must be portable, standardized, and cryptographically audited.

### FHIR Architecture Principles

```
  ┌─────────────────────────────────────────────────────────────┐
  │                    EthAum Patient Vault                      │
  │     (MedicalCase, MedicalRecord, Appointments, Journey)     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
┌─────────────────────────────┐             ┌─────────────────────────────┐
│     FHIR Export Pipeline    │             │   FHIR Ingestion Pipeline   │
│  - Object Access Control    │             │  - Structural Zod Validator │
│  - Consent / Perm Filtering │             │  - Staging (PENDING_REVIEW) │
│  - HL7 FHIR R4 Mapping      │             │  - Duplicate Record Guard   │
│  - HIPAA Audit Logging      │             │  - Patient-Confirmed Merge  │
└──────────────┬──────────────┘             └──────────────▲──────────────┘
               │                                           │
               ▼                                           │
  ┌─────────────────────────┐                ┌─────────────┴─────────────┐
  │    HL7 FHIR R4 Bundle   │                │   External Hospital EHR   │
  │ (application/fhir+json) ├───────────────►│  Bundle (Eleanor Vance)   │
  └─────────────────────────┘                └───────────────────────────┘
```

1. **Standardized Resource Vocabulary:** Uses official HL7 terminology systems including SNOMED CT (`http://snomed.info/sct`), LOINC (`http://loinc.org`), and HL7 v2/v3 code systems.
2. **Original Record Integrity:** Original medical documents, diagnostic imaging scans, and pathology PDFs are preserved in sovereign object storage. AI summaries provide augmented clinical intelligence but **never** replace or overwrite primary diagnostic reports.
3. **Consent & Object-Level Access Control:** Patient record sharing permissions (`rec.permissions`) are strictly evaluated. When an authorized hospital provider queries a case FHIR export, only documents explicitly shared with that provider's identifier are included in the bundle.
4. **Staging & Duplicate Detection:** External incoming records are never directly injected into active case dossiers. They enter a `PENDING_REVIEW` staging workflow where duplicate titles and filenames are detected and flagged.

---

## 2. Data Mapping Specification

The following mapping defines the translation between internal EthAum database models and standard HL7 FHIR Release 4 resources:

### 2.1 Patient Resource (`Patient`)

| EthAum Source Field | Target FHIR R4 Field | Transformation & Validation Rules | Unmappable / Preserved Fields |
| :--- | :--- | :--- | :--- |
| `case.patientId` | `Patient.id` | String ID (e.g. `pat-1`) | — |
| `case.patientId` | `Patient.identifier[0].value` | System: `https://ethaum.com/identifiers/patient` | National ID / SSN strictly omitted for privacy |
| `case.patientName` | `Patient.name[0].text` | Full official name | — |
| `case.patientName` | `Patient.name[0].family` | Extracted surname/last token | — |
| `case.patientName` | `Patient.name[0].given[]` | Given/first name tokens | — |
| `case.destinationName` | `Patient.address[0].country` | ISO 3166-1 alpha-2 code (`US`, `GB`, `IN`, `TH`) | Granular street address omitted unless provided |
| Synthetic / Profile | `Patient.gender` | FHIR enum: `male` \| `female` \| `other` \| `unknown` | — |

### 2.2 Condition Resource (`Condition`)

Represents the primary diagnosis or treatment target requiring international medical travel.

| EthAum Source Field | Target FHIR R4 Field | Transformation & Validation Rules | Clinical Coding |
| :--- | :--- | :--- | :--- |
| `case.id` | `Condition.id` | Formatted as `cond-{caseId}` | — |
| Constant | `Condition.clinicalStatus` | FHIR coding: `active` | `http://terminology.hl7.org/CodeSystem/condition-clinical` |
| Constant | `Condition.verificationStatus` | FHIR coding: `confirmed` | `http://terminology.hl7.org/CodeSystem/condition-ver-status` |
| `case.treatmentName` | `Condition.code.text` | Description of medical condition | — |
| `case.treatmentId` | `Condition.code.coding[0]` | SNOMED CT code lookup: e.g. Knee Osteoarthritis = `38362002` | `http://snomed.info/sct` |
| `case.patientId` | `Condition.subject.reference` | Relative reference: `Patient/{patientId}` | — |
| `case.createdAt` | `Condition.recordedDate` | ISO 8601 UTC timestamp | — |

### 2.3 Observation Resource (`Observation`)

Represents objective clinical findings, mechanical measurements, or vital parameters.

| EthAum Source Field | Target FHIR R4 Field | Transformation & Validation Rules | Coding System |
| :--- | :--- | :--- | :--- |
| Derived finding | `Observation.id` | Formatted as `obs-{type}-{caseId}` | — |
| Constant | `Observation.status` | `final` | — |
| Measured parameter | `Observation.code.coding` | LOINC code (e.g., `82312-0` for Mechanical axis deformity) | `http://loinc.org` |
| Clinical note | `Observation.valueString` | Quantitative or qualitative examination note | — |
| `case.patientId` | `Observation.subject.reference` | `Patient/{patientId}` | — |

### 2.4 DocumentReference Resource (`DocumentReference`)

Represents patient diagnostic files (e.g., MRI scans, CT scans, blood panels, discharge summaries).

| EthAum Source Field | Target FHIR R4 Field | Transformation & Validation Rules | Security / Privacy Rules |
| :--- | :--- | :--- | :--- |
| `record.id` | `DocumentReference.id` | Primary record identifier (e.g. `rec-1`) | — |
| Constant | `DocumentReference.status` | FHIR enum: `current` | Superseded documents flagged if archived |
| `record.category` | `DocumentReference.category` | Clinical classification coding | — |
| `record.storagePath` | `content[0].attachment.url` | Secure cloud storage endpoint | Storage secrets/keys never exposed |
| `record.type` / mime | `content[0].attachment.contentType` | Standard MIME type (e.g. `application/pdf`, `image/jpeg`) | — |
| `record.name` | `content[0].attachment.title` | Full original file name with extension | Preserves original scan file identity |
| Constant | `securityLabel[0].code` | Confidentiality: `R` (Restricted) | `http://terminology.hl7.org/CodeSystem/v3-Confidentiality` |

### 2.5 DiagnosticReport Resource (`DiagnosticReport`)

Represents structured clinical interpretations and radiologist/physician reports for diagnostic studies.

| EthAum Source Field | Target FHIR R4 Field | Transformation & Validation Rules | Integrity Rules |
| :--- | :--- | :--- | :--- |
| `record.id` | `DiagnosticReport.id` | Formatted as `diag-{recordId}` | — |
| Constant | `DiagnosticReport.status` | `final` | — |
| `record.category` | `DiagnosticReport.category[0].code` | `RAD` for Radiology, `LAB` for Laboratory | `http://terminology.hl7.org/CodeSystem/v2-0074` |
| `record.aiSummary` | `DiagnosticReport.conclusion` | Document intelligence summary | Augmented summary clearly attributed |
| `record.storagePath` | `DiagnosticReport.presentedForm[]` | Embedded attachment reference | Original file remains authoritative |

### 2.6 Encounter Resource (`Encounter`)

Represents scheduled or completed telemedicine consultations and surgical admission milestones.

| EthAum Source Field | Target FHIR R4 Field | Transformation & Validation Rules | Act Code |
| :--- | :--- | :--- | :--- |
| `appointment.id` | `Encounter.id` | Formatted as `enc-{appointmentId}` | — |
| `appointment.status` | `Encounter.status` | Mapped: `COMPLETED` → `finished`, `CANCELLED` → `cancelled`, `CONFIRMED` → `planned` | — |
| `appointment.type` | `Encounter.class.code` | Telemedicine → `VR` (Virtual), Inpatient → `AMB` (Ambulatory) | `http://terminology.hl7.org/CodeSystem/v3-ActCode` |
| `appointment.doctorName` | `Encounter.participant[0].individual.display` | Name of consulting specialist surgeon | — |
| `appointment.providerName` | `Encounter.serviceProvider.display` | Name of accredited hospital facility | — |

### 2.7 Bundle Resource (`Bundle`)

Container resource grouping all patient case records into an exportable document.

| Field | Value | Description |
| :--- | :--- | :--- |
| `resourceType` | `Bundle` | HL7 FHIR top-level container |
| `type` | `document` | Complete clinical case document |
| `timestamp` | ISO 8601 UTC | Timestamp when the bundle was compiled |
| `total` | Number | Count of contained resources |
| `entry[].fullUrl` | `urn:uuid:{resourceId}` | Standardized URN identifier |
| `entry[].resource` | Resource object | Validated FHIR R4 resource |

---

## 3. Staging & Duplicate Detection Workflow

```
[External FHIR Bundle JSON]
             │
             ▼
[POST /cases/:id/fhir/import/stage]
             │
             ├──► 1. Structural Schema Validation (Zod FHIR R4)
             │        └── If invalid: Return 422 with precise path errors
             │
             ├──► 2. Duplicate Detection
             │        └── Compares incoming DocumentReference titles against
             │            active dossier records in case (e.g. matching filenames)
             │        └── Flags matching items: { isDuplicate: true }
             │
             └──► 3. Staging Registration
                      └── Saves bundle state: { status: 'PENDING_REVIEW' }
                      └── Emits HIPAA audit log event
                               │
                               ▼
              [Clinician / Patient Review in UI]
                               │
                               ▼
           [POST /cases/:id/fhir/import/confirm]
                               │
                               ├──► Skips duplicate records
                               ├──► Ingests vetted non-duplicate records
                               ├──► Updates staging status: 'CONFIRMED'
                               └──► Adds Journey milestone event
```

---

## 4. REST API Reference

### 4.1 Validate Resource or Bundle
* **Endpoint:** `POST /api/v1/fhir/validate`
* **Auth:** Optional (diagnostic utility)
* **Response (Valid):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "isValid": true,
    "resourceType": "Bundle",
    "fhirVersion": "4.0.1 (R4)",
    "errors": [],
    "warnings": [],
    "resourceCounts": {
      "Patient": 1,
      "Condition": 1,
      "DocumentReference": 2
    }
  }
}
```

### 4.2 Retrieve Synthetic Sample Bundle
* **Endpoint:** `GET /api/v1/fhir/sample-bundle`
* **Auth:** Optional
* **Returns:** Eleanor Vance knee arthroplasty synthetic bundle with 6 verified FHIR R4 entries.

### 4.3 Preview Case FHIR Export
* **Endpoint:** `GET /api/v1/cases/:id/fhir/preview`
* **Auth:** Required (`patient`, `provider`, or `admin`)
* **Headers:** `Authorization: Bearer <token>`
* **Returns:** Resource counts, summary metrics, and interoperability prototype notice.

### 4.4 Export Case as FHIR Bundle
* **Endpoint:** `GET /api/v1/cases/:id/fhir/export`
* **Query Parameters:** `?download=true` (optional, sends `Content-Disposition: attachment`)
* **Auth:** Required
* **Response Content-Type:** `application/fhir+json`
* **Object-Level Guard:** 
  - Cross-patient access returns `403 Forbidden`.
  - Provider export automatically filters records using patient consent list (`rec.permissions.includes(providerId)`).

### 4.5 Stage FHIR Bundle Import
* **Endpoint:** `POST /api/v1/cases/:id/fhir/import/stage`
* **Auth:** Required (`patient` or `admin`)
* **Body:** Valid FHIR R4 Bundle JSON.
* **Returns:** `stagingId`, `status: "PENDING_REVIEW"`, detected resources, and duplicate warnings.

### 4.6 Confirm Staged Import
* **Endpoint:** `POST /api/v1/cases/:id/fhir/import/confirm`
* **Auth:** Required (`patient` or `admin`)
* **Body:** `{ "stagingId": "stage-..." }`
* **Returns:** Count of imported records and updated staging record.

### 4.7 View FHIR Operations History
* **Endpoint:** `GET /api/v1/cases/:id/fhir/operations`
* **Auth:** Required
* **Returns:** Chronological audit ledger of `EXPORT`, `IMPORT_STAGE`, and `IMPORT_CONFIRM` operations.

---

## 5. Security, Consent & Privacy Controls

1. **Role-Based & Object-Level Access Control:**
   - Evaluated by `verifyCaseAccess(caseId, user)`.
   - Patients can only export and import their own case records (`user.patientId === case.patientId`).
   - Unauthorized cross-patient access returns `403 Forbidden` (`FORBIDDEN`).
2. **Patient-Controlled Record Consent:**
   - When an export is requested by a hospital provider (`user.role === 'provider'`), only records where `rec.permissions` includes `user.providerId` are compiled into the exported bundle.
3. **Audit Trails:**
   - Every export and import is logged in `record_access_logs` with actor details, timestamp, and purpose.
   - Operations are appended to `journeyService` to preserve clinical event chronology.
4. **Credential Isolation:**
   - FHIR bundles contain signed, time-limited storage URLs; raw cloud storage credentials, bucket keys, and private patient contact identifiers are never exposed in exported payloads.

---

## 6. Verification & Test Evidence

### Backend Test Results (`backend/tests/fhirInteroperability.test.ts`):
```
 ✓ tests/fhirInteroperability.test.ts (17 tests) 183ms
   ✓ 1. Standalone FHIR Validation API > validates valid FHIR R4 bundle
   ✓ 1. Standalone FHIR Validation API > validates standalone Patient resource
   ✓ 1. Standalone FHIR Validation API > rejects malformed or missing resourceType (HTTP 422)
   ✓ 1. Standalone FHIR Validation API > rejects unsupported FHIR resource type
   ✓ 2. Synthetic Sample Bundle API > returns Eleanor Vance bundle
   ✓ 3. FHIR Export Preview API > rejects unauthenticated request (HTTP 401)
   ✓ 3. FHIR Export Preview API > rejects unauthorized cross-patient preview (HTTP 403)
   ✓ 3. FHIR Export Preview API > returns preview summary for authorized patient
   ✓ 4. FHIR Export API > exports complete FHIR R4 Bundle (application/fhir+json)
   ✓ 4. FHIR Export API > supports ?download=true with Content-Disposition
   ✓ 4. FHIR Export API > enforces consent filtering for provider export
   ✓ 4. FHIR Export API > returns 404 for non-existent case
   ✓ 5. FHIR Import Workflow > stages incoming valid bundle into PENDING_REVIEW
   ✓ 5. FHIR Import Workflow > detects duplicate records by filename
   ✓ 5. FHIR Import Workflow > confirms staged import and integrates records
   ✓ 5. FHIR Import Workflow > rejects confirming non-existent staging ID
   ✓ 6. FHIR Operations Audit Ledger > returns chronological operations history

 Test Files: 1 passed (1) | Tests: 17 passed (17)
```

### Build Status:
- Backend TypeScript Build (`npm run build --prefix backend`): **0 errors**
- Frontend Vite Build (`npm run build --prefix frontend`): **0 errors**
- Frontend Linter (`npm run lint --prefix frontend`): **0 errors**
