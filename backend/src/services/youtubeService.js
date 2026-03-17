const { spawn } = require('child_process');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

// yt-dlp binary is in the backend root
const ytDlpPath = path.join(__dirname, '../../yt-dlp.exe');

exports.streamMp3 = (url, res, title) => {
    // We stream bestaudio and pipe it to fluent-ffmpeg to convert to MP3 on the fly
    const ytDlpProcess = spawn(ytDlpPath, [
        '-f', 'bestaudio',
        '-o', '-', // Output to stdout
        url
    ]);

    ffmpeg(ytDlpProcess.stdout)
        .audioBitrate(128)
        .format('mp3')
        .on('error', (err) => {
            console.error('Error during ffmpeg conversion:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Audio conversion failed' });
            }
        })
        .pipe(res, { end: true });

    ytDlpProcess.stderr.on('data', (data) => {
        // console.log(`yt-dlp log: ${data}`); // Optional: uncomment for debugging
    });

    ytDlpProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`yt-dlp process exited with code ${code}`);
        }
    });
};

exports.getInfo = (url) => {
    return new Promise((resolve, reject) => {
        const ytDlpProcess = spawn(ytDlpPath, [
            '--dump-json',
            url
        ]);

        let data = '';
        ytDlpProcess.stdout.on('data', (chunk) => {
            data += chunk;
        });

        ytDlpProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const info = JSON.parse(data);
                    resolve({ title: info.title });
                } catch (err) {
                    reject(err);
                }
            } else {
                reject(new Error(`yt-dlp process exited with code ${code}`));
            }
        });
    });
}
