import requests
import base64
import json

with open("credentials.json", "r") as f:
	creds = json.load(f)

auth = "{}:{}".format(creds["id"], creds["secret"])
headers = {"Authorization": requests.auth.HTTPBasicAuth(creds["id"], creds["secret"])}
auth = requests.auth.HTTPBasicAuth(creds["id"], creds["secret"])
payload = {"grant_type": "client_credentials"}
r = requests.post("https://accounts.spotify.com/api/token", auth=auth, data=payload)
print(r.status_code)
print(r.text)
