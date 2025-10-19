import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);