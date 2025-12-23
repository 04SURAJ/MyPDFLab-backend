const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

exports.protectPdf = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "PDF required" });
  }

  const { userPassword, ownerPassword } = req.body;
  if (!userPassword || !ownerPassword) {
    return res.status(400).json({ message: "Password required" });
  }

  const inputPath = path.resolve(req.file.path);
  const outputPath = path.resolve(
    __dirname,
    "../output",
    `protected-${Date.now()}.pdf`
  );

  const qpdf = spawn("qpdf", [
    "--encrypt",
    userPassword,
    ownerPassword,
    "256",
    "--print=none",
    "--modify=none",
    "--extract=n",
    "--",
    inputPath,
    outputPath,
  ]);

  qpdf.on("error", (err) => {
    console.error("QPDF spawn error:", err);
    return res.status(500).json({ message: "QPDF failed to start" });
  });

  qpdf.on("close", (code) => {
    fs.unlinkSync(inputPath); // remove upload

    if (code !== 0) {
      return res.status(500).json({ message: "Failed to protect PDF" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=protected.pdf"
    );

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    stream.on("close", () => {
      fs.unlinkSync(outputPath); // cleanup output
    });
  });
};
