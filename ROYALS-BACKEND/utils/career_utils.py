from werkzeug.utils import secure_filename


def extract_detail(message, label):
    """
    Extract a value from the combined career message.

    Example:

    Location: Jalgaon
    College: GCOEJ

    extract_detail(message, "Location:")
    returns:
    Jalgaon
    """

    if not message:
        return ""

    for line in message.splitlines():

        if line.startswith(label):
            return line[len(label):].strip()

    return ""


def allowed_resume_file(filename):
    """
    Check whether the uploaded resume
    has an allowed extension.
    """

    allowed_extensions = {"pdf", "doc", "docx"}

    if not filename or "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[-1].lower()

    return extension in allowed_extensions


def secure_resume_filename(filename):
    """
    Make the uploaded filename safe.
    """

    return secure_filename(filename)