# Issue 07: Evaluating AI Coding Tool Security

> **Severity:** MEDIUM  
> **Category:** Security / Vendor Assessment  
> **Note:** Meta-security - securing the tools you use to write code

---

## Problem

Many AI coding tools publish security guides that teach you to write secure code—but say nothing about whether the tool itself is secure. This is a critical distinction. Before trusting an AI with your codebase, you need to evaluate the tool's own security posture.

---

## The Critical Question

> **"Where does my code go when I paste it into this tool?"**

If a vendor's security documentation doesn't clearly answer this question, treat the tool as high-risk until they provide transparency.

---

## What Good Security Documentation Includes

A trustworthy AI coding tool vendor should provide:

- [ ] **SOC 2 Type II or ISO 27001 certification** (third-party verified)
- [ ] **Clear data flow documentation** (where does your code go?)
- [ ] **Data retention policies** (how long is your code stored?)
- [ ] **Vulnerability disclosure program or bug bounty**
- [ ] **AI-specific security controls** (prompt injection defenses)
- [ ] **Published incident response process**

---

## Red Flags to Watch For

| Red Flag | What It Means |
|----------|---------------|
| **No certifications** | No third-party verification of security claims |
| **Vague data policies** | "We take security seriously" without specifics |
| **Dismissive vulnerability response** | Reported issues ignored or minimized |
| **No OWASP LLM coverage** | Guide ignores AI-specific attack surfaces |
| **Marketing claims without evidence** | "Vibe code without losing sleep over security" |
| **No privacy mode option** | Cannot opt out of data collection |
| **Unclear model training policy** | Don't know if your code trains their models |

---

## Vendor Comparison Matrix

| Vendor | SOC 2 | ISO 27001 | Privacy Mode | AI Risk Coverage |
|--------|-------|-----------|--------------|------------------|
| GitHub Copilot | Type I/II | ✓ | Enterprise | Medium |
| Amazon Q | Type II | ✓ | Standard | Medium |
| Cursor | Type I | ✓ | Local Ghost | Low |
| Smaller vendors | Often missing | Often missing | Varies | Usually none |

---

## Vendor Evaluation Checklist

Use this checklist when evaluating any AI coding tool:

### 1. Data Security

```markdown
- [ ] Where is my code sent? (endpoints, regions)
- [ ] Is data encrypted in transit? (TLS 1.2+)
- [ ] Is data encrypted at rest?
- [ ] How long is my code retained?
- [ ] Can I request data deletion?
- [ ] Is my code used to train models?
- [ ] Can I opt out of training?
```

### 2. Certifications & Compliance

```markdown
- [ ] SOC 2 Type II report available?
- [ ] ISO 27001 certified?
- [ ] GDPR compliant? (if applicable)
- [ ] HIPAA compliant? (if handling health data)
- [ ] FedRAMP authorized? (if government)
- [ ] When was last audit?
```

### 3. AI-Specific Security

```markdown
- [ ] Prompt injection defenses documented?
- [ ] Model output filtering in place?
- [ ] Rate limiting on API calls?
- [ ] Audit logging of AI interactions?
- [ ] Ability to review AI suggestions before execution?
```

### 4. Incident Response

```markdown
- [ ] Published incident response process?
- [ ] Bug bounty or vulnerability disclosure program?
- [ ] History of transparent breach disclosure?
- [ ] SLA for security issue response?
```

### 5. Privacy Controls

```markdown
- [ ] Privacy mode available?
- [ ] Can disable telemetry?
- [ ] Self-hosted option available?
- [ ] Data residency options?
- [ ] Employee access to customer code documented?
```

---

## Questions to Ask Vendors

Before adopting an AI coding tool for your team, get answers to these questions:

### Data Handling

1. "Exactly what data leaves my machine when I use your tool?"
2. "Where are your servers located?"
3. "How long do you retain my code snippets?"
4. "Do any third parties have access to my code?"
5. "Is my code used to improve your models?"

### Security Posture

6. "Can I see your SOC 2 Type II report?"
7. "What is your incident response SLA?"
8. "How do you handle prompt injection attacks?"
9. "What happens if your service is compromised?"

### Privacy Options

