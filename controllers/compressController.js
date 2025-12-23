const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

exports.compressPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputName = `compressed_${Date.now()}.pdf`;
    const outputPath = path.join("output", outputName);

    const gsCommand = `"C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputPath} ${inputPath}`;

    exec(gsCommand, (err) => {
      if (err) {
        console.error("Ghostscript Error:", err);
        return res.status(500).json({ error: "Compression failed" });
      }

      res.download(outputPath, "compressed.pdf", () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
