const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

exports.unlockPdf = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "PDF required" });
  }

  const password = req.body.password || "";
  const inputPath = path.resolve(req.file.path);
  const outputPath = path.resolve(
    __dirname,
    "../output",
    `unlocked-${Date.now()}.pdf`
  );

  const args = [];

  if (password) {
    args.push(`--password=${password}`);
  }

  args.push(
    inputPath,
    "--decrypt",
    "--",
    outputPath
  );

  const qpdf = spawn("qpdf", args);

  qpdf.on("close", (code) => {
    fs.unlinkSync(inputPath);

      if (code !== 0) {
    return res.status(401).json({
      error: "WRONG_PASSWORD",
      message: "Incorrect password",
    });
  }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=unlocked.pdf"
    );

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    stream.on("close", () => {
      fs.unlinkSync(outputPath);
    });
  });
};
