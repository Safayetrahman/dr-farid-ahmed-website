const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "samir7264";

const db = new Database(path.join(__dirname, "appointments.db"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  serial TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Basic ")) return res.status(401).set("WWW-Authenticate", 'Basic realm="Admin"').json({error:"Admin login required"});
  const decoded = Buffer.from(h.slice(6), "base64").toString();
  const i = decoded.indexOf(":");
  if (i < 0 || decoded.slice(0,i) !== ADMIN_USER || decoded.slice(i+1) !== ADMIN_PASS)
    return res.status(401).set("WWW-Authenticate", 'Basic realm="Admin"').json({error:"Invalid login"});
  next();
}

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function nextSerial() {
  const row = db.prepare("SELECT COUNT(*) c FROM appointments WHERE substr(created_at,1,10)=?").get(todayKey());
  return "F-" + String(row.c + 1).padStart(3, "0");
}

app.post("/api/appointments", (req,res)=>{
  const {name,phone,day,time,message=""} = req.body || {};
  if (!name || !phone || !day || !time) return res.status(400).json({error:"Required fields are missing"});
  const serial = nextSerial();
  const info = db.prepare(`
    INSERT INTO appointments(serial,name,phone,day,time,message,status)
    VALUES(?,?,?,?,?,?,'pending')
  `).run(serial,name.trim(),phone.trim(),day,time,message.trim());
  res.json({id: info.lastInsertRowid, serial, name, phone, day, time, message});
});

app.get("/api/appointments", auth, (req,res)=>{
  const date = req.query.date || todayKey();
  const rows = db.prepare("SELECT * FROM appointments WHERE substr(created_at,1,10)=? ORDER BY id").all(date);
  const stats = db.prepare(`SELECT
    COUNT(*) total,
    SUM(status='pending') pending,
    SUM(status='confirmed') confirmed,
    SUM(status='completed') completed,
    SUM(status='cancelled') cancelled
    FROM appointments WHERE substr(created_at,1,10)=?`).get(date);
  const current = db.prepare("SELECT * FROM appointments WHERE substr(created_at,1,10)=? AND status='confirmed' ORDER BY id LIMIT 1").get(date) || null;
  res.json({rows, stats, current});
});

app.patch("/api/appointments/:id", auth, (req,res)=>{
  const status = req.body.status;
  if (!["pending","confirmed","cancelled","completed"].includes(status))
    return res.status(400).json({error:"Invalid status"});
  db.prepare("UPDATE appointments SET status=? WHERE id=?").run(status, req.params.id);
  res.json({ok:true});
});


app.post("/api/appointments/next", auth, (req,res)=>{
  const date = todayKey();
  const row = db.prepare(`
    SELECT * FROM appointments
    WHERE substr(created_at,1,10)=? AND status='pending'
    ORDER BY id LIMIT 1
  `).get(date);
  if (!row) return res.json({row:null});
  db.prepare("UPDATE appointments SET status='confirmed' WHERE id=?").run(row.id);
  const updated = db.prepare("SELECT * FROM appointments WHERE id=?").get(row.id);
  res.json({row:updated});
});

app.delete("/api/appointments/:id", auth, (req,res)=>{
  db.prepare("DELETE FROM appointments WHERE id=?").run(req.params.id);
  res.json({ok:true});
});

app.get("*", (req,res)=>{
  res.sendFile(path.join(__dirname,"public","index.html"));
});

app.listen(PORT, ()=>console.log(`Dr Farid appointment system running on port ${PORT}`));
