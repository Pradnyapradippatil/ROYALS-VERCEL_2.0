import os
import mysql.connector


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_db_connection():
    ssl_ca = os.getenv("DB_SSL_CA", "certs/ca.pem")

    if not os.path.isabs(ssl_ca):
        ssl_ca = os.path.join(BASE_DIR, ssl_ca)

    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        ssl_ca=ssl_ca,
        ssl_verify_cert=True
    )