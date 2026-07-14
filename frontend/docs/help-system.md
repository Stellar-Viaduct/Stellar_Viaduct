# Help System

## Overview

The Help Center provides searchable documentation, FAQ content, contextual guidance, and user feedback capture.

## Components

- `src/pages/Help.tsx`: primary help center page and orchestration logic.
- `src/content/helpContent.ts`: article/FAQ templates and category metadata.
- `src/components/help/HelpTooltip.tsx`: reusable contextual help tooltip.

## Features

- Documentation viewer with related article suggestions.
- Keyword search across title, summary, and article content.
- Category navigation and FAQ filtering.
- Getting started checklist and video tutorial links.
- Contact support CTA and in-app feedback form.
- Article rating persisted in local storage.

## Content format

Each article includes:

- `id`
- `slug`
- `title`
- `category`
- `summary`
- `content`
- `related`
- optional `videoUrl`
