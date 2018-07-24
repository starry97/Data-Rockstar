import requests
import base64
import json
import sys

if len(sys.argv) < 2:
	print("no song id specified!")
	sys.exit()

with open("credentials.json", "r") as f:
	creds = json.load(f)

# get an access token
auth = requests.auth.HTTPBasicAuth(creds["id"], creds["secret"])
payload = {"grant_type": "client_credentials"}
token_response = requests.post("https://accounts.spotify.com/api/token", auth=auth, data=payload)
print(token_response.status_code)
print(token_response.text)
token = token_response.json()["access_token"]

# use that token to get song info
headers = {"Authorization": "Bearer %s"%(token)}
url = "https://api.spotify.com/v1/tracks/" + sys.argv[1]
song_response = requests.get(url, headers=headers)
print(song_response.status_code)
print(song_response.text)
