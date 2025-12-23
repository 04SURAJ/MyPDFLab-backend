const fs = require("fs-extra");
const path = require("path");
const poppler = require("pdf-poppler");
const archiver = require("archiver");

exports.pdfToImages = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No PDF uploaded" });

    const pdfPath = file.path;
    const outputDir = path.join("output", Date.now().toString());
    await fs.ensureDir(outputDir);

    const options = { format: "png", out_dir: outputDir, out_prefix: "page", dpi: 300 };
    await poppler.convert(pdfPath, options);

    const imageFiles = (await fs.readdir(outputDir)).filter(f => f.endsWith(".png"));
    if (imageFiles.length === 0) throw new Error("No images generated");

    const zipPath = `${outputDir}.zip`;
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip");
    archive.pipe(output);
    archive.directory(outputDir, false);
    await archive.finalize();

    output.on("close", async () => {
      res.download(zipPath, "pdf-images.zip", async () => {
        await fs.remove(pdfPath);
        await fs.remove(zipPath);
        await fs.remove(outputDir);
      });
    });

  } catch (err) {
    console.error("PDF to Image Error:", err);
    res.status(500).json({ error: "Failed to convert PDF to images" });
  }
};
