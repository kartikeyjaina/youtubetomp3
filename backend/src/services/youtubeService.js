const { spawn } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegStatic);

// ✅ GET VIDEO INFO
exports.getInfo = (url) => {
  return new Promise((resolve, reject) => {
    const process = spawn("yt-dlp", ["--dump-json", url]);

    let data = "";

    process.stdout.on("data", (chunk) => {
      data += chunk;
    });

    process.on("close", (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(data);
          resolve({ title: info.title });
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error("yt-dlp failed"));
      }
    });

    process.on("error", reject);
  });
};

// ✅ STREAM MP3
exports.streamMp3 = (url, res) => {
  const process = spawn("yt-dlp", ["-f", "bestaudio", "-o", "-", url]);

  process.on("error", (err) => {
    console.error("yt-dlp error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "yt-dlp failed" });
    }
  });

  ffmpeg(process.stdout)
    .audioBitrate(128)
    .format("mp3")
    .on("error", (err) => {
      console.error("ffmpeg error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Conversion failed" });
      }
    })
    .pipe(res, { end: true });
};
