import { useNavigate } from "react-router-dom";
import { inr } from "../../data";
import { ModalShell, SoftButton, Status } from "../../ui";
import { isDelivered, isGrossSalesOrder, isPaidOrder, orderSupplyCost } from "../model";

export function BrandDetailModal({ row, onClose }) {
  const navigate = useNavigate();
  if (!row) return null;
  const orders = row.orders || [];
  const gross = orders.filter(isGrossSalesOrder);
  const paid = orders.filter(isPaidOrder).length;
  const delivered = orders.filter(isDelivered).length;
  const supply = gross.reduce((n, order) => n + orderSupplyCost(order), 0);

  return (
    <ModalShell
      title={row.brand}
      eyebrow="Brand report"
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <SoftButton onClick={onClose}>Close</SoftButton>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onClose();
              navigate(`/orders?brand=${encodeURIComponent(row.brand)}`);
            }}
          >
            Open orders
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Mini label="Total orders" value={row.totalOrders} />
          <Mini label="Paid" value={paid} />
          <Mini label="Delivered" value={delivered} />
          <Mini label="Gross sales" value={inr(row.grossSales)} />
          <Mini label="AOV" value={inr(row.aov)} />
          <Mini label="Order-time supply" value={inr(supply)} />
          <Mini label="Est. margin" value={inr(row.grossSales - supply)} />
          <Mini label="Status" value={row.status} />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Orders in range</p>
          <div className="max-h-64 overflow-auto rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-[11px] text-gray-500 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Fulfilment</th>
                  <th className="px-3 py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 20).map((order) => (
                  <tr key={order.id} className="border-t border-gray-50 dark:border-gray-700">
                    <td className="px-3 py-2 font-medium">{order.id}</td>
                    <td className="px-3 py-2">{order.product}</td>
                    <td className="px-3 py-2">
                      <Status value={order.paymentStatus || order.payment} />
                    </td>
                    <td className="px-3 py-2">
                      <Status value={order.fulfillmentStatus || order.fulfilment} />
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{inr(order.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export function ProductDetailModal({ row, orders = [], onClose }) {
  const navigate = useNavigate();
  if (!row) return null;
  const related = orders.filter(
    (order) =>
      isGrossSalesOrder(order) &&
      (order.product === row.product || order.items?.some((item) => item.product === row.product)),
  );

  return (
    <ModalShell
      title={row.product}
      eyebrow="Product report"
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <SoftButton onClick={onClose}>Close</SoftButton>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onClose();
              navigate(`/products`);
            }}
          >
            Open products
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <Mini label="Brand" value={row.brand} />
          <Mini label="Units sold" value={row.unitsSold} />
          <Mini label="Gross sales" value={inr(row.grossSales)} />
          <Mini label="Supply cost (order-time)" value={inr(row.supplyCost)} />
          <Mini label="Gross margin" value={inr(row.grossMargin)} />
          <Mini label="Orders" value={row.orderCount} />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Contributing orders</p>
          <div className="max-h-64 overflow-auto rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-[11px] text-gray-500 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Brand</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-right">Supply</th>
                </tr>
              </thead>
              <tbody>
                {related.slice(0, 20).map((order) => (
                  <tr key={order.id} className="border-t border-gray-50 dark:border-gray-700">
                    <td className="px-3 py-2 font-medium">{order.id}</td>
                    <td className="px-3 py-2">{order.brand}</td>
                    <td className="px-3 py-2">{order.date}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{inr(order.value)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{inr(orderSupplyCost(order))}</td>
                  </tr>
                ))}
                {!related.length ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
                      No orders in range.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
