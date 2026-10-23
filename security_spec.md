# Security Specification: 8F Web Class

## 1. Data Invariants
1. **User Identity Invariant:** A user can only create/update their own profile (`users/{userId}` where `userId == request.auth.uid`). Users cannot elevate their own role to `admin` or `super_admin`.
2. **Admin Privilege Invariant:** Only users in the `admins` collection or pre-configured bootstrap admin (`thozstorez1@gmail.com`) can create or modify announcements, schedules, class rules, and manage user roles.
3. **Chat Message Integrity Invariant:** `senderId` in any message must strictly match `request.auth.uid`. A user can only delete their own messages, while admins can moderate and delete any message.
4. **Assignment Tracking Invariant:** Any authenticated student can update the `completedBy` array for their own completion marker, but only admins can create, modify subject details, or delete assignments.
5. **Memory & Gallery Safety Invariant:** Users can only create memory items with their own `uploaderId == request.auth.uid` and delete their own items (or admins can moderate).
6. **Suggestions Box Privacy Invariant:** Suggestions can only be read by the sender (`senderId == request.auth.uid`) or authorized admins to maintain confidentiality.

---

## 2. The "Dirty Dozen" Test Payloads

1. **Payload 1 (Self-Privilege Escalation):**
   Unprivileged user writes to `/users/{userId}` setting `role: "super_admin"`.
   *Expected:* `PERMISSION_DENIED`.

2. **Payload 2 (Admin Registry Hijack):**
   Non-admin creates a document in `/admins/{attackerId}`.
   *Expected:* `PERMISSION_DENIED`.

3. **Payload 3 (Announcement Forgery):**
   Unauthenticated or regular student writes to `/announcements/{id}`.
   *Expected:* `PERMISSION_DENIED`.

4. **Payload 4 (Identity Spoofing in Global Chat):**
   User A sends message with `senderId: "UserB"`.
   *Expected:* `PERMISSION_DENIED`.

5. **Payload 5 (Malicious Message Deletion):**
   User A attempts to delete User B's message in `/globalMessages/{msgId}` without admin role.
   *Expected:* `PERMISSION_DENIED`.

6. **Payload 6 (Unauthorized Assignment Tampering):**
   Regular student attempts to delete or change assignment description in `/assignments/{id}`.
   *Expected:* `PERMISSION_DENIED`.

7. **Payload 7 (Class Schedule Manipulation):**
   Non-admin attempts to modify timetable in `/schedules/{id}`.
   *Expected:* `PERMISSION_DENIED`.

8. **Payload 8 (Duty Schedule Tampering):**
   Non-admin attempts to alter cleaning roster in `/dutySchedules/{id}`.
   *Expected:* `PERMISSION_DENIED`.

9. **Payload 9 (Calendar Event Vandalism):**
   Non-admin attempts to delete school exam dates in `/calendarEvents/{id}`.
   *Expected:* `PERMISSION_DENIED`.

10. **Payload 10 (Snooping on Private Suggestions):**
    Student A attempts to read Student B's suggestion in `/suggestions/{id}`.
    *Expected:* `PERMISSION_DENIED`.

11. **Payload 11 (Website Setting Override):**
    Non-admin user attempts to change site name or maintenance mode in `/websiteSettings/general`.
    *Expected:* `PERMISSION_DENIED`.

12. **Payload 12 (Unauthenticated Write):**
    Unauthenticated request attempts to create a message or update profile.
    *Expected:* `PERMISSION_DENIED`.
