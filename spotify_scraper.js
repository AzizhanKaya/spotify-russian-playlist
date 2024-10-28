import { redirectToSpotifyAuth, getAccessTokenFromUrl, redirectUri } from './spotify_OAuth.js';

const apiUrl = 'https://api.spotify.com/v1/me/tracks';
const russianSongs = [];

function containsCyrillic(text) {
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        if ((charCode >= 0x0400 && charCode <= 0x04FF) || // Cyrillic
            (charCode >= 0x0500 && charCode <= 0x052F) || // Cyrillic Supplement
            (charCode >= 0x2DE0 && charCode <= 0x2DFF) || // Cyrillic Extended-A
            (charCode >= 0xA640 && charCode <= 0xA69F)) { // Cyrillic Extended-B
            return true;
        }
    }
    return false;
}


export let offset = 0;
async function fetchLikedSongs(url, access_token) {
    const limit = 50;
    
    while (true) {
        const response = await fetch(`${url}?limit=${limit}&offset=${offset}`, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        const data = await response.json();
        if (!data.items || data.items.length === 0) break;

        data.items.forEach(item => {
            const track = item.track;
            const artistName = track.artists[0].name;
            const albumName = track.album.name;
            const songName = track.name;

            
            if (containsCyrillic(songName) || containsCyrillic(albumName)) {
                russianSongs.push({
                    songName: songName,
                    artist: artistName,
                    album: albumName,
                    uri: track.uri
                });
                console.log(data.items.length);
            }
        });
        offset += limit;
        if (!data.next) break;
        
    }
}


async function createSpotifyPlaylist(access_token) {
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const userData = await userResponse.json();

    const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: "My Russian Playlist",
            description: "Playlist of Russian songs from my liked tracks",
            public: false
        })
    });

    const playlistData = await playlistResponse.json();
    return playlistData.id;
}

async function addSongsToPlaylist(playlistId, access_token) {
    const uris = russianSongs.map(song => song.uri);

    await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: uris })
    });
}

export async function getTotalSavedSongs(access_token) {
    debugger
    const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const data = await response.json();
    return data.total;
}

export async function createPlaylist(access_token) {
    
    
    if (access_token) {
        
        await fetchLikedSongs(apiUrl, access_token);

        if (russianSongs.length > 0) {
            const playlistId = await createSpotifyPlaylist(access_token);
            await addSongsToPlaylist(playlistId, access_token);

            
            const iframe = document.createElement('iframe');
            iframe.src = `https://open.spotify.com/embed/playlist/${playlistId}`;
            iframe.width = "400";
            iframe.height = "500";
            iframe.style.border = "none";
            iframe.allow = "encrypted-media";
            const playlist = document.querySelector('.playlist')
            playlist.appendChild(iframe);
        } else {
            console.log("No Russian songs found in your liked songs.");
        }

        window.history.replaceState({}, document.title, redirectUri);
    } else {
        redirectToSpotifyAuth();
    }
}


