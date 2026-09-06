import os
import sqlite3
import mysql.connector
from config import DB_CONFIG, SQLITE_DB_PATH

_USE_SQLITE_FALLBACK = False


class SQLiteCursorWrapper:
    def __init__(self, sqlite_cursor, dictionary=False):
        self._cursor = sqlite_cursor
        self._dictionary = dictionary

    def execute(self, query, params=None):
        translated = query.replace("%s", "?")
        translated = translated.replace(
            "id INT AUTO_INCREMENT PRIMARY KEY", "id INTEGER PRIMARY KEY AUTOINCREMENT"
        )
        translated = translated.replace(
            "id INT PRIMARY KEY AUTO_INCREMENT", "id INTEGER PRIMARY KEY AUTOINCREMENT"
        )
        translated = translated.replace("AUTO_INCREMENT", "")
        translated = translated.replace(
            "DATE_SUB(NOW(), INTERVAL 7 DAY)", "datetime('now', '-7 days')"
        )
        if params is not None:
            if isinstance(params, (list, tuple)):
                self._cursor.execute(translated, params)
            else:
                self._cursor.execute(translated, (params,))
        else:
            self._cursor.execute(translated)
        return self

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        if self._dictionary:
            return dict(row)
        return tuple(row)

    def fetchall(self):
        rows = self._cursor.fetchall()
        if self._dictionary:
            return [dict(r) for r in rows]
        return [tuple(r) for r in rows]

    @property
    def rowcount(self):
        return self._cursor.rowcount

    def close(self):
        try:
            self._cursor.close()
        except Exception:
            pass


class SQLiteConnectionWrapper:
    def __init__(self, sqlite_conn):
        self._conn = sqlite_conn
        self._conn.row_factory = sqlite3.Row

    def cursor(self, dictionary=False):
        return SQLiteCursorWrapper(self._conn.cursor(), dictionary=dictionary)

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        try:
            self._conn.close()
        except Exception:
            pass


def get_db_connection():
    global _USE_SQLITE_FALLBACK
    if _USE_SQLITE_FALLBACK:
        os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
        raw_conn = sqlite3.connect(SQLITE_DB_PATH, timeout=5)
        return SQLiteConnectionWrapper(raw_conn)

    try:
        return mysql.connector.connect(**DB_CONFIG)
    except Exception as err:
        print(f"MySQL Connection Note: {err}. Using local SQLite fallback ({SQLITE_DB_PATH}).")
        _USE_SQLITE_FALLBACK = True
        os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
        raw_conn = sqlite3.connect(SQLITE_DB_PATH, timeout=5)
        return SQLiteConnectionWrapper(raw_conn)


def init_db():
    """Initializes all database tables (users, admins, calculations) and seeds default admin."""
    from auth import generate_password_hash

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Users table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # 2. Admins table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # 3. Calculations table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS calculations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                city VARCHAR(255) NOT NULL,
                monthly_bill FLOAT NOT NULL,
                predicted_output FLOAT NOT NULL,
                monthly_savings FLOAT NOT NULL,
                payback_period FLOAT NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()

        # 4. Seed default admin if none exists
        cursor.execute("SELECT COUNT(*) FROM admins")
        admin_count = cursor.fetchone()[0]
        if admin_count == 0:
            default_admin_username = os.getenv("ADMIN_USERNAME", "admin")
            default_admin_password = os.getenv("ADMIN_PASSWORD", "Admin@123")
            default_admin_email = os.getenv("ADMIN_EMAIL", "admin@solisiq.local")
            hashed_admin_password = generate_password_hash(default_admin_password)
            cursor.execute(
                "INSERT INTO admins (username, email, password_hash) VALUES (%s, %s, %s)",
                (default_admin_username, default_admin_email, hashed_admin_password),
            )
            conn.commit()
            print(f"Default admin user '{default_admin_username}' initialized.")
    except Exception as exc:
        print(f"Database initialization warning: {exc}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
