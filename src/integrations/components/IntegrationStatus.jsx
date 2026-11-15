const tone = {
  Connected: "bg-pink-50 text-pink-800 ring-1 ring-pink-100 dark:bg-pink-950/40 dark:text-pink-300 dark:ring-pink-900/50",
  "Not Connected": "bg-rose-50 text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/40",
  Error: "bg-rose-50 text-rose-800 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300",
  Testing: "bg-amber-50 text-amber-800 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300",
};

export function IntegrationStatus({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone[value] || tone["Not Connected"]}`}>
      {value}
    </span>
  );
}
