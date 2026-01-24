# Issue 08: AI Coding Tool Security Checklist

> **Severity:** MEDIUM  
> **Category:** Security / Evaluation Framework  
> **Purpose:** A complete evaluation framework for any AI coding assistant

---

## Overview

This checklist provides a systematic way to evaluate the security posture of any AI coding tool before allowing it in your development workflow. Use this for initial evaluation and periodic re-assessment.

---

## Vendor Security Evaluation

### Data Handling

| Question | Answer | Notes |
|----------|--------|-------|
| Where is my code processed? (Region, jurisdiction) | ☐ Documented ☐ Unknown | |
| Is my code used for model training? | ☐ Yes ☐ No ☐ Opt-out available | |
| What's the data retention period? | ☐ _____ days ☐ Unknown | |
| Can I delete my data on request? | ☐ Yes ☐ No ☐ Unknown | |
| Is there a privacy mode/local option? | ☐ Yes ☐ No | |

```markdown
## Data Handling Assessment

- [ ] Code processing location documented
- [ ] Model training policy clear
- [ ] Data retention period specified
- [ ] Data deletion process exists
- [ ] Privacy/local mode available
```

---

### Compliance & Certifications

| Certification | Status | Verification |
|---------------|--------|--------------|
| SOC 2 Type I | ☐ Yes ☐ No | Report dated: _______ |
| SOC 2 Type II | ☐ Yes ☐ No | Report dated: _______ |
| ISO 27001 | ☐ Yes ☐ No | Certificate #: _______ |
| GDPR compliant (if handling EU data) | ☐ Yes ☐ No ☐ N/A | |
| Published security whitepaper | ☐ Yes ☐ No | URL: _______ |
| Third-party penetration test results | ☐ Available ☐ Not available | Date: _______ |

```markdown
## Compliance Assessment

- [ ] SOC 2 Type I or Type II certified
- [ ] ISO 27001 certified
- [ ] GDPR compliant (if handling EU data)
- [ ] Published security whitepaper
- [ ] Third-party penetration test results available
```

---

### Security Practices

| Practice | Status | Details |
|----------|--------|---------|
| Bug bounty or vulnerability disclosure program | ☐ Yes ☐ No | URL: _______ |
| Security incident communication process | ☐ Documented ☐ Unknown | |
| Encryption in transit | ☐ TLS 1.2+ ☐ Unknown | |
| Encryption at rest | ☐ Yes ☐ No ☐ Unknown | |
| Access controls documented | ☐ Yes ☐ No | |
| Audit logging available | ☐ Yes ☐ No | |

```markdown
## Security Practices Assessment

- [ ] Bug bounty or vulnerability disclosure program exists
- [ ] Security incident communication process documented
- [ ] Encryption in transit (TLS 1.2+)
- [ ] Encryption at rest
- [ ] Access controls documented
- [ ] Audit logging available
```

---

### AI-Specific Controls

| Control | Status | Notes |
|---------|--------|-------|
| Prompt injection defenses documented | ☐ Yes ☐ No | |
| Tool execution requires user confirmation | ☐ Yes ☐ No ☐ Configurable | |
| MCP/external integrations sandboxed | ☐ Yes ☐ No ☐ N/A | |
| Output validation before execution | ☐ Yes ☐ No | |
| Rate limiting on AI requests | ☐ Yes ☐ No | |
| Ability to review suggestions before applying | ☐ Yes ☐ No | |

```markdown
## AI-Specific Controls Assessment

- [ ] Prompt injection defenses documented
- [ ] Tool execution requires user confirmation
- [ ] MCP/external integrations sandboxed
- [ ] Output validation before execution
- [ ] Rate limiting implemented
- [ ] Review before apply available
```

---

## Complete Evaluation Scorecard

### Scoring Guide

| Score | Meaning |
|-------|---------|
| 0 | Not implemented / Unknown |
| 1 | Partially implemented |
| 2 | Fully implemented & documented |

### Evaluation Form

