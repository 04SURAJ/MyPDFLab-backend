const express = require("express");
const cors = require("cors");
const pdfRoutes = require("./routes/pdfRoutes");

const app = express();

// Enable CORS
app.use(cors({
  origin: "*",
  methods: ["GET","POST"],
}));

// Parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Mount PDF routes under /api/pdf
app.use("/api/pdf", pdfRoutes);

// Health check / root route
app.get("/", (req, res) => {
  res.send({
    status: "ok",
    message: "PDF Backend is running ✅",
    routes: {
      compress: "/api/pdf/compress",
      merge: "/api/pdf/merge",
      split: "/api/pdf/split",
      rotate: "/api/pdf/rotate-pdf",
      pdfToImages: "/api/pdf/pdf-to-images",
      imagesToPdf: "/api/pdf/images-to-pdf",
      reorder: "/api/pdf/reorder",
      deletePages: "/api/pdf/delete-pages",
      extractText: "/api/pdf/extract-text",
      watermark: "/api/pdf/watermark",
      protect: "/api/pdf/protect",
      unlock: "/api/pdf/unlock",
      addPageNumbers: "/api/pdf/add-page-numbers",
      pdfToPdfA: "/api/pdf/pdf-to-pdfa",
      crop: "/api/pdf/crop",
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
