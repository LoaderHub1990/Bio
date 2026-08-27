# DiscordBio — Discord Login Bio Page Starter

เว็บ Bio Page แบบมี Discord OAuth Login จริง ดึงรูปโปรไฟล์/กรอบ (avatar decoration)/ชื่อจริงจาก Discord
พร้อมแดชบอร์ดตั้งค่าละเอียด: เอฟเฟกต์ตัวหนังสือ, พื้นหลัง (สี/ไล่สี/รูป/วิดีโอ), เอฟเฟกต์พื้นหลัง (particles/snow/stars), glow effects, ลิงก์โซเชียล

## วิธีติดตั้ง

### 1. สร้าง Discord Application
1. ไปที่ https://discord.com/developers/applications
2. กด **New Application** ตั้งชื่อตามใจ
3. แท็บ **OAuth2** → คัดลอก **Client ID** และ **Client Secret**
4. ในหน้าเดียวกัน ที่ **Redirects** กด **Add Redirect** ใส่:
   - ตอนเทสในเครื่อง: `http://localhost:3000/auth/discord/callback`
   - ตอน deploy จริง: `https://โดเมนของคุณ/auth/discord/callback`

### 2. ตั้งค่า Environment
```bash
cp .env.example .env
```
แล้วแก้ไฟล์ `.env` ใส่ค่า `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI` ให้ตรงกับที่สร้างไว้

### 3. ติดตั้งและรัน
```bash
npm install
npm start
```
เปิด http://localhost:3000

## โครงสร้างโปรเจกต์
```
server.js          → Express server, OAuth flow, routes
db.js               → เก็บข้อมูลผู้ใช้แบบ JSON file (data/db.json)
views/
  index.ejs          → หน้า Landing + ปุ่ม Login Discord
  dashboard.ejs       → หน้าตั้งค่า (protected, ต้อง login ก่อน)
  profile.ejs         → หน้าโปรไฟล์สาธารณะ /u/:username
public/
  css/style.css       → สไตล์รวมทั้งเอฟเฟกต์ตัวหนังสือ/glow
  js/dashboard.js     → ฟอร์มตั้งค่า + บันทึกผ่าน /api/save
  js/profile.js       → เอฟเฟกต์พื้นหลัง (canvas: particles/snow/stars)
```

## ฟีเจอร์ที่ทำงานจริงแล้ว
- ✅ Discord OAuth2 Login (ต้องกรอก Client ID/Secret เอง)
- ✅ ดึง avatar, avatar decoration (กรอบรูปจริง), username, global name จาก Discord API จริง
- ✅ แดชบอร์ดตั้งค่า: display name, bio, location, เอฟเฟกต์ข้อความ (rainbow/glitch/typewriter)
- ✅ พื้นหลัง: สีพื้น / ไล่สี / รูปภาพ (URL) / วิดีโอ (URL)
- ✅ เอฟเฟกต์พื้นหลัง: particles / หิมะตก / ดาวกะพริบ (วาดด้วย canvas)
- ✅ Glow effect แยกเปิด/ปิดได้ทีละส่วน (username, description, location, socials)
- ✅ ลิงก์โซเชียลเพิ่ม/ลบได้ไม่จำกัด
- ✅ พรีวิวสดในแดชบอร์ด (iframe)

## ข้อจำกัด / สิ่งที่ควรทำต่อถ้าจะขึ้น production จริง
- **Database**: ตอนนี้ใช้ไฟล์ JSON (`data/db.json`) เก็บข้อมูล เหมาะกับทดสอบ/ผู้ใช้น้อย ถ้าจะสเกลจริงควรเปลี่ยนเป็น PostgreSQL/MySQL/MongoDB
- **File upload**: ยังไม่มีระบบอัปโหลดไฟล์รูป/วิดีโอ/เสียงจริง (ตอนนี้รับเป็น URL เท่านั้น) ต้องเพิ่ม storage เช่น S3/Cloudflare R2 ถ้าต้องการอัปโหลดไฟล์ตรงๆ
- **Custom domain / analytics / premium billing**: ยังไม่ได้ทำ เป็นฟีเจอร์ระดับ SaaS ที่ต้องออกแบบเพิ่ม
- **Rate limiting / security hardening**: ควรเพิ่ม helmet, rate-limit, CSRF protection ก่อนเปิดใช้งานสาธารณะจริง
