# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a LINE LIFF (LINE Front-end Framework) HTML file for a Japanese reservation form. The file is designed to be referenced/loaded by LIFF applications within the LINE messaging platform.

## Architecture

- **Single HTML file**: Complete LIFF application in `index.html`
- **LIFF SDK integration**: Uses LINE LIFF SDK v2 for messaging functionality
- **Static hosting**: Designed to be served directly to LIFF without build process
- **Japanese UI**: Reservation form with Japanese labels and messaging

## Key Components

- **LIFF ID**: `2008341587-cb5hHT3r` - configured for Leo Platinum LINE application
- **Reservation form**:
  - Date: 11/8 (fixed, read-only)
  - Time: 20:00〜23:30 in 15-minute intervals (dropdown, required)
  - Name: Text input (required)
  - Party size: 1-9 people (dropdown, required)
- **Message sending**: Sends formatted reservation message to LINE chat via LIFF SDK
- **Auto-close**: Closes LIFF window after successful message send

## Development

### Local development
```bash
# Serve with any static web server for testing
python3 -m http.server 8000
# or
npx serve .
```

### LIFF testing
- Must be accessed through LINE LIFF URL for full functionality
- External browser will show fallback behavior (shareTargetPicker)
- Debug information available via diagnostic display

### File Structure
```
.
└── index.html    # Complete LIFF contact form application
```

## LIFF Configuration Notes

- Application must be registered in LINE Developers Console
- LIFF endpoint URL should point to where this HTML is hosted
- Requires HTTPS in production for LIFF functionality