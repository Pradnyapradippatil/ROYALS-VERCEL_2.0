import os

from flask_mail import Message
from utils.supabase_storage import supabase, BUCKET_NAME

def send_contact_emails(mail, name, email, phone, company, service, message, source_page):
    # ==========================================
    # USER EMAIL
    # ==========================================

    user_msg = Message(
        subject="Thank you for contacting Royals Webtech",
        sender=os.getenv("MAIL_USERNAME"),
        recipients=[email]
    )

    user_msg.body = f"""
Hello {name},

Thank you for contacting Royals Webtech.

We have successfully received your requirement for {service}.

Our team will review your enquiry and get back to you shortly.

Regards,
Royals Webtech Team
"""

    # ==========================================
    # HR EMAIL
    # ==========================================

    hr_msg = Message(
        subject=f"New Website Enquiry - {service}",
        sender=os.getenv("MAIL_USERNAME"),
        recipients=[os.getenv("HR_EMAIL")]
    )

    hr_msg.body = f"""
A new enquiry has been submitted from the website.

Name      : {name}
Email     : {email}
Phone     : {phone}
Company   : {company}
Service   : {service}

Requirement:
{message}

Source:
{source_page}
"""

    # ==========================================
    # SEND
    # ==========================================

    print("EMAIL: Sending user email...")
    mail.send(user_msg)
    print("EMAIL: User email sent successfully.")

    print("EMAIL: Sending HR email...")
    mail.send(hr_msg)
    print("EMAIL: HR email sent successfully.")


def send_career_emails(
    mail,
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
    resume_content_type
):
    # ==========================================
    # APPLICANT EMAIL
    # ==========================================

    user_msg = Message(
        subject="Application Received - Royals Webtech",
        sender=os.getenv("MAIL_USERNAME"),
        recipients=[email]
    )

    user_msg.body = f"""
Hello {name},

Thank you for applying to Royals Webtech.

We have successfully received your application.

Position         : {position}
Application Type : {application_type}

Our HR team will review your profile and resume.

If your profile matches our requirements,
our team will contact you.

Regards,
Royals Webtech Team
"""

    # ==========================================
    # HR EMAIL
    # ==========================================

    hr_msg = Message(
        subject=f"New Career Application - {position}",
        sender=os.getenv("MAIL_USERNAME"),
        recipients=[os.getenv("HR_EMAIL")]
    )

    hr_msg.body = f"""
A new career application has been submitted
from the Royals Webtech website.

APPLICANT DETAILS
-----------------

Name             : {name}
Email            : {email}
Phone            : {phone}
Location         : {location}
Position         : {position}
Application Type : {application_type}


ACADEMIC INFORMATION
--------------------

College          : {college}
Degree           : {degree}
Branch           : {branch}
Semester         : {semester}
Skills           : {internship_skills}


PROFESSIONAL INFORMATION
------------------------

Experience       : {experience}
Current Company  : {current_company}
Expected CTC     : {expected_ctc}
Notice Period    : {notice_period}
Job Skills       : {job_skills}


ONLINE PROFILES
---------------

LinkedIn         : {linkedin}
GitHub           : {github}
Portfolio        : {portfolio}


COVER LETTER / MESSAGE
----------------------

{cover_message}


RESUME
------

{filename}
"""

    # ==========================================
    # DOWNLOAD RESUME FROM SUPABASE
    # ==========================================

    resume_data = supabase.storage.from_(BUCKET_NAME).download(
        resume_path
    )

    # ==========================================
    # ATTACH RESUME TO HR EMAIL
    # ==========================================

    hr_msg.attach(
        filename=filename,
        content_type=resume_content_type or "application/octet-stream",
        data=resume_data
    )

    # ==========================================
    # SEND EMAILS
    # ==========================================

    print("CAREER EMAIL: Sending applicant email...")
    mail.send(user_msg)
    print("CAREER EMAIL: Applicant email sent successfully.")

    print("CAREER EMAIL: Sending HR email...")
    mail.send(hr_msg)
    print("CAREER EMAIL: HR email sent successfully.")