const fs = require("fs-extra");
const path = require("path");
const { fromPath } = require("pdf2pic");
const archiver = require("archiver");

exports.pdfToImages = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No PDF uploaded" });

    const pdfPath = file.path;
    const outputDir = path.join("output", Date.now().toString());
    await fs.ensureDir(outputDir);

    const converter = fromPath(pdfPath, {
      density: 300,
      saveFilename: "page",
      savePath: outputDir,
      format: "png",
    });

    const totalPages = req.body.pages ? Number(req.body.pages) : undefined;

    const pages = await converter.bulk(totalPages || -1);
    if (!pages || pages.length === 0)
      throw new Error("Image conversion failed");

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
