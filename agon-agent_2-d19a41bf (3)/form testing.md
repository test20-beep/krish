## Table of Contents

### Part A — Reference
1. [Form Categories (5 types)](#1-form-categories)
2. [Field Types (11 types)](#2-field-types)
3. [Field Properties](#3-field-properties)
4. [Sections & Branching Logic](#4-sections--branching-logic)
5. [Form Settings](#5-form-settings)
6. [Share & Access Links](#6-share--access-links)
7. [Email Templates & Placeholders](#7-email-templates--placeholders)
8. [Review & Scoring](#8-review--scoring)
9. [Lifecycle: Draft → Active → Expired](#9-lifecycle)

### Part B — Test Catalogue
10. [How to Build Fields — Field-by-Field Recipe Book](#10-how-to-build-fields)
11. [Normal Form — Full Test Questions](#11-normal-form-tests)
12. [Nomination Form — Full Test Questions](#12-nomination-form-tests)
13. [Branching Form — Full Test Questions](#13-branching-form-tests)
14. [Quiz Form — Full Test Questions](#14-quiz-form-tests)
15. [Multi (Hybrid) Form — Full Test Questions](#15-multi-form-tests)
16. [Edge Cases & Stress Tests](#16-edge-cases)
17. [Admin Checklist](#17-admin-checklist)

---

# PART A — REFERENCE

## 1. Form Categories

Every form belongs to exactly **one** of these 5 categories. The category decides which extra features are unlocked.

| Category | Icon | Use it for | Unlocks |
|---|---|---|---|
| **Normal** | 📄 | Plain surveys, polls, data collection with public link | File uploads, QR code, public link |
| **Nomination** | 👥 | Principals nominate teachers who then fill the form | Per-school teacher limit, unique invite tokens, bulk email, OTP/direct login |
| **Branching** | 🌿 | Adaptive forms (e.g. Maths teacher sees only Maths Qs) | `visibleIf` on sections AND fields, IF-THEN builder |
| **Quiz** | 🏆 | MCQ auto-scoring with timer | Marks per Q, negative marking, time limit, shuffled options, auto-grade |
| **Multi** | ✨ | Hybrid: nomination + branching + quiz in one flow | All of the above, combined sequentially |

### How to pick
- Just collecting data from schools? → **Normal**
- Schools must first pick 5 teachers, then those 5 fill it? → **Nomination**
- Questions change based on a previous answer? → **Branching**
- Timed test with right/wrong answers? → **Quiz**
- Need all three? → **Multi**

---

## 2. Field Types

All 11 field types available in the drag-drop builder:

| Type | Renders as | Stores | Good for |
|---|---|---|---|
| `text` | Single-line input | string | Name, title, short answer |
| `textarea` | Multi-line input | string | Essays, descriptions, feedback |
| `number` | Number input | number | Age, count, years of experience |
| `email` | Email input w/ validation | string | Contact email |
| `phone` | Tel input | string | Mobile number |
| `date` | Date picker | ISO date string | Birthday, event date |
| `dropdown` | `<select>` | string | Pick one from many (long list) |
| `radio` | Radio group | string | Pick one from few |
| `checkbox` | Checkbox group | string[] | Pick many |
| `file` | Drag-drop upload | filename | Documents, photos |
| `mcq` | Radio + auto-score | string (option index) | Quiz questions only |

---

## 3. Field Properties

```ts
{
  id: string;            // auto-generated unique ID
  type: FieldType;       // one of the 11 above
  label: string;         // the question/label shown to users
  required?: boolean;    // red asterisk, blocks submit if empty
  placeholder?: string;  // greyed-out hint text
  maxLength?: number;    // character limit (text/textarea/email/phone)
  options?: string[];    // for dropdown/radio/checkbox/mcq

  // File fields only
  fileTypes?: string;    // e.g. "pdf,jpg,png"
  maxSizeMB?: number;    // e.g. 5

  // Quiz/MCQ fields only
  correct?: number;      // index of correct option (0-based)
  marks?: number;        // points awarded for correct answer
  negative?: number;     // points deducted on wrong answer

  // Branching only
  visibleIf?: {
    fieldId: string;     // another field's id
    op: 'eq' | 'neq';    // equals / not equals
    value: string;       // value to match
  };
}
```

---

## 4. Sections & Branching Logic

Every form has **at least one section**. Sections become the "pages" a teacher steps through, with a progress bar.

### Section-level branching
```json
{
  "id": "s2",
  "title": "Mathematics pedagogy",
  "visibleIf": { "fieldId": "subj", "op": "eq", "value": "Mathematics" },
  "fields": [ ... ]
}
```

### Field-level branching
```json
{
  "id": "f_other",
  "type": "text",
  "label": "Specify other subject",
  "visibleIf": { "fieldId": "f_subject", "op": "eq", "value": "Other" }
}
```

### Rules
- Branching fires **live** as the teacher types/selects
- Hidden sections & fields are **not validated** (required rules ignored while hidden)
- Only `dropdown`, `radio`, `checkbox`, `text` fields can drive branching

---

## 5. Form Settings

### Core
| Setting | Meaning |
|---|---|
| **Title** | Displayed on form header |
| **Description** | Short blurb below the title |
| **Starts at** | Before this, form shows "not yet open" |
| **Ends at** | After this, form shows "closed" |
| **Status** | `draft` (hidden) / `active` (live) / `expired` (read-only) |

### Nomination (nomination + multi)
| Setting | Meaning |
|---|---|
| **Max teachers per school** | Hard cap enforced in Functionary dashboard |
| **Require email / phone** | Functionary must provide these |
| **Teacher login** | `OTP required` or `Direct (no login)` |
| **Invite email template** | Pick from templates; used on bulk dispatch |

### Quiz (quiz + multi)
| Setting | Meaning |
|---|---|
| **Time limit (min)** | Auto-submits when timer hits 0 |
| **Negative marking** | On wrong MCQ, deducts `field.negative` |
| **Shuffle options** | MCQ options randomised per teacher |

---

## 6. Share & Access Links

| Pattern | Who it's for |
|---|---|
| `/form/{slug}` | Anyone (if form allows direct login) |
| `/form/{slug}/auth?sc={CODE}&token={hash}` | A nominated teacher |
| Admin Preview link | Editors; skips validation |

### Sharing options (Functionary dashboard)
- 📋 Copy personalised link · ✉️ Email · 💬 WhatsApp · 📱 QR code · 📨 Resend invite

---

## 7. Email Templates & Placeholders

| Placeholder | Replaced with |
|---|---|
| `{{teacher_name}}` | Recipient's full name |
| `{{form_link}}` | Their personalised URL |
| `{{school_code}}` | Their school code (e.g. `DPS001`) |
| `{{deadline}}` | Form's `ends_at` in local date format |

### Template types
- `teacher_invite`, `functionary_invite`, `reminder`, `announcement`

### Dispatch workflow
1. Create / edit template in **Email Templates**
2. Click **Dispatch emails** → routes to **Send Emails** tile
3. Pick audience (school heads OR teachers), form, school filter
4. Select recipients, confirm preview, hit **Send**
5. Every dispatch is logged in Audit Logs

---

## 8. Review & Scoring

### Levels
```
Level 1 "All submissions" → 8 responses → Reviewers: 1, 2, 3
   ↓ (filter: avg ≥ 80)
Level 2 "High scorers"    → 4 responses → Reviewers: 1, 2
   ↓ (filter: avg ≥ 90)
Level 3 "Finalists"       → 2 responses → Reviewer: 3
```

### Modes
- `marks` — numeric 0–100
- `grade` — A / B / C / D

### Scoring scopes
- **Question-level** — score each answer individually
- **Form-level** — one overall score + comments

### Blind review
If on, reviewer sees `Anonymous · DPS001` instead of teacher identity.

### Auto-scoring (quiz)
MCQ fields auto-score at submit:
- `marks` awarded on match with `correct`
- `negative` deducted on wrong (if negative marking on)
- Score hidden from participants, visible to admin/reviewers

---

## 9. Lifecycle

```
 ┌─ draft ──┐          ┌─ active ─┐         ┌─ expired ─┐
 │          │  publish │          │  close  │           │
 │  edit    ├─────────▶│  live    ├────────▶│ read-only │
 │ freely   │          │ responses│         │  archive  │
 └──────────┘          └──────────┘         └───────────┘
                            │
                    version bump on schema edit
                    (v1 → v2 → v3 …)
```

---

# PART B — TEST CATALOGUE

## 10. How to Build Fields

A practical recipe-book. For each field type, here's **when to use it**, **how to
configure it**, and a **ready-to-paste JSON snippet**.

### 10.1 `text` — Short single-line input

**Use when:** the answer is a name, title, code, short phrase (< 80 chars).

**Configure:** `label`, `placeholder`, `maxLength`, `required`.

**Example:** "Full name", "City", "Employee ID".

```json
{
  "id": "f_name",
  "type": "text",
  "label": "Full name (as per Aadhaar)",
  "placeholder": "e.g. Priya Sharma",
  "maxLength": 80,
  "required": true
}
```

---

### 10.2 `textarea` — Multi-line input

**Use when:** the answer is an essay, description, comment, feedback.

**Configure:** `label`, `placeholder`, `maxLength` (show counter).

**Example:** "Describe your teaching philosophy in 300 words", "Any suggestions?"

```json
{
  "id": "f_essay",
  "type": "textarea",
  "label": "Describe your three greatest classroom achievements (max 400 chars)",
  "placeholder": "Start with the most recent…",
  "maxLength": 400,
  "required": true
}
```

---

### 10.3 `number` — Numeric input

**Use when:** count, age, score, rupees, years.

**Configure:** `label`, `placeholder`.

**Example:** "Years of experience", "Number of students in class".

```json
{
  "id": "f_exp",
  "type": "number",
  "label": "Years of teaching experience",
  "placeholder": "e.g. 7",
  "required": true
}
```

---

### 10.4 `email` — Email address

**Use when:** contact/login/correspondence.

**Configure:** `label`, `placeholder`, `required`.

**Example:** "Official school email".

```json
{
  "id": "f_email",
  "type": "email",
  "label": "Official school email",
  "placeholder": "name@school.org",
  "required": true
}
```

---

### 10.5 `phone` — Phone number

**Use when:** SMS / WhatsApp / call. Accepts digits, spaces, `+`, `-`.

**Example:** "Mobile number", "Emergency contact".

```json
{
  "id": "f_phone",
  "type": "phone",
  "label": "Mobile number (with country code)",
  "placeholder": "+91 98765 43210",
  "maxLength": 15,
  "required": true
}
```

---

### 10.6 `date` — Date picker

**Use when:** birthday, event, deadline, joining date.

**Example:** "Date of joining", "DOB".

```json
{
  "id": "f_doj",
  "type": "date",
  "label": "Date of joining this school",
  "required": true
}
```

---

### 10.7 `dropdown` — Pick one (long list)

**Use when:** 5+ options, or when space is tight.

**Configure:** `options` array, `required`.

**Example:** "Subject", "Grade taught", "State".

```json
{
  "id": "f_subject",
  "type": "dropdown",
  "label": "Primary subject taught",
  "options": ["Mathematics", "Science", "English", "Social Studies",
              "Languages", "Computer Science", "Arts", "Physical Education"],
  "required": true
}
```

---

### 10.8 `radio` — Pick one (few options)

**Use when:** 2–5 options, want all visible.

**Example:** "Gender", "Yes/No", "Preferred shift".

```json
{
  "id": "f_shift",
  "type": "radio",
  "label": "Preferred shift",
  "options": ["Morning", "Afternoon", "Either"],
  "required": true
}
```

---

### 10.9 `checkbox` — Pick many

**Use when:** multiple selections allowed.

**Example:** "Facilities available", "Languages spoken", "Training attended".

```json
{
  "id": "f_facilities",
  "type": "checkbox",
  "label": "Which of these facilities does your school have? (select all)",
  "options": ["Library", "Computer lab", "Science lab",
              "Sports ground", "Auditorium", "Canteen", "Transport"],
  "required": false
}
```

---

### 10.10 `file` — File upload

**Use when:** documents, photos, certificates. Always constrain `fileTypes` and `maxSizeMB`.

**Example:** "Upload resume (PDF)", "Classroom photo".

```json
{
  "id": "f_cv",
  "type": "file",
  "label": "Upload your CV (PDF, max 5MB)",
  "fileTypes": "pdf",
  "maxSizeMB": 5,
  "required": true
}
```

---

### 10.11 `mcq` — Multiple-choice quiz question

**Use when:** Quiz or Multi forms. Auto-scored.

**Configure:** `options`, `correct` (0-based index), `marks`, optional `negative`.

**Example:** "Capital of India?"

```json
{
  "id": "q_capital",
  "type": "mcq",
  "label": "What is the capital of India?",
  "options": ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
  "correct": 1,
  "marks": 2,
  "negative": 0.5,
  "required": true
}
```

### Tips
- Keep MCQ options **roughly equal in length** (avoid giving away the answer)
- Always have **exactly one** correct option
- Mix easy & hard — recommended spread: 30% easy, 50% medium, 20% hard
- Set `negative` to ~25% of `marks` (e.g. `marks:2, negative:0.5`) for exam-grade difficulty

---

## 11. Normal Form Tests

### Scenario: Annual School Infrastructure Survey

Admin needs a snapshot of every CBSS school's facilities. Teachers or functionaries can fill it directly (no nomination, no login).

#### Test questions to include

**Section 1 — School identity**
1. `text` **School name** *(required)* — maxLength 120
2. `text` **School code** *(required)* — "e.g. DPS001"
3. `dropdown` **State** *(required)* — All 28 Indian states
4. `dropdown` **School category** *(required)* — Primary / Middle / Senior Secondary / K-12
5. `dropdown` **Board affiliation** — CBSE / ICSE / State / IB / Cambridge / Other
6. `email` **Principal email** *(required)*
7. `phone` **Office phone** *(required)*
8. `date` **Year of establishment** *(required)*
9. `number` **Total enrollment (students)** *(required)*
10. `number` **Total teaching staff** *(required)*

**Section 2 — Facilities**
11. `checkbox` **Available facilities (select all)** — Library · Computer lab · Science lab · Biology lab · Chemistry lab · Physics lab · Sports ground · Indoor games · Auditorium · Canteen · Transport · Medical room · Counsellor · CCTV · Solar power · Rainwater harvesting
12. `radio` **Is the building owned or rented?** — Owned / Rented / Leased
13. `number` **Number of classrooms**
14. `number` **Number of functional toilets (girls)**
15. `number` **Number of functional toilets (boys)**
16. `number` **Ratio of students to computers (if no lab, enter 0)**
17. `radio` **Internet availability** — Fibre / Broadband / Mobile hotspot / None
18. `number` **Download speed (Mbps, if known)**

**Section 3 — Accessibility & safety**
19. `radio` **Ramp for differently-abled access?** — Yes / No / Partial
20. `checkbox` **Safety measures** — Fire extinguishers · Smoke detectors · Emergency exits marked · First-aid kits · Regular drills · Security guard
21. `radio` **Have you conducted a fire drill in the last 6 months?** — Yes / No
22. `date` **Last fire safety audit date**

**Section 4 — Documents**
23. `file` **Upload latest school prospectus (PDF, ≤10MB)**
24. `file` **Upload a recent exterior photo of the school (JPG/PNG, ≤5MB)**
25. `file` **Upload affiliation certificate (PDF, ≤5MB)** *(required)*

**Section 5 — Feedback**
26. `textarea` **What are the top 3 infrastructural needs of your school?** — maxLength 500, required
27. `textarea` **Any best practice you'd like to share?** — maxLength 500
28. `radio` **Would you like a CBSS team to visit for advisory support?** — Yes / No / Maybe

---

## 12. Nomination Form Tests

### Scenario: Teacher Excellence Awards 2025

Each school head logs in and nominates up to **5 teachers**. Nominated teachers then receive an email with a personalised link (OTP-protected) to complete the awards form.

**Settings**
- `nomination_limit: 5`
- `require_email: true`
- `require_phone: true`
- `teacher_login: "otp"`
- `email_template_id: 1` (teacher invite)

#### Test questions to include

**Section 1 — About you**
1. `text` **Full name (as on government ID)** *(required)*
2. `email` **Personal email** *(required)*
3. `phone` **Mobile number** *(required)*
4. `date` **Date of birth** *(required)*
5. `radio` **Gender** — Female / Male / Non-binary / Prefer not to say
6. `text` **Current designation** — e.g. "PGT Mathematics"
7. `dropdown` **Highest qualification** — Diploma / B.Ed / M.Ed / M.Phil / PhD / Other
8. `number` **Total teaching experience (years)** *(required)*
9. `number` **Years at current school** *(required)*

**Section 2 — Teaching profile**
10. `dropdown` **Primary subject** *(required)* — Mathematics / Science / English / Social Studies / Languages / Computer Science / Arts / PE / Commerce / Other
11. `checkbox` **Grades you teach (select all)** — Pre-primary · 1–5 · 6–8 · 9–10 · 11–12
12. `radio` **Class teacher?** — Yes / No
13. `number` **Average class size**
14. `number` **Average students per period**

**Section 3 — Achievements**
15. `textarea` **Describe your top 3 pedagogical innovations** *(required, 600 chars)*
16. `textarea` **List awards/recognitions received in the last 5 years** — maxLength 400
17. `textarea` **Publications / research papers / articles (title + year)** — maxLength 400
18. `number` **Number of students mentored for competitions last year**
19. `textarea` **Describe one transformative student success story** — maxLength 600

**Section 4 — Community impact**
20. `checkbox` **Beyond-classroom contributions** — Olympiad coach · School magazine editor · Sports coach · Theatre/Cultural head · Eco-club · Social outreach · NCC/Scouts · Mentor teacher · Curriculum development · Parent counselling
21. `textarea` **Describe your most meaningful community contribution** — maxLength 500
22. `number` **Hours of voluntary service per month**

**Section 5 — Supporting documents**
23. `file` **Upload CV (PDF, max 5MB)** *(required)*
24. `file` **Upload 2 reference letters (PDF/DOC, max 10MB combined)**
25. `file` **Upload 1 photo (JPG/PNG, max 3MB)** *(required)*
26. `file` **Upload one lesson-plan sample (PDF, max 5MB)** — optional

**Section 6 — Declaration**
27. `checkbox` **I confirm that:** — All information is true · I have obtained my principal's consent · I agree to be contacted for an interview · I allow CBSS to use my submission for case studies
28. `text` **Digital signature (type your full name)** *(required)*
29. `date` **Date of submission** *(required)*

---

## 13. Branching Form Tests

### Scenario: Subject-wise Pedagogy Survey

A teacher first picks their subject. Only that subject's deep-dive section appears next.

#### Test questions to include

**Section 1 — Your profile** *(always visible)*
1. `text` **Full name** *(required)*
2. `dropdown` **School code** *(required)*
3. `radio` **Which is your PRIMARY subject?** *(required, drives branching)*
   - Mathematics / Science / English / Social Studies / Languages / Computer Science
4. `radio` **Do you teach additional subjects?** *(drives another branch)*
   - Yes / No

---

**Section 2 — Mathematics deep dive** *(visibleIf subj == Mathematics)*
5. `checkbox` **Which grades do you teach Maths to?** — 6 · 7 · 8 · 9 · 10 · 11 · 12
6. `checkbox` **Topics you teach most often** — Algebra · Geometry · Calculus · Probability · Statistics · Trigonometry · Number Theory
7. `radio` **Do you use manipulatives in class?** — Always / Often / Sometimes / Never
8. `textarea` **Describe your approach to teaching Grade 10 Trigonometry** — maxLength 500, required
9. `checkbox` **Digital tools used** — GeoGebra · Desmos · Khan Academy · Photomath · Wolfram Alpha · None
10. `number` **Average class-test score (out of 100) in your best section**
11. `file` **Upload a sample worksheet you designed (PDF, ≤5MB)**

---

**Section 3 — Science deep dive** *(visibleIf subj == Science)*
12. `checkbox` **Specialisation** — Physics · Chemistry · Biology · Environmental · General
13. `radio` **Lab equipment availability** — Fully equipped / Partial / Minimal / None
14. `number` **Experiments conducted per term**
15. `textarea` **Describe one memorable hands-on experiment** — maxLength 500, required
16. `checkbox` **Safety protocols you follow** — Goggles · Lab coats · MSDS review · Fire extinguisher · First-aid kit · Student briefing
17. `radio` **Field trips organised per year?** — 0 / 1 / 2 / 3+
18. `file` **Upload a lab-safety manual sample (PDF)**

---

**Section 4 — English deep dive** *(visibleIf subj == English)*
19. `radio` **Medium of instruction** — Pure English / Bilingual / English-mostly
20. `checkbox` **Literature taught** — Poetry · Drama · Novels · Short stories · Non-fiction · Graphic novels
21. `textarea` **How do you encourage reading habits?** — maxLength 500, required
22. `number` **Books in your class library**
23. `checkbox` **Writing activities** — Journaling · Creative writing · Debates · Essays · Poetry slams · Book reviews
24. `radio` **Assessment style** — Essays / MCQs / Oral / Portfolio / Mixed
25. `file` **Upload one student's creative work (with consent)**

---

**Section 5 — Social Studies deep dive** *(visibleIf subj == Social Studies)*
26. `checkbox` **Sub-subjects taught** — History · Geography · Civics · Economics · Political Science
27. `textarea` **Describe one project-based learning activity** — maxLength 500
28. `radio` **Use of maps & primary sources** — Daily / Weekly / Monthly / Rarely
29. `checkbox` **Tools used** — Google Earth · Documentaries · Role-play · Debates · Field trips · Guest speakers

---

**Section 6 — Languages deep dive** *(visibleIf subj == Languages)*
30. `checkbox` **Language(s) taught** — Hindi · Sanskrit · Tamil · Telugu · Kannada · Marathi · Bengali · Urdu · French · German · Spanish · Other
31. `text` **If "Other", specify** — *(visibleIf the "Other" checkbox is ticked)*
32. `radio` **Cultural immersion activities** — Weekly / Monthly / Term-ly / Never
33. `textarea` **How do you handle mixed-proficiency classes?** — maxLength 500

---

**Section 7 — Computer Science deep dive** *(visibleIf subj == Computer Science)*
34. `checkbox` **Languages/tools taught** — Scratch · Python · Java · C++ · JavaScript · HTML/CSS · SQL · AI basics · Blockchain basics
35. `radio` **Average systems available per student** — 1:1 / 1:2 / 1:3 / 1:5+ / No lab
36. `number` **Weekly lab hours per section**
37. `textarea` **Describe a coding project your students built** — maxLength 600
38. `checkbox` **Platforms used** — HackerRank · Codeforces · Kaggle · Google Classroom · Replit · GitHub Classroom

---

**Section 8 — Multi-subject supplement** *(visibleIf additional == Yes)*
39. `checkbox` **Additional subjects taught** — Maths · Science · English · SS · Languages · CS · Arts · PE · Commerce
40. `textarea` **How do you manage the cross-subject load?** — maxLength 400

---

**Section 9 — Wrap-up** *(always visible)*
41. `radio` **Would you recommend your pedagogy approach to peers?** — Yes / No / With modification
42. `textarea` **One thing CBSS should do to help teachers like you** — maxLength 400
43. `checkbox` **Consent to follow-up** — May we contact you for a 30-min interview? · May we share your submission with the review panel?

---

### Nested branching example
Show a follow-up text box only if the teacher picked "Other" in Q30:

```json
{
  "id": "f_other_lang",
  "type": "text",
  "label": "Please specify which other language",
  "visibleIf": { "fieldId": "f_languages", "op": "eq", "value": "Other" }
}
```

---

## 14. Quiz Form Tests

### Scenario: CBSS Teacher Subject Knowledge Quiz — Round 1

**30 MCQs · 30-minute timer · negative marking · shuffled options · auto-scored**

**Settings**
- `time_limit_min: 30`
- `negative_marking: true`
- `shuffle: true`
- `teacher_login: "otp"`

#### Test questions (correct option marked with ✓)

**Section 1 — General knowledge & pedagogy (10 Qs × 2 marks = 20 marks, negative 0.5)**

1. Who wrote the Indian national anthem?
   - Rabindranath Tagore ✓ · Bankim Chandra · Sarojini Naidu · Subhash Chandra Bose
2. The "Right to Education Act" in India guarantees free education for children aged…
   - 3–12 · 5–14 · **6–14 ✓** · 6–16
3. Which Indian city is known as the "City of Joy"?
   - Mumbai · **Kolkata ✓** · Chennai · Bangalore
4. NCERT was established in the year…
   - 1956 · 1957 · 1960 · **1961 ✓**
5. Which committee first recommended the 10+2 system in India?
   - **Kothari Commission ✓** · Mudaliar · Radhakrishnan · Sargent
6. "Multiple Intelligences" theory was proposed by…
   - Piaget · Vygotsky · **Howard Gardner ✓** · Bandura
7. The zone of proximal development is a concept by…
   - Piaget · **Vygotsky ✓** · Skinner · Bruner
8. Bloom's Taxonomy highest-order cognitive skill is…
   - Analysis · Evaluation · **Create ✓** · Remember
9. Formative assessment primarily aims to…
   - Rank students · **Improve learning ✓** · Award grades · Select for promotion
10. The medium of instruction recommended in NEP 2020 for foundational stage is…
    - English · Hindi · **Mother tongue / regional language ✓** · Sanskrit

**Section 2 — Mathematics (7 Qs × 2 = 14 marks, negative 0.5)**

11. Value of π (to 2 decimal places)?
    - 3.12 · **3.14 ✓** · 3.16 · 3.18
12. Sum of interior angles of a triangle?
    - 90° · **180° ✓** · 270° · 360°
13. √144 = ?
    - 11 · **12 ✓** · 13 · 14
14. The Pythagoras theorem applies to…
    - All triangles · **Right-angled triangles ✓** · Equilateral triangles · Obtuse triangles
15. 0.25 as a fraction in lowest terms?
    - 1/3 · **1/4 ✓** · 1/5 · 2/5
16. A prime number has exactly…
    - 1 factor · **2 factors ✓** · 3 factors · No factors
17. If a:b = 2:3 and b:c = 4:5, then a:c = ?
    - 2:5 · **8:15 ✓** · 10:15 · 3:5

**Section 3 — Science (7 Qs × 2 = 14 marks, negative 0.5)**

18. Chemical symbol for gold?
    - Go · Gd · **Au ✓** · Ag
19. Which planet is known as the Red Planet?
    - Venus · **Mars ✓** · Jupiter · Saturn
20. Largest ocean on Earth?
    - Atlantic · Indian · Arctic · **Pacific ✓**
21. The powerhouse of the cell is…
    - Nucleus · **Mitochondria ✓** · Ribosome · Chloroplast
22. Speed of light in vacuum (approx)?
    - 300,000 km/min · **300,000 km/sec ✓** · 3,000,000 km/sec · 30,000 km/sec
23. Which gas do plants absorb for photosynthesis?
    - Oxygen · **Carbon dioxide ✓** · Nitrogen · Methane
24. Newton's 2nd law: F = ?
    - m × v · **m × a ✓** · m / a · m + a

**Section 4 — English language (6 Qs × 1 = 6 marks, negative 0.25)**

25. Synonym of "arduous"?
    - Easy · **Difficult ✓** · Pleasant · Quick
26. Antonym of "benevolent"?
    - Kind · Caring · **Malevolent ✓** · Generous
27. Identify the adverb: "She sings beautifully."
    - She · sings · **beautifully ✓** · none
28. The correct plural of "datum" is…
    - datums · **data ✓** · datae · datas
29. Identify the preposition: "The book is on the table."
    - book · is · **on ✓** · table
30. A simile uses…
    - is/are · **like/as ✓** · has/have · do/does

**Total:** 54 marks · Pass mark recommendation: 60% (32/54)

### Quiz design tips in practice
- **Section weighting** — harder section → lower marks per Q but more Qs (students forgive depth-penalty more than breadth-penalty)
- **Negative marking formula** — `negative = marks × 0.25` keeps guessing at zero expected value
- **Shuffle on** — prevents answer-sharing across whatsapp groups
- **Timer** — 60s per Q for MCQ, 90s for data-interpretation, 120s if diagrams involved

---

## 15. Multi Form Tests

### Scenario: Comprehensive Teacher Evaluation 2025

Nomination → branching profile → quiz → essay — all in one form. This is the most feature-rich type.

**Settings**
- `nomination_limit: 3`
- `time_limit_min: 45`
- `shuffle: true`
- `negative_marking: true`
- `teacher_login: "otp"`
- `email_template_id: 1`

#### Test questions

**Section 1 — Identity & consent** *(always visible)*
1. `text` **Full name** *(required)*
2. `email` **Official email** *(required)*
3. `phone` **Mobile number** *(required)*
4. `dropdown` **Department** *(required, drives branching)* — Primary / Middle / Senior / Sports / Arts
5. `checkbox` **I consent to:** — Blind review · Sharing my submission with the jury · Publication of excerpts (if selected)

**Section 2 — Primary-teacher questions** *(visibleIf department == Primary)*
6. `textarea` **Describe your phonics strategy for Grade 1** — maxLength 400, required
7. `checkbox` **Play-based tools used** — Blocks · Flashcards · Songs · Storytelling · Puppets · Field trips · Nature walks
8. `number` **Average reading age of your class (months above/below chronological)**

**Section 3 — Middle-school questions** *(visibleIf department == Middle)*
9. `textarea` **How do you keep Grade 7-8 students engaged in abstract topics?** — maxLength 400, required
10. `radio` **Primary assessment method** — Project-based / Traditional exams / Portfolio / Continuous
11. `checkbox` **Life-skills taught** — Financial literacy · Digital citizenship · Critical thinking · Teamwork · Empathy

**Section 4 — Senior-school questions** *(visibleIf department == Senior)*
12. `textarea` **Describe your Board-exam prep strategy** — maxLength 500, required
13. `number` **Last year's best section: average % in board**
14. `radio` **Remedial-class frequency** — Daily / Weekly / Monthly / On-demand / Never
15. `file` **Upload a sample mark-weighting rubric (PDF, 5MB)**

**Section 5 — Sports track** *(visibleIf department == Sports)*
16. `checkbox` **Sports coached** — Cricket · Football · Basketball · Badminton · Athletics · Swimming · Chess · Yoga
17. `number` **Students qualified for state-level last year**
18. `textarea` **Describe your fitness-tracking method** — maxLength 400

**Section 6 — Arts track** *(visibleIf department == Arts)*
19. `checkbox` **Arts taught** — Visual arts · Music · Dance · Drama · Crafts · Photography · Digital media
20. `file` **Upload 3 student artworks (ZIP, max 20MB)**
21. `textarea` **How do you assess creativity objectively?** — maxLength 500

**Section 7 — Knowledge check (quiz)** *(always visible, timed portion starts here)*
22. `mcq` **NCERT stands for?** *(marks 5, negative 1)*
    - **National Council of Educational Research & Training ✓**
    - National Centre of Education
    - New Curriculum Reform Team
    - None
23. `mcq` **RTE Act age bracket?** *(marks 5, negative 1)*
    - 3–12 · 5–14 · **6–14 ✓** · 6–16
24. `mcq` **CCE stands for?** *(marks 5, negative 1)*
    - **Continuous & Comprehensive Evaluation ✓**
    - Central Continuous Examination
    - CBSE Continuous Evaluation
    - Cumulative Classroom Evaluation
25. `mcq` **Which is NOT in Bloom's Taxonomy?** *(marks 5, negative 1)*
    - Remember · Apply · **Predict ✓** · Evaluate
26. `mcq` **Zone of Proximal Development was proposed by?** *(marks 5, negative 1)*
    - Piaget · **Vygotsky ✓** · Skinner · Bandura
27. `mcq` **NEP 2020 recommends which school structure?** *(marks 5, negative 1)*
    - 10+2 · 8+4 · **5+3+3+4 ✓** · 6+3+3

**Section 8 — Case study essay** *(always visible)*
28. `textarea` **Case study (600–800 words).**
   *"A Grade 9 student who was top of the class in Grade 8 suddenly starts underperforming.
   What are 3 possible causes and how would you investigate each?"* — maxLength 1200, required
29. `file` **Upload a lesson plan demonstrating differentiated instruction (PDF, 5MB)** — required
30. `file` **Upload a short (max 3 min) video of you teaching (MP4, max 100MB)** — optional

**Section 9 — Self-reflection** *(always visible)*
31. `radio` **How would you rate your own teaching on a 5-point scale?** — 1 / 2 / 3 / 4 / 5
32. `textarea` **What would push your self-rating up by one point?** — maxLength 400
33. `textarea` **One piece of advice to your first-year-teacher self** — maxLength 300

**Section 10 — Declaration** *(always visible)*
34. `checkbox` **I declare that:** — All info is true · I submit independently · I accept the jury's decision as final
35. `text` **Digital signature (type full name)** *(required)*
36. `date` **Date of submission** *(required, auto-filled to today)*

---

### Why this is powerful
- Start with **nomination gating** (only functionary-invited teachers can start)
- **Branching** ensures a Primary teacher never sees Senior questions
- **Quiz** section auto-scores MCQs silently
- **Essay + files** go to human reviewers for subjective scoring
- Admin creates **Review Level 1** = all submissions, **Level 2** = avg ≥ 70 on essay+quiz, **Level 3** = top 10
- Blind review on for Levels 1 & 2, off for Level 3 (final-jury interview)

---

## 16. Edge Cases

Use these to stress-test your form before publishing.

### 16.1 Empty-submit test
- Try to submit with all fields blank
- **Expect:** first required field shows red message, focus jumps there

### 16.2 Max-length overflow
- Paste 10,000 characters into a `textarea` with `maxLength: 400`
- **Expect:** input truncated at 400, counter shows `400/400`

### 16.3 File type mismatch
- Try uploading `.exe` to a field with `fileTypes: "pdf"`
- **Expect:** file rejected silently

### 16.4 Oversized file
- Try uploading a 50MB PDF to a field with `maxSizeMB: 5`
- **Expect:** rejected with size warning

### 16.5 Branching race
- Pick "Mathematics" → Section 2 appears
- Go back, change to "Science" → Section 2 disappears, Section 3 appears
- **Expect:** answers from the hidden section are NOT submitted

### 16.6 Quiz timer expiry
- Start a 1-minute quiz, leave tab idle
- **Expect:** at 00:00, auto-submits whatever is filled

### 16.7 Offline resilience
- Fill 3 fields, disable wifi, fill 2 more, re-enable wifi
- **Expect:** autosave resumes; nothing lost

### 16.8 Double-submit prevention
- Click "Submit" twice rapidly
- **Expect:** only one response recorded (second click blocked during save)

### 16.9 Expired form access
- Admin changes status to `expired`
- Teacher opens the link
- **Expect:** "This form has closed" page, no fields rendered

### 16.10 Nomination limit enforcement
- Admin sets limit = 5
- Functionary tries to add a 6th teacher
- **Expect:** "Add teacher" button disabled with badge `0 remaining`

### 16.11 Direct-login form with token URL
- Form has `teacher_login: "direct"` but URL includes `?sc=DPS001&token=xxx`
- **Expect:** token used to pre-fill identity, no OTP step

### 16.12 OTP form without token
- Form has `teacher_login: "otp"` and URL has no token
- **Expect:** teacher sees email prompt, must enter email matching a nominated record

### 16.13 Invalid school-code mismatch
- URL: `?sc=DPS001&token=abc` but token belongs to teacher from `KV002`
- **Expect:** fall back to OTP flow, don't pre-fill

### 16.14 Versioning during active window
- Admin edits form after 3 teachers submit
- **Expect:** `version` bumps `1 → 2`; existing responses stay tied to v1; new responses to v2

### 16.15 Bulk import malformed CSV
- CSV with missing `email` column
- **Expect:** rows skipped, success toast shows actual-imported count

---

## 17. Admin Checklist

Before you hit **Publish**:

### Content
- [ ] Title & description make sense to a teacher who's never seen it
- [ ] Every required field really is required (don't over-force)
- [ ] Every MCQ has exactly one `correct` answer set
- [ ] Every file field has sensible `fileTypes` and `maxSizeMB`
- [ ] Every branching rule's `fieldId` exists in an earlier section

### Logistics
- [ ] `starts_at` and `ends_at` set and not in the past
- [ ] `status` = `active` (not `draft`!)
- [ ] Nomination forms: `nomination_limit` matches policy
- [ ] Quiz: `time_limit_min` set; participants warned on landing
- [ ] Email template linked if using bulk dispatch

### Access
- [ ] Pre-approved functionary emails imported (CSV) — `head.{CODE}@cbss.school.org`
- [ ] Reviewers created in User Management if post-submit review needed
- [ ] Public link tested in incognito
- [ ] QR code scanned from a phone

### Review pipeline (optional)
- [ ] Created Level 1 with reviewer assignment
- [ ] Blind review toggled if identity bias is a concern
- [ ] Chose `marks` vs `grade` mode
- [ ] Set `consensus` (min reviewers per response)

---

### Role cheat-sheet

| Role | Login | Session | Can |
|---|---|---|---|
| **Admin** | `admin / admin123` | 8 hours | Build forms, nominate, review, export, audit |
| **Reviewer** | `reviewer1 / review123` | 8 hours | See only assigned submissions, score, comment |
| **Functionary** | `head.{code}@cbss.school.org` + OTP `123456` | 30 minutes | Nominate teachers within limit, send invites |
| **Teacher** | Invite link + OTP `123456` | 1 hour | Fill their form, autosave, submit |

---

## Quick-start snippet: build a form in 60 seconds

1. **Sign in as admin** → left nav → **Forms** → **Create form**
2. Pick a **category** (Normal / Nomination / Branching / Quiz / Multi)
3. In the builder:
   - Left panel → **Add field** → click any field type → configure label / options / required
   - Add multiple **sections** for step-through flow
   - For branching: select the section/field → **Conditional visibility** → set `IF field X == value`
4. Right panel → **Settings**:
   - Set `starts_at`, `ends_at`
   - For nomination: `nomination_limit`, teacher login mode
   - For quiz: `time_limit_min`, negative marking, shuffle
5. Click **Save** (first save generates slug + public URL + QR)
6. Flip status → **Active**
7. For nomination forms → **Forms list** → click 📨 icon → routes to **Send Emails** → pick audience → dispatch

---

*Last updated for Vidyā v1 — School Data Collection Platform.*
*This document lives at `/FORMS_GUIDE.md` and is linked from the admin's Forms page.*
