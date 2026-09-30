# NIAT x CDU Attendance Calculator

A fast, client-side, mobile-first web application designed for university students to calculate and project their attendance leading up to the **October 14th, 2026** attendance freeze.

## Key Highlights & Schedule

- **Freeze Date**: October 14th, 2026 EOD
- **Baseline Reference**: September 20th, 2026
- **Sessions Per Working Day**: 6 sessions (calculated on average; actual sessions vary per hall)
- **Planned Leaves Calculator**: Interactive calendar picker allowing students to select planned absent days up to October 14th and project their adjusted attendance accordingly.
- **Target Benchmark**: 70.00% minimum attendance
- **Dynamic Real-Time Session Engine**: Automatically decrements remaining sessions in real time in the background as each college period concludes (8:30 AM to 4:00 PM).

### Daily Session Timetable (8:30 AM – 4:00 PM)

| Slot | Time Period | Duration | Decrement Milestone |
| :--- | :--- | :--- | :--- |
| **Session 1** | 08:30 AM – 09:40 AM | 70 mins | Completes at 09:40 AM (1 done) |
| **Session 2** | 09:40 AM – 10:50 AM | 70 mins | Completes at 10:50 AM (2 done) |
| **Session 3** | 10:50 AM – 12:00 PM | 70 mins | Completes at 12:00 PM (3 done) |
| **Session 4** | 01:00 PM – 02:00 PM | 60 mins | Completes at 02:00 PM (4 done) |
| **Session 5** | 02:00 PM – 03:00 PM | 60 mins | Completes at 03:00 PM (5 done) |
| **Session 6** | 03:00 PM – 04:00 PM | 60 mins | Completes at 04:00 PM (6 done / EOD) |

---

### Schedule Calendar (Sep 21 – Oct 14, 2026)

| Date | Day | Type | Conducted Sessions |
| :--- | :--- | :--- | :---: |
| **Sep 21** | Mon | Normal Class | 6 |
| **Sep 22** | Tue | Normal Class | 6 |
| **Sep 23** | Wed | Normal Class | 6 |
| **Sep 24** | Thu | Normal Class | 6 |
| **Sep 25** | Fri | **Holiday** | 0 |
| **Sep 26** | Sat | Normal Class | 6 |
| **Sep 27** | Sun | **Sunday Holiday** | 0 |
| **Sep 28** | Mon | Normal Class | 6 |
| **Sep 29** | Tue | Normal Class | 6 |
| **Sep 30** | Wed | Normal Class | 6 |
| **Oct 01** | Thu | Normal Class | 6 |
| **Oct 02** | Fri | **Holiday (Gandhi Jayanti)** | 0 |
| **Oct 03** | Sat | Normal Class | 6 |
| **Oct 04** | Sun | **Sunday Holiday** | 0 |
| **Oct 05** | Mon | Normal Class | 6 |
| **Oct 06** | Tue | Normal Class | 6 |
| **Oct 07** | Wed | Normal Class | 6 |
| **Oct 08** | Thu | Normal Class | 6 |
| **Oct 09** | Fri | Normal Class | 6 |
| **Oct 10** | Sat | Normal Class | 6 |
| **Oct 11** | Sun | **Sunday Holiday** | 0 |
| **Oct 12** | Mon | Normal Class | 6 |
| **Oct 13** | Tue | Normal Class | 6 |
| **Oct 14** | Wed | **Freeze Date** | 6 |

---

## Tech Stack
- HTML5
- CSS3 (Custom Dark Theme & Micro-animations)
- JavaScript (Vanilla ES6+)

---
*Made with ❤️ & attendance panic 🤧 from Hall-1*
