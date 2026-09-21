# NIAT x CDU Attendance Calculator

A fast, client-side, mobile-first web application designed for university students to calculate and project their attendance leading up to the **October 8th, 2026** attendance freeze.

## Key Highlights & Schedule

- **Freeze Date**: October 8th, 2026 EOD
- **Baseline Reference**: September 20th, 2026
- **Sessions Per Working Day**: 8 sessions
- **Target Benchmark**: 70.00% minimum attendance
- **Dynamic Real-Time Session Engine**: Automatically decrements remaining sessions in real time as each college period concludes (8:30 AM to 4:00 PM).

### Daily Session Timetable (8:30 AM – 4:00 PM)

| Slot | Time Period | Duration | Decrement Milestone |
| :--- | :--- | :--- | :--- |
| **Session 1** | 08:30 AM – 09:20 AM | 50 mins | Completes at 09:20 AM (1 done) |
| **Session 2** | 09:20 AM – 10:25 AM *(incl. break)* | 65 mins | Completes at 10:25 AM (2 done) |
| **Session 3** | 10:25 AM – 11:00 AM | 35 mins | Completes at 11:00 AM (3 done) |
| **Session 4** | 11:00 AM – 11:50 AM | 50 mins | Completes at 11:50 AM (4 done) |
| **Session 5** | 11:50 AM – 12:40 PM | 50 mins | Completes at 12:40 PM (5 done) |
| **Session 6** | 12:40 PM – 01:30 PM | 50 mins | Completes at 01:30 PM (6 done) |
| **Session 7** | 01:30 PM – 02:20 PM | 50 mins | Completes at 02:20 PM (7 done) |
| **Session 8** | 02:20 PM – 04:00 PM | 100 mins | Completes at 04:00 PM (8 done / EOD) |

### Schedule Calendar (Sep 21 – Oct 8, 2026)

| Date | Day | Type | Conducted Sessions | Attended (With GRIT) | Attended (No GRIT) |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Sep 21** | Mon | Normal Class | 8 | 8 | 8 |
| **Sep 22** | Tue | Normal Class | 8 | 8 | 8 |
| **Sep 23** | Wed | **GRIT Day 1** | 8 | 8 | 5 |
| **Sep 24** | Thu | Normal Class | 8 | 8 | 8 |
| **Sep 25** | Fri | **Holiday** | 0 | 0 | 0 |
| **Sep 26** | Sat | **GRIT Day 2** | 8 | 8 | 5 |
| **Sep 27** | Sun | **Sunday Holiday** | 0 | 0 | 0 |
| **Sep 28** | Mon | Normal Class | 8 | 8 | 8 |
| **Sep 29** | Tue | Normal Class | 8 | 8 | 8 |
| **Sep 30** | Wed | **GRIT Day 3** | 8 | 8 | 5 |
| **Oct 01** | Thu | Normal Class | 8 | 8 | 8 |
| **Oct 02** | Fri | **Holiday (Gandhi Jayanti)** | 0 | 0 | 0 |
| **Oct 03** | Sat | **GRIT Day 4** | 8 | 8 | 5 |
| **Oct 04** | Sun | **Sunday Holiday** | 0 | 0 | 0 |
| **Oct 05** | Mon | Normal Class | 8 | 8 | 8 |
| **Oct 06** | Tue | Normal Class | 8 | 8 | 8 |
| **Oct 07** | Wed | Normal Class | 8 | 8 | 8 |
| **Oct 08** | Thu | **Freeze Date** | 8 | 8 | 8 |

---

### EOD Progression Table

| As of Date (EOD) | Working Days Left | Normal Days Left | GRIT Days Left | Remaining Sessions |
| :--- | :---: | :---: | :---: | :---: |
| **Sep 20 (Baseline / Today)** | **14** | **10** | **4** | **112** |
| **Sep 21 (Mon EOD)** | 13 | 9 | 4 | 104 |
| **Sep 22 (Tue EOD)** | 12 | 8 | 4 | 96 |
| **Sep 23 (Wed EOD - GRIT 1)** | 11 | 8 | 3 | 88 |
| **Sep 24 (Thu EOD)** | 10 | 7 | 3 | 80 |
| **Sep 25 (Fri EOD - Holiday)** | 10 | 7 | 3 | 80 |
| **Sep 26 (Sat EOD - GRIT 2)** | 9 | 7 | 2 | 72 |
| **Sep 27 (Sun EOD - Holiday)** | 9 | 7 | 2 | 72 |
| **Sep 28 (Mon EOD)** | 8 | 6 | 2 | 64 |
| **Sep 29 (Tue EOD)** | 7 | 5 | 2 | 56 |
| **Sep 30 (Wed EOD - GRIT 3)** | 6 | 5 | 1 | 48 |
| **Oct 01 (Thu EOD)** | 5 | 4 | 1 | 40 |
| **Oct 02 (Fri EOD - Holiday)** | 5 | 4 | 1 | 40 |
| **Oct 03 (Sat EOD - GRIT 4)** | 4 | 4 | 0 | 32 |
| **Oct 04 (Sun EOD - Holiday)** | 4 | 4 | 0 | 32 |
| **Oct 05 (Mon EOD)** | 3 | 3 | 0 | 24 |
| **Oct 06 (Tue EOD)** | 2 | 2 | 0 | 16 |
| **Oct 07 (Wed EOD)** | 1 | 1 | 0 | 8 |
| **Oct 08 (Thu EOD - Freeze)** | 0 | 0 | 0 | 0 |

---

## GRIT Participation Impact
- **Writing GRIT**: All 8 sessions count on each GRIT day.
- **Not Writing GRIT**: 5 of the 8 sessions count on each GRIT day (3 sessions deducted per GRIT day).

## Tech Stack
- HTML5
- CSS3 (Custom Dark Theme & Micro-animations)
- JavaScript (Vanilla ES6+)

---
*Made with ❤️ & attendance panic 🤧 from Hall-1*
