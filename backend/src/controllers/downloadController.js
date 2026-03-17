const youtubeService = require('../services/youtubeService');

exports.downloadMp3 = async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl || !videoUrl.includes('youtube.com/') && !videoUrl.includes('youtu.be/')) {
        return res.status(400).json({ error: 'Invalid or missing YouTube URL' });
    }

    try {
        const info = await youtubeService.getInfo(videoUrl);
        const title = info.title.replace(/[^\w\s-]/gi, ''); // Sanitize filename

        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');

        youtubeService.streamMp3(videoUrl, res, title);
    } catch (error) {
        console.error('Error in download controller:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process video' });
        }
    }
};
