# AGENTS.md

Customizes GitLab Duo agent behavior for this project.

## PR Review Buddy

- Always respond in English
- Focus only on actionable feedback — no generic praise
- When reviewing Python, flag violations of PEP 8 only if they cause 
  real readability or maintenance problems
- When reviewing JavaScript or TypeScript, flag any console.log 
  statements left in production code as LOW severity
- Never suggest rewriting code that is functionally correct unless 
  there is a security or performance reason
- Keep the final summary comment under 300 words
- Do not comment on formatting if a linter config exists in the repo
