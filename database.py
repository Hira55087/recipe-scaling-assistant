import sqlite3

def get_connection():
    conn = sqlite3.connect("users.db", check_same_thread=False)
    return conn

def create_users_table():
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)

    conn.commit()
    conn.close()

create_users_table()