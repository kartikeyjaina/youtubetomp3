const { spawn } = require("child_process");
const path = require("path");

// Paths
const ytDlpPath = path.join(__dirname, "../../yt-dlp");
const cookiesPath = path.join(__dirname, "../../cookies.txt");


// ✅ GET VIDEO INFO (FAST VERSION)
exports.getInfo = (url) => {
  return new Promise((resolve, reject) => {
    const process = spawn(ytDlpPath, [
      "--print", "title",
      "--cookies", cookiesPath,
      "--js-runtimes", "node",
      url,
    ]);

    let title = "";

    process.stdout.on("data", (chunk) => {
      title += chunk.toString();
    });

    process.stderr.on("data", (data) => {
      console.error("yt-dlp stderr:", data.toString());
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve({ title: title.trim() });
      } else {
        reject(new Error("yt-dlp failed"));
      }
    });

    process.on("error", reject);
  });
};


// ✅ STREAM MP3 (FASTEST VERSION - NO FFMPEG)
exports.streamMp3 = (url, res) => {
  // Set headers for download
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Disposition", `attachment; filename="audio.mp3"`);

  const process = spawn(ytDlpPath, [
    "-f", "bestaudio[ext=m4a]/bestaudio",
    "--extract-audio",
    "--audio-format", "mp3",
    "--audio-quality", "0",
    "--cookies", cookiesPath,
    "--no-playlist",
    "--no-warnings",
    "--js-runtimes", "node",
    "-o", "-",
    url,
  ]);

  process.stderr.on("data", (data) => {
    console.error("yt-dlp stderr:", data.toString());
  });

  process.on("error", (err) => {
    console.error("yt-dlp error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "yt-dlp failed" });
    }
  });

  // Kill process if it hangs (safety)
  const timeout = setTimeout(() => {
    process.kill("SIGKILL");
  }, 30000);

  process.on("close", () => {
    clearTimeout(timeout);
  });

  // 🚀 Direct streaming (fastest)
  process.stdout.pipe(res);
};