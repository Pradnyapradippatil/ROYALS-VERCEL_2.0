import os
import base64
from email.message import EmailMessage

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def get_gmail_service():

    credentials = Credentials(
        token=None,
        refresh_token=os.getenv("GMAIL_REFRESH_TOKEN"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GMAIL_CLIENT_ID"),
        client_secret=os.getenv("GMAIL_CLIENT_SECRET"),
        scopes=SCOPES
    )

    return build(
        "gmail",
        "v1",
        credentials=credentials
    )


def send_email(
    recipient,
    subject,
    body,
    attachment_data=None,
    attachment_filename=None,
    attachment_content_type=None
):

    service = get_gmail_service()

    message = EmailMessage()

    message["From"] = os.getenv("GMAIL_SENDER")
    message["To"] = recipient
    message["Subject"] = subject

    message.set_content(body)

    if attachment_data is not None and attachment_filename:

        content_type = (
            attachment_content_type
            or "application/octet-stream"
        )

        if "/" in content_type:
            main_type, sub_type = content_type.split("/", 1)
        else:
            main_type = "application"
            sub_type = "octet-stream"

        message.add_attachment(
            attachment_data,
            maintype=main_type,
            subtype=sub_type,
            filename=attachment_filename
        )

    encoded_message = base64.urlsafe_b64encode(
        message.as_bytes()
    ).decode()

    result = service.users().messages().send(
        userId="me",
        body={"raw": encoded_message}
    ).execute()

    print("GMAIL API: Email sent successfully.")
    print("GMAIL MESSAGE ID:", result.get("id"))

    return result