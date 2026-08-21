from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

flow = InstalledAppFlow.from_client_secrets_file(
    "client_secret_817954711444-rrdthpmc0ujqro8nqaipph9lk909q0h9.apps.googleusercontent.com.json",
    SCOPES
)

credentials = flow.run_local_server(port=0)

with open("token.json", "w") as token:
    token.write(credentials.to_json())

print("Gmail authorization successful!")
print("token.json created.")