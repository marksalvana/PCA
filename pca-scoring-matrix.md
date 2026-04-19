# PCA Scoring Matrix — Proposed Revision

## How the objective score works

```
objective_score = SUM(edu_pts) + SUM(track_pts) + SUM(achievement_pts) - SUM(legal_penalties)
objective_score = max(0, objective_score)
```

- **Type:** Cumulative — no upper cap
- **Floor:** 0 (legal penalties cannot push score below zero)
- **No data:** Displayed as `—` (null), never a fabricated zero
- **Verified only:** Unverified records contribute 0 points

---

## 1. Education score

Points per verified degree. Cumulative — all degrees count.

| CHED classification | Points | Notes |
|---|---|---|
| Deregulated | +100 | Highest CHED autonomy — top quality benchmark |
| Autonomous | +95 | Strong institutional track record |
| Foreign | +90 | International — most PH politicians abroad attended reputable schools |
| Level IV | +85 | Top domestic accreditation |
| Level III | +70 | Good quality domestic institution |
| Level II | +55 | Meets minimum standards |
| Level I | +40 | Lowest accredited tier |
| Unaccredited | +20 | Cannot confirm quality through official channels |
| Unknown | +0 | Cannot verify — no fabricated rating |
| Incomplete degree | ×0.75 | Multiplier on base institution points — attendance without completion |

---

## 2. Track record score

Points per verified term. Cumulative across all terms.

```
term_score = (15) + max(0, coa_or_legislative_pts) + attendance_modifier
term_score = max(0, term_score)
```

### 2a. Term completion bonus

| Condition | Points | Notes |
|---|---|---|
| Verified completed term | +15 | Flat bonus, added before COA modifier. Rewards not quitting or being removed from office. |

### 2b. COA modifier (added on top of completion bonus)

| COA audit opinion | Points | Notes |
|---|---|---|
| Unqualified (clean) | +100 | Fair financial statements, no material misstatements |
| Qualified | +60 | Issues found but not pervasive |
| Adverse | +20 | Materially misstated — serious governance problems |
| Disclaimer | +10 | COA couldn't audit — records unavailable or unreliable |
| Unknown / no data | +0 | No fabricated points — completion bonus still applies if term is verified |

### 2c. Legislative scoring

Applies to senators and representatives when COA is not applicable.

| Condition | Points | Formula |
|---|---|---|
| Bills-based score | 0–85 | `pass_rate × 85` — zero bills passed = zero points, no floor gift |
| No bills data | +0 | Completion bonus still applies if term is verified |

> **Why this changed:** Old formula was `30 + (pass_rate × 55)`, giving a floor of 30 points to legislators who passed zero bills. That was a gift. New formula removes the floor entirely.

### 2d. Attendance modifier

Additive — applied after all base points per term.

| Attendance rate | Modifier | Notes |
|---|---|---|
| 95 – 100% | +20 | Exceptional attendance |
| 90 – 94% | +10 | Good attendance |
| 75 – 89% | +0 | Adequate, unremarkable — no change |
| 50 – 74% | −10 | Poor but majority-present |
| < 50% | −50 | Majority-absent — serious governance failure |
| No attendance data | +0 | No modifier applied — no fabricated score |

> **Why attendance tiers changed:** Old system had a cliff at 90% — 89% attendance got 0, 90% got +20. That's a 20-point jump for 1%. Now it's graduated. The 50–74% penalty was also softened from −20 to −10.

---

## 3. Achievements score

Points per verified achievement. No cap — vetting requirement (source URL + named reviewer) is the natural limiter.

| Impact scope | Points | Examples |
|---|---|---|
| National — landmark | +100 | Republic Acts directly impacting millions — universal health care law, major reform legislation |
| National — standard | +60 | National awards, recognition, national programmes with narrower scope, minor Republic Acts |
| Regional | +40 | Regional ordinances, provincial programmes, regional infrastructure |
| Local | +20 | City/municipal ordinances, barangay programmes, local infrastructure |
| Scope not classified | +0 | Admin must classify before it influences score — no default |

> **Why national was split:** Old system had a single "National" tier at +100, lumping a landmark Republic Act affecting 110M people alongside a minor national award. Now there are two sub-tiers. Regional was also adjusted from +50 to +40 to preserve a meaningful gap between regional and national-standard.

> **Why there is no cap:** Capping achievements breaks the cumulative model. A senator who authored 10 landmark Republic Acts should score higher than one who authored 1. The cap you're thinking of doesn't solve the fairness problem — fixing scope classification does.

---

## 4. Legal penalty

Deducted from the objective score. Floor is always 0.

| Case status | Penalty | Notes |
|---|---|---|
| Pending | −50 | Active case in court — unproven but material fact for voters |
| On appeal | −50 | Same as pending — matter still unresolved before higher court |
| Convicted | −200 | Court finding beyond reasonable doubt — heaviest penalty |
| Acquitted | 0 | Not guilty — no deduction. Record still displayed for transparency. |
| Dismissed | 0 | No verdict — no deduction. Displayed for transparency. |

---

## 5. Score interpretation bands

Use as a rough guide. Context always matters.

| Score range | Label | What it typically means |
|---|---|---|
| 500+ | Exceptional record | Multiple degrees, sustained clean COA audits, no active legal cases |
| 300 – 499 | Strong record | Good education, clean or mostly clean track record, no serious legal issues |
| 100 – 299 | Limited or mixed record | Short career, unknown COA data, or qualified findings — warrants inspection |
| 1 – 99 | Thin or penalized record | Few verified achievements, adverse findings, or active legal penalties |
| 0 | Penalized to floor | Legal penalties exceed all positive points |

---

## Change log

| Category | What changed | Reason |
|---|---|---|
| Track record | Added +15 flat term completion bonus | Completing a term is independently meaningful — separate from audit quality |
| Track record (legislative) | Removed 30-point floor from bills-based score | Zero bills passed should not earn 30 points |
| Attendance | Split 90–100% tier into 95–100% (+20) and 90–94% (+10) | Cliff at 90% was a 20-point jump for 1% difference — now graduated |
| Attendance | Softened 50–74% penalty from −20 to −10 | Poor but majority-present does not deserve same severity as majority-absent |
| Achievements | Split National into landmark (+100) and standard (+60) | A Republic Act affecting 110M people is not equal to a minor national award |
| Achievements | Regional adjusted from +50 to +40 | Preserves meaningful gap between regional and national-standard tiers |
| Achievements | No cap added | Cap breaks the cumulative model — stricter scope classification is the right fix |
