import os


def configure_app(app):

    # ==========================================
    # UPLOAD CONFIGURATION
    # ==========================================

    upload_folder = os.path.join(
        app.root_path,
        "uploads",
        "resumes"
    )

    os.makedirs(upload_folder, exist_ok=True)

    app.config["UPLOAD_FOLDER"] = upload_folder

    app.config["MAX_CONTENT_LENGTH"] = (
        5 * 1024 * 1024
    )