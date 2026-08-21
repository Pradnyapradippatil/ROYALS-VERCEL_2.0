from flask import Blueprint, request, jsonify

from database.connection import get_db_connection
from services.email_service import send_contact_emails


contact_bp = Blueprint("contact", __name__)


@contact_bp.route("/api/contact", methods=["POST"])
def contact():

    conn = None
    cursor = None

    try:

        # ==========================================
        # GET FORM DATA
        # ==========================================

        data = request.get_json()

        print("Received contact form data:")
        print(data)

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received."
            }), 400

        name = data["name"]
        email = data["email"]
        phone = data["phone"]
        company = data["company"]
        service = data["service"]
        message = data["message"]
        source_page = data["sourcePage"]

        # ==========================================
        # SAVE TO DATABASE
        # ==========================================

        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO enquiries
            (name, email, phone, company, service, message, source_page)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            name,
            email,
            phone,
            company,
            service,
            message,
            source_page
        )

        cursor.execute(query, values)

        conn.commit()

        print("Enquiry saved to database.")

        # ==========================================
        # SEND EMAILS
        # ==========================================

       

        send_contact_emails(
            name,
            email,
            phone,
            company,
            service,
            message,
            source_page
        )

        # ==========================================
        # SUCCESS
        # ==========================================

        return jsonify({
            "success": True,
            "message": "Thank you! Your enquiry has been submitted successfully."
        }), 200

    except Exception as e:

        print("CONTACT ERROR:", e)

        if conn:
            conn.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to submit enquiry."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()