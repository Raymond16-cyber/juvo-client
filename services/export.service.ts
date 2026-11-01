import api from "@/lib/axios";

type ExportFilters = {
  accountId?: string;
  from?: string;
  to?: string;
};

function exportParams(filters: ExportFilters) {
  const params = new URLSearchParams();
  if (filters.accountId) params.set("accountId", filters.accountId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  return params.toString();
}

async function downloadExport(
  format: "pdf" | "excel",
  filters: ExportFilters,
) {
  const query = exportParams(filters);
  const response = await api.get<Blob>(
    `/journal/export/${format}${query ? `?${query}` : ""}`,
    { responseType: "blob" },
  );
  const contentDisposition = response.headers["content-disposition"] as
    | string
    | undefined;
  const filename =
    contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] ||
    `juvo-export.${format === "pdf" ? "pdf" : "xlsx"}`;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadPdfExport(filters: ExportFilters) {
  return downloadExport("pdf", filters);
}

export function downloadExcelExport(filters: ExportFilters) {
  return downloadExport("excel", filters);
}
