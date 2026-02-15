require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// FIX 1: Serve files from the main directory (where index.html is)
app.use(express.static(__dirname));

// FIX 2: Change route to match frontend ('/api/search')
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return res.status(400).json({ error: 'Query parameter required' });
    }

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: q,
                key: process.env.YOUTUBE_API_KEY,
                type: 'video',
                videoCategoryId: '10',
                maxResults: 20
            }
        });

        const songs = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.default.url
        }));

        res.json(songs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch music' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});