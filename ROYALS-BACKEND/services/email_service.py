import os

from utils.supabase_storage import supabase, BUCKET_NAME
from gmail_service import send_email


# ============================================================
# CONTACT FORM EMAILS
# ============================================================

def send_contact_emails(
    name,
    email,
    phone,
    company,
    service,
    message,
    source_page
):

    # --------------------------------------------------------
    # USER EMAIL
    # --------------------------------------------------------

    user_subject = "Thank you for contacting Royals Webtech"

    user_body = f"""
Hello {name},

Thank you for contacting Royals Webtech.

We have successfully received your requirement for {service}.

Our team will review your enquiry and get back to you shortly.

Regards,
Royals Webtech Team
"""

    print("CONTACT EMAIL: Sending user email...")

    send_email(
        recipient=email,
        subject=user_subject,
        body=user_body
    )

    print("CONTACT EMAIL: User email sent successfully.")


    # --------------------------------------------------------
    # HR EMAIL
    # --------------------------------------------------------

    hr_subject = f"New Website Enquiry - {service}"

    hr_body = f"""
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

    print("CONTACT EMAIL: Sending HR email...")

    send_email(
        recipient=os.getenv("HR_EMAIL"),
        subject=hr_subject,
        body=hr_body
    )

    print("CONTACT EMAIL: HR email sent successfully.")


# ============================================================
# CAREER FORM EMAILS
# ============================================================

def send_career_emails(
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

    # --------------------------------------------------------
    # APPLICANT EMAIL
    # --------------------------------------------------------

    user_subject = "Application Received - Royals Webtech"

    user_body = f"""
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

    print("CAREER EMAIL: Sending applicant email...")

    send_email(
        recipient=email,
        subject=user_subject,
        body=user_body
    )

    print("CAREER EMAIL: Applicant email sent successfully.")


    # --------------------------------------------------------
    # DOWNLOAD RESUME FROM SUPABASE
    # --------------------------------------------------------

    print("CAREER EMAIL: Downloading resume from Supabase...")

    resume_data = supabase.storage.from_(BUCKET_NAME).download(
        resume_path
    )

    print("CAREER EMAIL: Resume downloaded successfully.")


    # --------------------------------------------------------
    # HR EMAIL
    # --------------------------------------------------------

    hr_subject = f"New Career Application - {position}"

    hr_body = f"""
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

    print("CAREER EMAIL: Sending HR email with resume...")

    send_email(
        recipient=os.getenv("HR_EMAIL"),
        subject=hr_subject,
        body=hr_body,
        attachment_data=resume_data,
        attachment_filename=filename,
        attachment_content_type=resume_content_type
    )

    print("CAREER EMAIL: HR email sent successfully.")