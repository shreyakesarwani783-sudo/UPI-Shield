import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "history.db")

def _get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = _get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            risk_score INTEGER,
            level TEXT,
            confidence REAL,
            reasons TEXT,
            explanation TEXT,
            timestamp TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            reason TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_scan(url, risk_score, level, confidence, reasons, explanation):
    conn = _get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO scans (url, risk_score, level, confidence, reasons, explanation, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (url, risk_score, level, confidence, json.dumps(reasons), explanation, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()

def save_report(url, reason):
    conn = _get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO reports (url, reason, timestamp) VALUES (?, ?, ?)",
        (url, reason, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()

def get_stats():
    conn = _get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) as c FROM scans")
    total_scans = cur.fetchone()["c"]

    cur.execute("SELECT COUNT(*) as c FROM scans WHERE level = 'Safe'")
    safe = cur.fetchone()["c"]

    cur.execute("SELECT COUNT(*) as c FROM scans WHERE level IN ('Caution','Warning','Critical')")
    flagged = cur.fetchone()["c"]

    cur.execute("SELECT COUNT(*) as c FROM reports")
    reports = cur.fetchone()["c"]

    conn.close()
    return {
        "total_scans": total_scans,
        "safe": safe,
        "flagged": flagged,
        "reports": reports
    }

def get_recent_flagged(limit=20):
    conn = _get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT url, risk_score, level, timestamp FROM scans
        WHERE level IN ('Warning','Critical')
        ORDER BY id DESC LIMIT ?
    """, (limit,))
    rows = cur.fetchall()
    conn.close()
    return [
        {
            "url": r["url"],
            "score": r["risk_score"],
            "level": r["level"],
            "date": r["timestamp"][:10]
        } for r in rows
    ]

def get_recent_reports(limit=20):
    conn = _get_connection()
    cur = conn.cursor()
    cur.execute("SELECT url, reason, timestamp FROM reports ORDER BY id DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()
    return [
        {
            "url": r["url"],
            "reason": r["reason"] or "Reported by user",
            "date": r["timestamp"][:10],
            "status": "Pending"
        } for r in rows
    ]