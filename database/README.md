# Database Seeders

## Overview
Seeder adalah script untuk mengisi database dengan data awal yang diperlukan untuk development dan testing.

## Available Seeders

### User Seeder
Membuat 6 user dengan berbagai role untuk testing aplikasi:

1. **Super Admin** - `superadmin@example.com`
2. **Admin Global** - `adminglobal@example.com`
3. **Agency** - `agency@example.com`
4. **Admin Agency** - `adminagency@example.com`
5. **Regular User 1** - `user1@example.com`
6. **Regular User 2** - `user2@example.com`

**Default Password:** `password123`

## Commands

### Normal Seeding
Menjalankan seeder tanpa menghapus data yang sudah ada:
```bash
npm run seed
```

### Force Seeding
Menghapus semua data user yang ada dan membuat data baru:
```bash
npm run seed:force
```

## File Structure

```
database/
├── seeders/
│   ├── index.js        # Main seeder runner
│   ├── userSeeder.js   # User seeder (safe mode)
│   └── forceSeed.js    # Force seeder (destructive)
└── README.md           # This documentation
```

## Usage

1. Pastikan database sudah terhubung dengan benar
2. Jalankan migration terlebih dahulu:
   ```bash
   npx prisma migrate dev
   ```
3. Jalankan seeder:
   ```bash
   npm run seed:force
   ```

## Test Credentials

Setelah menjalankan seeder, Anda dapat login dengan:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@example.com | password123 |
| Admin Global | adminglobal@example.com | password123 |
| Agency | agency@example.com | password123 |
| Admin Agency | adminagency@example.com | password123 |
| User | user1@example.com | password123 |
| User | user2@example.com | password123 |

## Notes

- Semua password di-hash menggunakan bcrypt
- Force seeding akan menghapus SEMUA data user yang ada
- Seeder akan skip jika data sudah ada (kecuali force seed)
- Pastikan untuk menggunakan data yang berbeda di production 