10. "Can I use your tool without any data leaving my network?"
11. "What's the difference between free and paid tier data handling?"
12. "How do I request deletion of my data?"

---

## Tool Security Configuration Guide

### GitHub Copilot

```yaml
# Settings to review:
# 1. Organization settings > Copilot > Policies
# 2. Disable "Allow GitHub to use my code snippets for product improvements"
# 3. Enable "Block suggestions matching public code"

# For enterprise:
# - Enable "Copilot Business" for no training on your code
# - Review audit logs: Settings > Audit log > Filter by Copilot
```

### Cursor

```yaml
# Enable Privacy Mode (Ghost Mode):
# Settings > Privacy > Enable "Privacy Mode"
# This uses local models only, no data sent to servers

# Review MCP integrations:
# Settings > MCP > Disable untrusted sources

# Check what's being sent:
# Settings > Privacy > View data collection settings
```

### Amazon Q

```yaml
# Review data settings:
# AWS Console > Amazon Q > Settings > Data sharing

# For enterprise:
# - Use AWS IAM for access control
# - Enable CloudTrail for audit logging
# - Review VPC endpoints for network isolation
```

### VS Code + Extensions

```json
// settings.json - Disable telemetry for AI extensions
{
    "telemetry.telemetryLevel": "off",
    "github.copilot.advanced": {
        "debug.testOverrideProxyUrl": "",
        "debug.overrideProxyUrl": ""
    }
}
```

---

## Risk Assessment Template

Use this template to document your AI tool risk assessment:

```markdown
# AI Tool Risk Assessment: [Tool Name]

## Overview
- Tool: [Name]
- Version: [Version]
- Vendor: [Company]
- Assessment Date: [Date]
- Assessed By: [Name]

## Data Flow
- [ ] Code sent to: [endpoints]
- [ ] Data retention: [duration]
- [ ] Training opt-out: [Yes/No]

## Certifications
- [ ] SOC 2: [Type I/II/None]
- [ ] ISO 27001: [Yes/No]
- [ ] Other: [List]

## Risk Level: [Low/Medium/High/Critical]

## Approved Use Cases
- [ ] Public/open-source code
- [ ] Internal non-sensitive code
- [ ] Sensitive internal code
- [ ] Customer data handling code
- [ ] Security-critical code

## Required Controls
1. [Control 1]
2. [Control 2]

## Review Schedule
- Next review: [Date]
- Review frequency: [Quarterly/Annually]
```

---

## Verification Checklist

Before using an AI coding tool on TourWiseCo.com:

- [ ] **Vendor documentation reviewed** - Data flow clearly understood
- [ ] **Certifications verified** - SOC 2/ISO 27001 reports obtained
- [ ] **Privacy mode configured** - Enabled for sensitive work
- [ ] **Data retention understood** - Know how long code is kept
- [ ] **Training opt-out confirmed** - Code not used for model training
- [ ] **Team trained** - Developers know safe usage practices
- [ ] **Risk assessment documented** - Formal evaluation completed

---

## Test Procedure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Request vendor's SOC 2 report | Report provided or available |
| 2 | Find data retention policy in docs | Clear policy stated |
| 3 | Locate training opt-out setting | Setting exists and is enabled |
| 4 | Enable privacy mode | Mode activates, reduces data sent |
| 5 | Review network traffic with proxy | Understand what data leaves machine |
| 6 | Contact vendor with security question | Timely, substantive response |

---

## Decision Matrix

Use this to decide which AI tool to use for different code types:

| Code Type | Acceptable Tools | Required Settings |
|-----------|------------------|-------------------|
| Public/OSS | Any with basic security | Standard settings |
| Internal (non-sensitive) | SOC 2 certified vendors | Privacy mode preferred |
| Internal (sensitive) | Enterprise tier only | Privacy mode required |
| Customer PII handling | Self-hosted or enterprise | Maximum privacy settings |
| Security-critical | Self-hosted only | Air-gapped preferred |

---

## References

- [SOC 2 Compliance Overview](https://www.aicpa.org/soc2)
- [ISO 27001 Certification](https://www.iso.org/isoiec-27001-information-security.html)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [GitHub Copilot Trust Center](https://resources.github.com/copilot-trust-center/)
- [Cursor Privacy Policy](https://cursor.sh/privacy)
