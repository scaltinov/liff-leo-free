# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a LINE LIFF (LINE Front-end Framework) HTML file for a Japanese contact form. The file is designed to be referenced/loaded by LIFF applications within the LINE messaging platform.

## Architecture

- **Single HTML file**: Complete LIFF application in `index.html`
- **LIFF SDK integration**: Uses LINE LIFF SDK v2 for messaging functionality
- **Static hosting**: Designed to be served directly to LIFF without build process
- **Japanese UI**: Contact form with Japanese labels and messaging

## Key Components

- **LIFF ID**: `2008169967-p3vmNKQg` - configured for this specific LINE application
- **Contact form**: Name (required) and message (required, max 1200 chars) fields
- **Message sending**: Sends formatted message to LINE chat via LIFF SDK
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