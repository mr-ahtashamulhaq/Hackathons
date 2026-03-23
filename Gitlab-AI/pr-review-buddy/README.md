# PR Review Buddy

An AI agent built on the GitLab Duo Agent Platform that automatically reviews 
Merge Requests the moment they are opened — catching bugs, security issues, 
and missing error handling before a human even looks at it.

Built for the GitLab AI Hackathon 2026.

---

## 🔴 Live Demo
[![Live Dashboard](https://img.shields.io/badge/Live%20Dashboard-Visit%20Now-brightgreen?style=for-the-badge)](https://pr-review-buddy.vercel.app)
[![GitLab Repo](https://img.shields.io/badge/GitLab-Repository-orange?style=for-the-badge&logo=gitlab)](https://gitlab.com/gitlab-ai-hackathon/participants/35507182)

---

## The Problem

Code review is one of the biggest bottlenecks in software development. 
Developers wait hours or days for feedback. Reviewers are busy, inconsistent, 
and often miss security issues under time pressure. Junior developers get 
blocked the most.

## The Solution

PR Review Buddy triggers automatically when any Merge Request is opened. 
It reads the diff, analyzes it using Claude via GitLab Duo, and posts 
structured inline comments — just like a senior engineer would, in under 15 seconds.

---

## What It Reviews

- Security vulnerabilities (hardcoded secrets, SQL injection, missing auth)
- Bugs and logic errors
- Missing error handling
- Performance issues
- Code clarity problems

---

## How It Works

MR Opened by Developer
        ↓
GitLab Trigger fires (merge_request:opened)
        ↓
Custom Flow (mr_review_flow.yml) starts
        ↓
PR Review Buddy Agent reads the MR diff
        ↓
Claude analyzes the code changes
        ↓
Inline comments posted on specific lines
        ↓
Summary comment added with overall recommendation

---

## Project Structure

pr-review-buddy/
├── agent/
│   ├── system_prompt.md        # Claude agent instructions
│   └── agent_config.yml        # GitLab Custom Agent config
├── flow/
│   └── mr_review_flow.yml      # Custom Flow with MR trigger
├── .gitlab/
│   └── AGENTS.md               # Agent behavior customization
├── frontend/
│   └── src/                    # Dashboard UI (React + Tailwind)
├── docs/
│   └── setup.md                # Installation guide
├── README.md
└── LICENSE

---

## Tech Stack

- GitLab Duo Agent Platform — Custom Agent + Custom Flow
- Anthropic Claude — LLM backbone (provided by GitLab, no API key needed)
- React + Tailwind CSS + Vite — Frontend dashboard
- GitLab CI/CD Triggers — Event-driven automation

---

## Team

| Name | Role | LinkedIn |
|------|------|----------|
| Ahtasham Ul Haq | AI/LLM, Agent Logic, Frontend | [linkedin.com/in/mr-ahtasham-ul-haq](https://www.linkedin.com/in/mr-ahtasham-ul-haq/) |
| Agrika Gupta | Backend, GitLab Setup | [linkedin.com/in/agrika-gupta](https://www.linkedin.com/in/agrika-gupta/) |
| Sejuti Dhali | Demo & Presentation | [linkedin.com/in/dhali-sejuti](https://www.linkedin.com/in/dhali-sejuti/) |

---

## License

MIT
