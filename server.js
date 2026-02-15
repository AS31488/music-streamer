require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

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
        const baseUrl = 'https://www.googleapis.com/youtube/v3/search';
        const params = {
            part: 'snippet',
            q: q,
            key: process.env.YOUTUBE_API_KEY,
            type: 'video',
            videoCategoryId: '10', // Music
            maxResults: 50 // Max allowed per call
        };

        // 1. Fetch the first 50 results
        const firstResponse = await axios.get(baseUrl, { params });
        let allItems = firstResponse.data.items || [];
        const nextPageToken = firstResponse.data.nextPageToken;

        // 2. If there is a next page, fetch the next 50
        if (nextPageToken) {
            const secondResponse = await axios.get(baseUrl, {
                params: { ...params, pageToken: nextPageToken }
            });
            // Combine the two lists
            allItems = allItems.concat(secondResponse.data.items || []);
        }

        // 3. Format the data for the frontend
        const songs = allItems.map(item => ({
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