import bcrypt

def check_password(password, hashed):
    # ensure password is bytes
    if isinstance(password, str):
        password = password.encode("utf-8")

    # ensure hashed is bytes (but don't double encode)
    if isinstance(hashed, str):
        hashed = hashed.encode("utf-8")

    return bcrypt.checkpw(password, hashed)