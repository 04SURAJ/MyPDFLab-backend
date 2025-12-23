const express = require("express");
const router = express.Router();
const upload = require("../utils/multer"); // updated multer config

// Controllers
const mergeController = require("../controllers/mergeController");
const splitController = require("../controllers/splitController");
const { compressPdf } = require("../controllers/compressController");
const { pdfToImages } = require("../controllers/pdfToImageController");
const { imagesToPdf } = require("../controllers/imagesToPdfController");
const { rotatePdf } = require("../controllers/rotatePdfController");
const { reorderPdfPages } = require("../controllers/reorderController");
const { deletePages } = require("../controllers/deletePagesController");
const { extractText } = require("../controllers/extractTextController");
const watermarkController = require("../controllers/watermarkController");
const { protectPdf } = require("../controllers/protectController");
const { unlockPdf } = require("../controllers/unlockController");
const addPageNumbersController = require("../controllers/addPageNumbersController");
const pdfToPdfAController = require("../controllers/pdfToPdfAController");
const { cropPdf } = require("../controllers/cropController");


// Routes
router.post("/merge", upload.array("pdfs", 10), mergeController); // multiple PDFs
router.post("/split", upload.single("pdf"), splitController);
router.post("/compress", upload.single("pdf"), compressPdf);
router.post("/rotate-pdf", upload.single("pdf"), rotatePdf);
router.post("/pdf-to-images", upload.single("pdf"), pdfToImages);
router.post("/images-to-pdf", upload.array("images", 50), imagesToPdf);
router.post("/reorder", upload.single("pdf"), reorderPdfPages);
router.post("/delete-pages", upload.single("pdf"), deletePages);
router.post("/extract-text", upload.single("pdf"), extractText);
router.post(
  "/watermark",
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  watermarkController
);

router.post("/protect", upload.single("pdf"), protectPdf);
router.post("/unlock", upload.single("pdf"), unlockPdf);
router.post(
  "/add-page-numbers",
  upload.single("pdf"),
  addPageNumbersController
);
router.post(
  "/pdf-to-pdfa",
  upload.single("pdf"),
  pdfToPdfAController
);
router.post("/crop", upload.single("pdf"), cropPdf);

module.exports = router;
