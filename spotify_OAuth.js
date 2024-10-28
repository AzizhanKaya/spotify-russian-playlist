const clientId = 'a93446e4b03243dc9277d86767c38e72';
export const redirectUri = 'https://azizhankaya.github.io/spotify-russian-playlist';
const scopes = 'user-read-private user-read-email playlist-read-private user-library-read playlist-modify-private';

const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

export function redirectToSpotifyAuth() {
    window.location.href = authUrl;
}

export function getAccessTokenFromUrl() {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    return params.get('access_token');
}
