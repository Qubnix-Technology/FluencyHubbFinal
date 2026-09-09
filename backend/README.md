# FluencyHubb Blog Backend

PHP/MySQL API for the React blog and admin panel.

## Setup

1. Create the database by importing:

   `backend/database/schema.sql`

2. If your MySQL settings are not the defaults, set these environment variables before running PHP:

   - `DB_HOST`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASS`

3. Start the API from the backend folder:

   `php -S localhost:8000`

4. Start the frontend from `EducationFrontend`:

   `npm run dev`

5. Open:

   - Blog: `http://localhost:5173/blog`
   - Admin: `http://localhost:5173/admin`

## Teacher Management API

The admin panel Teacher category uses these authenticated endpoints:

- `GET /teacher-management/list.php`
- `POST /teacher-management/save.php`
- `DELETE /teacher-management/delete.php`

Import `backend/database/schema.sql` again after pulling this feature so the `teachers` and `teacher_students` tables are available. The Teacher dashboard tracks assigned students, editable package classes, weekly attendance, remaining classes, per-class rates, weekly payments, and admin-only fee follow-up fields.

Default admin credentials are created automatically when the tables are available:

- Email: `admin@fluencyhubb.com`
- Password: `Admin@12345`

Change this password in the `admin_users` table before production use.
