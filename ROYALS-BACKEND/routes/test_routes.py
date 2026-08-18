from flask import Blueprint, jsonify

from database.connection import get_db_connection


test_bp = Blueprint("test", __name__)


@test_bp.route("/api/test-db", methods=["GET"])
def test_db():

    conn = None
    cursor = None

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT 1")
        result = cursor.fetchone()

        return jsonify({
            "success": True,
            "message": "Database connected successfully",
            "result": result[0]
        })

    except Exception as e:

        print("DATABASE ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()