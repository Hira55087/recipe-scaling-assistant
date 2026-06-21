import json
import re
import secrets
import hashlib
from pathlib import Path

USERS_PATH = Path(__file__).parent / "users.json"
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _load_users():
    if not USERS_PATH.exists():
        return {}
    try:
        return json.loads(USERS_PATH.read_text(encoding="utf-8")) or {}
    except Exception:
        return {}


def _save_users(users):
    USERS_PATH.write_text(json.dumps(users, indent=2, ensure_ascii=False), encoding="utf-8")


def _hash_password(password, salt):
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()


def register_user(username, password, email):
    """Create a new account. Returns (success: bool, message: str)."""
    username = (username or "").strip()
    password = password or ""
    email = (email or "").strip().lower()

    if not username or not password or not email:
        return False, "Username, password, and email are required."

    if len(username) < 3:
        return False, "Username must be at least 3 characters."

    if len(password) < 6:
        return False, "Password must be at least 6 characters."

    if not EMAIL_PATTERN.match(email):
        return False, "Please enter a valid email address."

    users = _load_users()

    if username in users:
        return False, "That username is already taken."

    if any(u.get("email") == email for u in users.values()):
        return False, "An account with that email already exists."

    salt = secrets.token_hex(16)
    users[username] = {
        "email": email,
        "salt": salt,
        "password_hash": _hash_password(password, salt),
    }
    _save_users(users)
    return True, "Account created! You can now log in."


def login_user(username, password):
    """Check credentials. Returns True/False."""
    username = (username or "").strip()
    password = password or ""

    users = _load_users()
    user = users.get(username)
    if not user:
        return False

    return _hash_password(password, user["salt"]) == user["password_hash"]