```
AI CODING TOOL SECURITY EVALUATION
==================================

Tool Name: _______________________
Vendor: _________________________
Version: ________________________
Evaluation Date: ________________
Evaluated By: ___________________

SECTION 1: DATA HANDLING (Max: 10)
----------------------------------
[ ] Code processing location documented        ___/2
[ ] Model training policy clear                ___/2
[ ] Data retention period specified            ___/2
[ ] Data deletion process exists               ___/2
[ ] Privacy/local mode available               ___/2
                                    Subtotal:  ___/10

SECTION 2: COMPLIANCE (Max: 10)
-------------------------------
[ ] SOC 2 certified (Type II = 2, Type I = 1) ___/2
[ ] ISO 27001 certified                        ___/2
[ ] GDPR compliant                             ___/2
[ ] Security whitepaper published              ___/2
[ ] Penetration test results available         ___/2
                                    Subtotal:  ___/10

SECTION 3: SECURITY PRACTICES (Max: 12)
---------------------------------------
[ ] Bug bounty/vuln disclosure program         ___/2
[ ] Incident communication process             ___/2
[ ] Encryption in transit                      ___/2
[ ] Encryption at rest                         ___/2
[ ] Access controls documented                 ___/2
[ ] Audit logging available                    ___/2
                                    Subtotal:  ___/12

SECTION 4: AI-SPECIFIC CONTROLS (Max: 12)
-----------------------------------------
[ ] Prompt injection defenses                  ___/2
[ ] Execution requires confirmation            ___/2
[ ] MCP integrations sandboxed                 ___/2
[ ] Output validation                          ___/2
[ ] Rate limiting                              ___/2
[ ] Review before apply                        ___/2
                                    Subtotal:  ___/12

==================================
TOTAL SCORE:                       ___/44
==================================

RISK RATING:
[ ] Low Risk (35-44)    - Approved for all use cases
[ ] Medium Risk (25-34) - Approved with restrictions
[ ] High Risk (15-24)   - Requires security review
[ ] Critical Risk (<15) - Not approved for use

APPROVED USE CASES:
[ ] Public/open-source code
[ ] Internal non-sensitive code
[ ] Internal sensitive code
[ ] Customer data handling code
[ ] Security-critical code

REQUIRED MITIGATIONS:
1. ________________________________________
2. ________________________________________
3. ________________________________________

NEXT REVIEW DATE: ________________

APPROVER: ________________________
SIGNATURE: _______________________
DATE: ___________________________
```

---

## Quick Evaluation Checklist

For rapid assessment, use this abbreviated checklist:

```markdown
## Quick Security Check (Pass/Fail)

### Must Have (All required for approval)
- [ ] SOC 2 or ISO 27001 certified
- [ ] Data retention policy documented
- [ ] Encryption in transit (TLS 1.2+)
- [ ] Can opt out of model training

### Should Have (3+ required for full approval)
- [ ] Privacy/local mode available
- [ ] Bug bounty program
- [ ] Audit logging
- [ ] User confirmation for execution
- [ ] Prompt injection defenses

### Nice to Have
- [ ] Third-party pen test results
- [ ] Self-hosted option
- [ ] Output validation
- [ ] MCP sandboxing

RESULT: [ ] APPROVED [ ] CONDITIONAL [ ] REJECTED
```

---

## Periodic Review Schedule

| Review Type | Frequency | Trigger |
|-------------|-----------|---------|
| Full evaluation | Annually | Calendar |
| Quick check | Quarterly | Calendar |
| Incident review | As needed | Security incident |
| Version review | As needed | Major version update |
| Policy review | As needed | Vendor policy change |

---

## Documentation Requirements

When approving an AI coding tool, document:

```markdown
## AI Tool Approval Record

### Tool Information
- Name: 
- Version:
- Vendor:
- License type:

### Evaluation Summary
- Evaluation date:
- Evaluator:
- Score: ___/44
- Risk rating:

### Approved Configurations
- Privacy mode: [ ] Required [ ] Recommended [ ] Optional
- Execution confirmation: [ ] Required [ ] Recommended [ ] Optional
- MCP integrations: [ ] Disabled [ ] Whitelist only [ ] All allowed

### Approved Use Cases
- [ ] List approved use cases

### Prohibited Uses
- [ ] List prohibited uses

### Required Training
- [ ] Developers must complete security awareness training
- [ ] Developers must read this evaluation document

### Review Schedule
- Next full review:
- Next quick check:

### Approval Chain
- Security team: _____________ Date: _______
- Engineering lead: __________ Date: _______
- CISO (if required): ________ Date: _______
```

---

## Vendor Comparison Template

Use this to compare multiple tools:

| Criteria | Tool A | Tool B | Tool C |
|----------|--------|--------|--------|
| **Data Handling** | | | |
| Processing location | | | |
| Training opt-out | | | |
| Retention period | | | |
| Privacy mode | | | |
| **Compliance** | | | |
| SOC 2 | | | |
| ISO 27001 | | | |
| GDPR | | | |
| **Security** | | | |
| Bug bounty | | | |
| Encryption | | | |
| Audit logs | | | |
| **AI Controls** | | | |
| Prompt injection defense | | | |
| Execution confirmation | | | |
| **Score** | ___/44 | ___/44 | ___/44 |
| **Recommendation** | | | |

---

## Verification Checklist

Before finalizing AI tool evaluation for TourWiseCo.com:

- [ ] **Full evaluation completed** using scorecard above
- [ ] **All "Must Have" items verified** in quick check
- [ ] **Vendor documentation obtained** and reviewed
- [ ] **Certifications verified** (not just claimed)
- [ ] **Approval record created** and filed
- [ ] **Team notified** of approved configurations
- [ ] **Review schedule set** in calendar

---

## Files to Create

After evaluation, create these files in your project:

```
docs/
  security/
    ai-tools/
      approved-tools.md          # List of approved tools
      tool-evaluations/
        github-copilot.md        # Individual evaluations
        cursor.md
        amazon-q.md
      configuration-guides/
        copilot-config.md        # Required settings
        cursor-config.md
```

---

## References

- [SOC 2 Compliance Guide](https://www.aicpa.org/soc2)
- [ISO 27001 Overview](https://www.iso.org/isoiec-27001-information-security.html)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
