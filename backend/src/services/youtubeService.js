const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

// Use system-installed yt-dlp
const ytDlpPath = "yt-dlp";

exports.streamMp3 = (url, res, title) => {
    const ytDlpProcess = spawn(ytDlpPath, [
        '-f', 'bestaudio',
        '-o', '-',
        url
    ]);

    ytDlpProcess.on('error', (err) => {
        console.error("yt-dlp spawn error:", err);
    });

    ffmpeg(ytDlpProcess.stdout)
        .audioBitrate(128)
        .format('mp3')
        .on('error', (err) => {
            console.error('FFmpeg error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Audio conversion failed' });
            }
        })
        .pipe(res, { end: true });
};