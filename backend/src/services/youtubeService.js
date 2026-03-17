const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

exports.getInfo = async (url) => {
    const info = await ytdl.getInfo(url);
    return { title: info.videoDetails.title };
};

exports.streamMp3 = (url, res) => {
    const stream = ytdl(url, { quality: 'highestaudio' });

    ffmpeg(stream)
        .audioBitrate(128)
        .format('mp3')
        .on('error', (err) => {
            console.error(err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Conversion failed' });
            }
        })
        .pipe(res, { end: true });
};