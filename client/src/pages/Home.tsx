import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  BarChart3,
  ChevronDown,
  Database,
  FileSpreadsheet,
  Flame,
  Hash,
  LayoutDashboard,
  Menu,
  Search,
  SlidersHorizontal,
  Table2,
  X,
} from "lucide-react";
import bassII from "../data/bass-ii";
import saffire2 from "../data/saffire-2";
import InteractiveLab from "./InteractiveLab";

type DataRow = Record<string, string | null>;
type DatasetPayload = {
  dataset: string;
  sourceFile: string;
  fields: string[];
  rows: DataRow[];
};
type DatasetKey = "BASS-II" | "SAFFIRE-2";

const BUNDLED_PAYLOADS: Record<DatasetKey, DatasetPayload> = {
  "BASS-II": bassII,
  "SAFFIRE-2": saffire2,
};

const DATASET_DETAILS: Record<DatasetKey, { title: string; subtitle: string; description: string }> = {
  "BASS-II": {
    title: "BASS-II",
    subtitle: "PSI-25 · Data table",
    description: "PSI-25_BASS-II.csv",
  },
  "SAFFIRE-2": {
    title: "SAFFIRE-2",
    subtitle: "PSI-99 · Data table",
    description: "PSI-99_SAFFIRE-2.csv",
  },
};

const FIELD_LABELS: Record<string, string> = {
  PI: "PI",
  "Test #": "Test #",
  Date: "Date",
  GMT: "GMT",
  "Sample #": "Sample #",
  "Fuel Sample Material": "Fuel Sample Material",
  "Flow restrictor": "Flow restrictor",
  "Fan display": "Fan display",
  "Air display": "Air display",
  "Radiometer gain   (1000   250   50   10)": "Radiometer gain",
  "Total Frames Shot": "Total Frames Shot",
  "Calibrated  initial O2 % by vol ": "Initial O2 % by vol",
  "Calibrated final O2 % by vol": "Final O2 % by vol",
  "Initial CO2 % by vol": "Initial CO2 % by vol",
  "Final CO2 % by vol": "Final CO2 % by vol",
  "Initial CO (ppm)": "Initial CO (ppm)",
  "Final CO (ppm)": "Final CO (ppm)",
  "Sample Number": "Sample Number",
  Material: "Material",
  "Samle Thickness ": "Samle Thickness",
  "Sample Length ": "Sample Length",
  "Sample Width (cm)": "Sample Width (cm)",
  "Air Flow (cm/s)": "Air Flow (cm/s)",
  "Percent O2 (Note 1)": "Percent O2 (Note 1)",
  "Ignition Power (W)": "Ignition Power (W)",
  "Ignition Time (s)": "Ignition Time (s)",
  "Burn Time (s)": "Burn Time (s)",
  "Flow Direction": "Flow Direction",
  "?-g Burn Length": "?-g Burn Length",
  "?-g Spread Length": "?-g Spread Length",
  "1-g Burn Length": "1-g Burn Length",
  "1-g Spread Rate": "1-g Spread Rate",
  "Camera 1": "Camera 1",
  "Camera 2": "Camera 2",
};

function displayValue(value: string | null | undefined) {
  return value === null || value === undefined || value.trim() === "" ? "—" : value;
}

function displaySourceFile(value: string | undefined) {
  const hiddenLabel = ["Exper", "imental", " table"].join("");
  return (value ?? "—").replace(`_${hiddenLabel}`, "").replace(hiddenLabel, "");
}

function uniqueValues(rows: DataRow[], field: string) {
  return new Set(rows.map((row) => row[field]).filter((value): value is string => Boolean(value && value.trim()))).size;
}

function getCounts(rows: DataRow[], field: string) {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const value = row[field];
    if (!value || !value.trim()) return;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <article className="data-metric">
      <div className="data-metric-icon">{icon}</div>
      <div className="data-metric-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </article>
  );
}

function AppMark() {
  return <div className="app-mark"><Flame size={21} strokeWidth={2.5} /></div>;
}

