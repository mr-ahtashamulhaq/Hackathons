# Setup Guide

How to install PR Review Buddy into your own GitLab project.

## Prerequisites

- A GitLab account with access to GitLab Duo Agent Platform
- A GitLab project where you want MRs reviewed automatically

## Step 1 — Add the Agent

1. Go to your GitLab project
2. Navigate to: Settings → Duo Agent Platform → Agents
3. Click "New Agent"
4. Name it: pr-review-buddy
5. Paste the contents of agent/system_prompt.md as the system prompt
6. Save

## Step 2 — Add the Flow

1. Navigate to: Settings → Duo Agent Platform → Flows
2. Click "New Flow"
3. Paste the contents of flow/mr_review_flow.yml
4. Save

## Step 3 — Activate the Trigger

1. Navigate to: Automate → Triggers
2. Confirm the merge_request:opened and merge_request:pushed 
   triggers are active and linked to mr-review-flow

## Step 4 — Test It

1. Create a new branch in your repo
2. Add some code with obvious issues 
   (example: hardcode a password, skip error handling)
3. Open a Merge Request from that branch to main
4. Within 15-30 seconds, PR Review Buddy will post inline comments

## Troubleshooting

- If the agent does not trigger, check that the flow is set to Active
- If comments are not posting, verify the agent has write permissions on the project
- Check Automate → Sessions for full execution logs
