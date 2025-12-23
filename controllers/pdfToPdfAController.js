const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

module.exports = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "PDF required" });

  const inputPath = path.resolve(req.file.path);
  const outputPath = path.resolve(
    __dirname,
    "../output",
    `pdfa-${Date.now()}.pdf`
  );

  // Ghostscript executable for Windows / Linux / Mac
  const gsCommand = process.platform === "win32" ? "gswin64c" : "gs";

  const args = [
    "-dPDFA=1",
    "-dBATCH",
    "-dNOPAUSE",
    "-dNOOUTERSAVE",
    "-sProcessColorModel=DeviceRGB",
    "-sDEVICE=pdfwrite",
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];

  const gs = spawn(gsCommand, args);

  gs.on("error", (err) => {
    console.error("Ghostscript execution failed:", err);
    fs.unlinkSync(inputPath);
    return res.status(500).json({ message: "Ghostscript not found or failed" });
  });

  gs.on("close", (code) => {
    fs.unlinkSync(inputPath);

    if (code !== 0) {
      console.error("Ghostscript exited with code", code);
      return res.status(500).json({ message: "Failed to convert PDF to PDF/A" });
    }

    res.download(outputPath, "pdfa.pdf", () => {
      fs.unlinkSync(outputPath);
    });
  });
};
