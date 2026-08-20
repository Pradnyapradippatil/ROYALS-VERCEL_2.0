from fileinput import filename
import os
import traceback
from utils.supabase_storage import supabase, BUCKET_NAME
from flask import Blueprint, request, jsonify, current_app

from database.connection import get_db_connection

from services.email_service import send_career_emails

from utils.career_utils import (
    extract_detail,
    allowed_resume_file,
    secure_resume_filename
)


career_bp = Blueprint("career", __name__)


@career_bp.route("/api/career/apply", methods=["POST"])
def career_apply():

    conn = None
    cursor = None

    try:

        # ==========================================
        # GET FORM DATA
        # ==========================================

        print("========== CAREER FORM DATA ==========")
        print(request.form)
        print("======================================")

        name = request.form.get("name")
        email = request.form.get("email")
        phone = request.form.get("phone")
        position = request.form.get("position")
        application_type = request.form.get("applicationType")
        experience = request.form.get("experience")

        # Your current JavaScript combines
        # the remaining information into message.
        combined_message = request.form.get("message", "")

        # Resume
        resume = request.files.get("resume")

        # ==========================================
        # EXTRACT DETAILS
        # ==========================================

        location = extract_detail(combined_message, "Location:")
        college = extract_detail(combined_message, "College:")
        degree = extract_detail(combined_message, "Degree:")
        branch = extract_detail(combined_message, "Branch:")
        semester = extract_detail(combined_message, "Semester:")
        internship_skills = extract_detail(
            combined_message,
            "Skills:"
        )

        linkedin = extract_detail(
            combined_message,
            "LinkedIn:"
        )

        github = extract_detail(
            combined_message,
            "GitHub:"
        )

        portfolio = extract_detail(
            combined_message,
            "Portfolio:"
        )

        cover_message = extract_detail(
            combined_message,
            "Message:"
        )

        # ==========================================
        # DEBUG
        # ==========================================

        print("NAME:", name)
        print("EMAIL:", email)
        print("PHONE:", phone)
        print("LOCATION:", location)
        print("POSITION:", position)
        print("APPLICATION TYPE:", application_type)
        print("COLLEGE:", college)
        print("DEGREE:", degree)
        print("BRANCH:", branch)
        print("SEMESTER:", semester)
        print("SKILLS:", internship_skills)
        print("EXPERIENCE:", experience)
        print("LINKEDIN:", linkedin)
        print("GITHUB:", github)
        print("PORTFOLIO:", portfolio)
        print("COVER MESSAGE:", cover_message)
        print("RESUME:", resume.filename if resume else None)

        # ==========================================
        # BASIC VALIDATION
        # ==========================================

        if not application_type:

            return jsonify({
                "success": False,
                "message": "Application type is required."
            }), 400

        if not name or not email or not phone or not position:

            return jsonify({
                "success": False,
                "message": "Please fill in all required personal details."
            }), 400

        if not resume:

            return jsonify({
                "success": False,
                "message": "Please upload your resume."
            }), 400

        # ==========================================
        # RESUME VALIDATION
        # ==========================================

        original_filename = resume.filename or ""

        if not allowed_resume_file(original_filename):

            return jsonify({
                "success": False,
                "message": "Only PDF, DOC or DOCX resumes are allowed."
            }), 400

        # ==========================================
        # FILE SIZE
        # ==========================================

        resume.seek(0, os.SEEK_END)

        file_size = resume.tell()

        resume.seek(0)

        if file_size > 5 * 1024 * 1024:

            return jsonify({
                "success": False,
                "message": "Resume must be smaller than 5 MB."
            }), 400

        # ==========================================
        # SECURE FILENAME
        # ==========================================

        filename = secure_resume_filename(
            original_filename
        )

        # ==========================================
        # UPLOAD RESUME TO SUPABASE STORAGE
        # ==========================================

        resume_data = resume.read()

        storage_path = filename

        supabase.storage.from_(BUCKET_NAME).upload(
            path=storage_path,
            file=resume_data,
            file_options={
                "content-type": resume.content_type or "application/octet-stream",
                "upsert": "false"
            }
        )
        resume_path = storage_path
        print("Resume uploaded to Supabase:", storage_path)

       
        # ==========================================
        # PROFESSIONAL INFORMATION
        # ==========================================

        # Your current JavaScript does not send
        # these separately.
        #
        # Therefore we keep them empty,
        # exactly like your current working backend.

        current_company = ""
        expected_ctc = ""
        notice_period = ""
        job_skills = ""

        # ==========================================
        # SAVE APPLICATION TO MYSQL
        # ==========================================

        conn = get_db_connection()

        cursor = conn.cursor()

        query = """
            INSERT INTO career_applications
            (
                application_type,
                full_name,
                email,
                phone,
                location,
                position,
                college,
                degree,
                branch,
                semester,
                internship_skills,
                experience,
                current_company,
                expected_ctc,
                notice_period,
                job_skills,
                resume_filename,
                resume_path,
                linkedin,
                github,
                portfolio,
                message
            )
            VALUES
            (
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """

        values = (
            application_type,
            name,
            email,
            phone,
            location,
            position,
            college,
            degree,
            branch,
            semester,
            internship_skills,
            experience,
            current_company,
            expected_ctc,
            notice_period,
            job_skills,
            filename,
            resume_path,
            linkedin,
            github,
            portfolio,
            cover_message
        )

        cursor.execute(query, values)

        conn.commit()

        print("Career application saved to database.")

        # ==========================================
        # SEND EMAILS
        # ==========================================

        try:
            send_career_emails(
                current_app.extensions["mail"],
                name,
                email,
                phone,
                location,
                position,
                application_type,
                college,
                degree,
                branch,
                semester,
                internship_skills,
                experience,
                current_company,
                expected_ctc,
                notice_period,
                job_skills,
                linkedin,
                github,
                portfolio,
                cover_message,
                filename,
                resume_path,
                resume.content_type
            )

            print("Career emails sent successfully.")

        except Exception as email_error:
            import traceback
            print("CAREER EMAIL ERROR:", email_error)
            traceback.print_exc()

        # ==========================================
        # SUCCESS RESPONSE
        # ==========================================

        return jsonify({
            "success": True,
            "message": "Your application has been submitted successfully."
        }), 200


    except Exception as e:

        import traceback
        print("CAREER ERROR:", e)
        traceback.print_exc()

        if conn:
            conn.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to submit your application.",
            "error": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()