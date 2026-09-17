# Dr. Farid Ahmed — Appointment & Admin System

## What it includes
- Public doctor website
- Online appointment form
- Central SQLite database
- Daily serial numbers (F-001, F-002...)
- Admin login
- Today's patient list
- Confirm / Complete / Cancel / Delete
- WhatsApp appointment notification
- Responsive mobile design

## Run locally
1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run `npm install`
4. Set admin credentials:
   - Windows PowerShell: `$env:ADMIN_USER="admin"; $env:ADMIN_PASS="YOUR_STRONG_PASSWORD"`
   - Linux/macOS: `export ADMIN_USER=admin; export ADMIN_PASS='YOUR_STRONG_PASSWORD'`
5. Run `npm start`
6. Open `http://localhost:3000`

## Important
This is a real database-backed starter system, but it must be deployed to a server/hosting service for patients to access it publicly. Before deployment, change the default admin password and use HTTPS.


## New dashboard features
- Doctor Dashboard with total/pending/confirmed/completed counters
- Next Serial button to call the next pending patient
- WhatsApp notification button for a selected patient
- CSV export for today's patient list
- Current called serial display


## Admin UI update
The admin panel now has a dedicated Bangla login screen, session-based login, dashboard counters, Next Serial, status actions, WhatsApp notifications, and CSV export.
