import spotipy
from spotipy.oauth2 import SpotifyOAuth
import csv


CLIENT_ID = '504cbf0e6b2e421998722d1a2d189a90'
CLIENT_SECRET = 'b105870a0f444914b4fe2bbc4582700a'
REDIRECT_URI = 'http://localhost:8888/callback'

# Spotify API yetkilendirme
scope = 'user-library-read'
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope=scope))

# Beğenilen şarkıları çek
results = sp.current_user_saved_tracks(limit=50)
tracks = []

while results:
    for item in results['items']:
        track = item['track']
        tracks.append([track['name'], track['artists'][0]['name'], track['album']['name']])

    # Sonraki sayfaya geç
    results = sp.next(results) if results['next'] else None

# Veriyi CSV dosyasına yaz
with open('liked_songs.csv', mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(["Song Name", "Artist", "Album"])
    writer.writerows(tracks)

print("Beğenilen şarkılar başarıyla 'liked_songs.csv' dosyasına kaydedildi.")

