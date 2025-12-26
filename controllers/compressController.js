const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra");

exports.compressPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const inputPath = req.file.path;
    await fs.ensureDir("output"); // ensure folder exists

    const outputName = `compressed_${Date.now()}.pdf`;
    const outputPath = path.join("output", outputName);

    // Linux Ghostscript command
    const gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputPath} ${inputPath}`;

    exec(gsCommand, (err) => {
      if (err) {
        console.error("Ghostscript Error:", err);
        return res.status(500).json({ error: "Compression failed" });
      }

      res.download(outputPath, "compressed.pdf", async () => {
        await fs.remove(inputPath);
        await fs.remove(outputPath);
      });
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
