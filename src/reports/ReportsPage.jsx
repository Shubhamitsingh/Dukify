import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { sampleToday } from "../orderDesk";
import { useStore } from "../store";
import { PageHead, SoftButton } from "../ui";
import { BrandDetailModal, ProductDetailModal } from "./components/DetailModals";
import { BrandSalesTable } from "./components/BrandSalesTable";
import { PartnerMarginTable } from "./components/PartnerMarginTable";
import { ProductSalesTable } from "./components/ProductSalesTable";
import { ReportFilters } from "./components/ReportFilters";
import { ReportSummaryCards } from "./components/ReportSummaryCards";
import { SalesTrendChart } from "./components/SalesTrendChart";
import { exportReportsCsv, exportReportsXlsx } from "./export";
import {
  DEFAULT_REPORT_FILTERS,
  brandSalesRows,
  buildSalesTrend,
  filterReportOrders,
  partnerMarginRows,
  productSalesRows,
  reportSummary,
} from "./model";

export function ReportsPage() {
  const { db } = useStore();
  const [filters, setFilters] = useState(DEFAULT_REPORT_FILTERS);
  const [brandDetail, setBrandDetail] = useState(null);
  const [productDetail, setProductDetail] = useState(null);

  const today = useMemo(() => sampleToday(db.orders), [db.orders]);
  const scoped = useMemo(() => filterReportOrders(db.orders, filters, today), [db.orders, filters, today]);
  const summary = useMemo(() => reportSummary(db, scoped, filters), [db, scoped, filters]);
  const trend = useMemo(() => buildSalesTrend(scoped, today), [scoped, today]);
  const brands = useMemo(() => brandSalesRows(db, scoped), [db, scoped]);
  const products = useMemo(() => productSalesRows(db, scoped), [db, scoped]);
  const margins = useMemo(() => partnerMarginRows(db, scoped), [db, scoped]);

  const exportPayload = () => ({ summary, brands, products, margins });

  return (
    <div className="space-y-4">
      <PageHead
        eyebrow="Platform"
        title="Reports"
        description="Brand, product and margin summaries from the same local order records. Filters apply to every section below."
        action={
          <>
            <SoftButton onClick={() => exportReportsCsv(exportPayload())}>
              <Download className="h-3.5 w-3.5" />
              CSV
            </SoftButton>
            <SoftButton onClick={() => exportReportsXlsx(exportPayload())}>
              <Download className="h-3.5 w-3.5" />
              Excel
            </SoftButton>
          </>
        }
      />

      <ReportFilters
        filters={filters}
        brands={db.brands}
        orderCount={scoped.length}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_REPORT_FILTERS)}
      />

      <ReportSummaryCards summary={summary} />

      <SalesTrendChart series={trend} />

      <div className="grid gap-4 xl:grid-cols-2">
        <BrandSalesTable rows={brands} onSelect={setBrandDetail} />
        <ProductSalesTable rows={products} onSelect={setProductDetail} />
      </div>

      <PartnerMarginTable rows={margins} />

      {brandDetail ? <BrandDetailModal row={brandDetail} onClose={() => setBrandDetail(null)} /> : null}
      {productDetail ? (
        <ProductDetailModal row={productDetail} orders={scoped} onClose={() => setProductDetail(null)} />
      ) : null}
    </div>
  );
}
