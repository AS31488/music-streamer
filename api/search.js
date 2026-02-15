const axios = require('axios');

// CHANGE HERE: Use module.exports instead of export default
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

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
            videoCategoryId: '10',
            maxResults: 50
        };

        const firstResponse = await axios.get(baseUrl, { params });
        let allItems = firstResponse.data.items || [];
        const nextPageToken = firstResponse.data.nextPageToken;

        if (nextPageToken) {
            const secondResponse = await axios.get(baseUrl, {
                params: { ...params, pageToken: nextPageToken }
            });
            allItems = allItems.concat(secondResponse.data.items || []);
        }

        const songs = allItems.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.default.url
        }));

        res.status(200).json(songs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch music' });
    }
};