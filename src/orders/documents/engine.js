import { buildDocumentHtml } from "./layouts";

function ensureFrame() {
  let iframe = document.getElementById("pahachan-doc-print-frame");
  if (iframe) iframe.remove();
  iframe = document.createElement("iframe");
  iframe.id = "pahachan-doc-print-frame";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);
  return iframe;
}

export function printDocumentHtml(html) {
  const iframe = ensureFrame();
  const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!frameDoc || !iframe.contentWindow) {
    iframe.remove();
    return false;
  }
  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const run = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 1200);
    }
  };

  if (frameDoc.readyState === "complete") run();
  else {
    iframe.onload = run;
    window.setTimeout(run, 300);
  }
  return true;
}

export function downloadDocumentHtml(html, filename) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

/** Download HTML that users can open and Print → Save as PDF from the browser. */
export function downloadDocumentAsPdfHint(html, filename) {
  return downloadDocumentHtml(html, filename.replace(/\.pdf$/i, "") + ".html");
}

export function renderOrderDocument(type, order, settings) {
  return buildDocumentHtml(type, order, settings);
}

export function printOrderDocuments(orders, type, settings) {
  const htmlParts = orders.map((order) => {
    const full = buildDocumentHtml(type, order, settings);
    const match = full.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return match ? match[1] : "";
  });
  const first = buildDocumentHtml(type, orders[0], settings);
  const styleMatch = first.match(/<style>([\s\S]*?)<\/style>/i);
  const combined = `<!doctype html><html><head><meta charset="utf-8"/><title>Bulk ${type}</title><style>${styleMatch ? styleMatch[1] : ""}</style></head><body>${htmlParts.join("\n")}</body></html>`;
  return printDocumentHtml(combined);
}
