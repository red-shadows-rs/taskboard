<div align="center">

# Security Policy - Taskboard

[![Version](https://img.shields.io/badge/version-4.2.0-2563eb?style=flat-square&logo=semver)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)](LICENSE)
![TypeScript](https://img.shields.io/badge/typescript-5%2B-3178c6?style=flat-square&logo=typescript)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Self--Hosted-9333ea?style=flat-square&logo=linux)

</div>

---

## Table of Contents

- [Supported Versions](#supported-versions)
- [Reporting a Vulnerability](#reporting)
- [Response Timeline](#response-timeline)
- [Disclosure Policy](#disclosure)
- [Security Best Practices](#security-best-practices)
- [Acknowledgments](#acknowledgments)

---

<a id="supported-versions"></a>

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 4.x     | Yes       |
| < 4.0   | No        |

---

<a id="reporting"></a>

## Reporting a Vulnerability

If you discover a security vulnerability in Taskboard, please report it responsibly.

**Do not open a public issue.** Instead, send a detailed report to the project maintainers.

### What to Include

- A clear description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Potential impact
- Any suggested fixes (if available)

---

<a id="response-timeline"></a>

## Response Timeline

- **Acknowledgment**: Within 48 hours of receipt
- **Status Update**: Within 5 business days
- **Resolution**: We aim to resolve critical issues within 30 days

---

<a id="disclosure"></a>

## Disclosure Policy

We follow a coordinated disclosure process:

1. The vulnerability is reported privately
2. A fix is developed and tested
3. A security release is published
4. Public disclosure follows after users have had time to update

---

<a id="security-best-practices"></a>

## Security Best Practices

Taskboard implements several security measures:

- **Session Management**: HMAC-SHA256 signed httpOnly cookies with 7-day expiry
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Per-IP rate limiting on authentication endpoints
- **Input Validation**: Zod schemas on all API routes
- **XSS Protection**: DOMPurify sanitization on user-generated content
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

---

<a id="acknowledgments"></a>

## Acknowledgments

We appreciate the security research community's efforts in making Taskboard more secure. Responsible disclosures will be acknowledged (with permission) in our release notes.

---

<div align="center">

Built by <a href="https://github.com/shadow-x78">shadow-x78</a> ·
[Back to README](README.md)

<sub>&copy; 2026 Taskboard (shadow-x78)</sub>

</div>
