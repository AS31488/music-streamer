require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/search', async (req, res) => {
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
                videoCategoryId: '10', // Music category
                maxResults: 20 // Fetch 20 songs
            }
        });

        // Map the results to a cleaner format
        const songs = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.default.url
        }));

        res.json(songs);

    } catch (error) {
        console.error("YouTube API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch music' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});