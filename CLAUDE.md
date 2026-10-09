# The Way Within with Nadia — website

This project is governed by three documents in the repo root. All three are imported below, so every Claude Code session loads them together.

- **What** to build (brand, pages, content, features, UX, Definition of Done):
  @The_Way_Within_Master_Doc_for_Claude.md
- **How** to build it (stack, architecture, code rules, testing, CI):
  @ENGINEERING.md
- **Legal, privacy and accessibility requirements** (WCAG 2.2 AA, DSGVO, cookies, Impressum, booking law):
  @LEGAL.md

## Rules that keep the documents in sync

1. Business, content, design and scope questions → the Master Build Document wins.
2. Technical decisions → `ENGINEERING.md` wins (it supersedes §24 of the Master Doc).
3. Anything legal, privacy- or accessibility-related → `LEGAL.md` wins over both.
4. If a change affects more than one document (new feature → new module → new data collected), update all affected files in the same commit. Any new form field, cookie, storage key or third-party service must be added to `LEGAL.md` §4.2 / §5.1 and `docs/data-inventory.md`.
5. Do not rename or move any of these files without updating the links in the others and in this one.
6. Never invent legal text, business data, registration numbers or licences. Use a marked placeholder and add it to `PENDING.md`.
7. If something is ambiguous in business or legal terms, stop and ask instead of inventing an answer.
