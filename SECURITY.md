# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in TaskBoard, please report it responsibly.

**Do not open a public issue.** Instead, send a detailed report to the project maintainers.

### What to Include

- A clear description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Potential impact
- Any suggested fixes (if available)

### Response Timeline

- **Acknowledgment**: Within 48 hours of receipt
- **Status Update**: Within 5 business days
- **Resolution**: We aim to resolve critical issues within 30 days

### Disclosure Policy

We follow a coordinated disclosure process:

1. The vulnerability is reported privately
2. A fix is developed and tested
3. A security release is published
4. Public disclosure follows after users have had time to update

## Supported Versions

| Version | Supported |
|---|---|
| 4.x | Yes |
| < 4.0 | No |

## Security Best Practices

TaskBoard implements several security measures:

- **Session Management**: HMAC-SHA256 signed httpOnly cookies with 7-day expiry
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Per-IP rate limiting on authentication endpoints
- **Input Validation**: Zod schemas on all API routes
- **XSS Protection**: DOMPurify sanitization on user-generated content
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

## Acknowledgments

We appreciate the security research community's efforts in making TaskBoard more secure. Responsible disclosures will be acknowledged (with permission) in our release notes.