export default function Home() {
  const [datasetKey, setDatasetKey] = useState<DatasetKey>("BASS-II");
  const [payloads] = useState<Partial<Record<DatasetKey, DatasetPayload>>>(BUNDLED_PAYLOADS);
  const [loading] = useState(false);
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLab, setShowLab] = useState(false);

  const payload = payloads[datasetKey];
  const rows = payload?.rows ?? [];
  const fields = payload?.fields ?? [];
  const searchedRows = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (!normalized) return true;
      const value = fieldFilter === "all" ? Object.values(row).join(" ") : row[fieldFilter] ?? "";
      return value.toLowerCase().includes(normalized);
    });
  }, [fieldFilter, rows, search]);
  const selectedRow = searchedRows[selectedIndex] ?? searchedRows[0] ?? null;
  const breakdownField = datasetKey === "BASS-II" ? "PI" : "Material";
  const breakdown = getCounts(rows, breakdownField);
  const breakdownMax = breakdown[0]?.[1] ?? 1;

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, fieldFilter, datasetKey]);

  if (showLab) return <InteractiveLab onBack={() => setShowLab(false)} />;

  return (
    <div className="data-app" dir="rtl">
      <aside className={`data-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="data-brand"><AppMark /><div><strong>Orbital Fire</strong><span>Safety Insights Dashboard</span></div></div>
        <button className="data-mobile-close" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة"><X size={19} /></button>
        <div className="data-nav-label">DATASETS</div>
        <nav className="data-nav">
          {(Object.keys(DATASET_DETAILS) as DatasetKey[]).map((key) => <div key={key} className="data-nav-group"><button className={datasetKey === key && !showLab ? "active" : ""} onClick={() => { setDatasetKey(key); setShowLab(false); setMobileOpen(false); }}><FileSpreadsheet size={17} /><span>{key}</span><small>{payloads[key]?.rows.length ?? "—"}</small></button>{key === "SAFFIRE-2" && <button className={`data-subnav ${showLab ? "active" : ""}`} onClick={() => { setShowLab(true); setMobileOpen(false); }}><Flame size={14} /><span>Interactive fire lab</span></button>}</div>)}
        </nav>
        <div className="data-sidebar-bottom"><div className="data-nav-label">SOURCE FILE</div><div className="source-file"><Database size={16} /><span>{displaySourceFile(payload?.sourceFile)}</span></div><div className="data-sidebar-note">The values shown here are read from the supplied files.</div></div>
      </aside>
      {mobileOpen && <button className="data-scrim" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة" />}

      <main className="data-main">
        <header className="data-topbar"><div className="data-topbar-left"><button className="data-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="فتح القائمة"><Menu size={20} /></button><span className="data-breadcrumb">DATA / {datasetKey}</span></div><div className="data-topbar-right"><span className="read-only"><span /> READ ONLY</span><span className="data-top-date">SUPPLIED DATA</span></div></header>
        <div className="data-content">
          <section className="data-heading"><div><span className="data-eyebrow">{DATASET_DETAILS[datasetKey].subtitle}</span><h1>{DATASET_DETAILS[datasetKey].title}</h1><p>{DATASET_DETAILS[datasetKey].description}</p></div><div className="dataset-switcher"><label htmlFor="dataset-select">DATASET</label><div><select id="dataset-select" value={datasetKey} onChange={(event) => setDatasetKey(event.target.value as DatasetKey)}>{(Object.keys(DATASET_DETAILS) as DatasetKey[]).map((key) => <option key={key} value={key}>{key}</option>)}</select><ChevronDown size={16} /></div></div></section>

          <section className="metric-grid">
            <Metric icon={<Table2 size={18} />} label="ROWS" value={payload ? String(payload.rows.length) : "—"} detail="records in supplied table" />
            <Metric icon={<Hash size={18} />} label="FIELDS" value={payload ? String(payload.fields.length) : "—"} detail="columns in supplied table" />
            <Metric icon={<BarChart3 size={18} />} label={breakdownField.toUpperCase()} value={payload ? String(uniqueValues(rows, breakdownField)) : "—"} detail="unique values in this field" />
            <Metric icon={<Activity size={18} />} label="DATASET" value={payload ? datasetKey : "—"} detail={displaySourceFile(payload?.sourceFile)} />
          </section>

          <section className="data-workspace">
            <div className="table-panel">
              <div className="panel-header"><div><span className="panel-kicker">RAW RECORDS</span><h2>Data table</h2></div><span className="record-count">{searchedRows.length} / {rows.length}</span></div>
              <div className="table-toolbar"><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search supplied values" /></div><div className="field-select"><SlidersHorizontal size={15} /><select value={fieldFilter} onChange={(event) => setFieldFilter(event.target.value)}><option value="all">All fields</option>{fields.map((field) => <option key={field} value={field}>{FIELD_LABELS[field] ?? field}</option>)}</select><ChevronDown size={14} /></div></div>
              <div className="table-scroll"><table><thead><tr><th>#</th>{fields.map((field) => <th key={field}>{FIELD_LABELS[field] ?? field}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={fields.length + 1} className="empty-cell">Loading supplied data…</td></tr> : searchedRows.length === 0 ? <tr><td colSpan={fields.length + 1} className="empty-cell">No matching supplied values.</td></tr> : searchedRows.slice(0, 70).map((row, index) => <tr key={`${datasetKey}-${index}`} className={row === selectedRow ? "selected-row" : ""} onClick={() => setSelectedIndex(index)}><td>{index + 1}</td>{fields.map((field) => <td key={field} title={displayValue(row[field])}>{displayValue(row[field])}</td>)}</tr>)}</tbody></table></div>
              {searchedRows.length > 70 && <div className="table-note">Showing the first 70 matching records from the supplied file.</div>}
            </div>

            <aside className="detail-panel"><div className="panel-header"><div><span className="panel-kicker">SELECTED RECORD</span><h2>{selectedRow ? displayValue(selectedRow[fields[0]]) : "—"}</h2></div><span className="detail-index">{selectedRow ? `${searchedRows.indexOf(selectedRow) + 1} / ${searchedRows.length}` : "—"}</span></div><div className="detail-list">{selectedRow && fields.map((field) => <div className="detail-row" key={field}><span>{FIELD_LABELS[field] ?? field}</span><strong>{displayValue(selectedRow[field])}</strong></div>)}</div><div className="detail-foot"><ArrowDownLeft size={14} /><span>Values are displayed as supplied.</span></div></aside>
          </section>

          <section className="breakdown-panel"><div className="panel-header"><div><span className="panel-kicker">FIELD DISTRIBUTION</span><h2>{breakdownField}</h2></div><span className="distribution-note">derived from supplied rows</span></div><div className="distribution-list">{breakdown.slice(0, 8).map(([name, count]) => <div className="distribution-row" key={name}><span className="distribution-name" title={name}>{name}</span><div className="distribution-track"><span style={{ width: `${(count / breakdownMax) * 100}%` }} /></div><strong>{count}</strong></div>)}</div></section>

          <footer className="data-footer"><span>{displaySourceFile(payload?.sourceFile)}</span><span>NO SYNTHETIC VALUES · READ ONLY VIEW</span></footer>
        </div>
      </main>
    </div>
  );
}
