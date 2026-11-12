import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Gauge, Info, Wind, Zap } from "lucide-react";
import bassII from "../data/bass-ii";
import saffire2 from "../data/saffire-2";

type DataRow = Record<string, string | null>;
type DatasetPayload = { rows: DataRow[] };

type MaterialProfile = {
  id: string;
  name: string;
  shortName: string;
  family: string;
  color: string;
  o2Ignition: number;
  o2Extinguish: number;
  fanIgnition: number;
  fanExtinguish: number;
  mode: "extinguishes" | "persistent" | "insulating" | "low-flow";
  summary: string;
  nasaNote: string;
  sourceRows: DataRow[];
};

const source = saffire2 as DatasetPayload;
const bassSource = bassII as DatasetPayload;

const profiles: MaterialProfile[] = [
  {
    id: "pmma-thin",
    name: "PMMA — thin film",
    shortName: "PMMA thin",
    family: "PMMA",
    color: "#f2a65a",
    o2Ignition: 22.2,
    o2Extinguish: 20.9,
    fanIgnition: 2,
    fanExtinguish: 0.4,
    mode: "extinguishes",
    summary: "عينة رقيقة تنطفئ بسرعة عندما ينخفض الأكسجين أو تدفق الهواء.",
    nasaNote: "Blowoff أو انطفاء: التبريد بتيار هواء سريع أو خنق الأكسجين يوقف اللهب.",
    sourceRows: [...source.rows, ...bassSource.rows].filter((row) => /PMMA|film/i.test(`${row.Material ?? ""} ${row["Fuel Sample Material"] ?? ""}`)).slice(0, 6),
  },
  {
    id: "pmma-thick",
    name: "PMMA — thick sample",
    shortName: "PMMA thick",
    family: "PMMA",
    color: "#e57b47",
    o2Ignition: 22.1,
    o2Extinguish: 20.7,
    fanIgnition: 5,
    fanExtinguish: 0.32,
    mode: "low-flow",
    summary: "العينة السميكة تحتفظ بالحرارة وتحتاج تدفقًا منخفضًا مستمرًا لمنع إعادة الاشتعال.",
    nasaNote: "PMMA السميك يحتفظ بالحرارة لفترة أطول؛ انطفاؤه يحدث عند تدفق منخفض جدًا.",
    sourceRows: source.rows.filter((row) => row.Material === "PMMA" || /mm thick|thick/i.test(row["Fuel Sample Material"] ?? "")),
  },
  {
    id: "sibal",
    name: "Cotton-Fiberglass (SIBAL)",
    shortName: "SIBAL CLOTH",
    family: "Cotton-Fiberglass",
    color: "#ef554c",
    o2Ignition: 22.1,
    o2Extinguish: 22.1,
    fanIgnition: 20,
    fanExtinguish: 20,
    mode: "persistent",
    summary: "حريق نشط في جميع الحالات المسجلة؛ استمرار التهوية يغذي اللهب.",
    nasaNote: "الحريق مستمر: لا تتغير نقطة البداية والنهاية في السجل، لذلك يبقى العمود أحمر.",
    sourceRows: source.rows.filter((row) => /SIBAL|Cotton-Fiberglass/i.test(row.Material ?? "")),
  },
  {
    id: "nomex",
    name: "Nomex natural (nomex III)",
    shortName: "Nomex",
    family: "Nomex",
    color: "#65bc91",
    o2Ignition: 22.2,
    o2Extinguish: 22.2,
    fanIgnition: 9.5,
    fanExtinguish: 9.5,
    mode: "insulating",
    summary: "مادة عازلة ومقاومة للحرائق؛ خطرها منخفض وتنطفئ ذاتيًا في الهواء العادي.",
    nasaNote: "Nomex لا يغيّر الأكسجين أو سرعة المراوح في السجل؛ قد يتفحم إذا تجاوز الأكسجين 28٪.",
    sourceRows: bassSource.rows.filter((row) => /Nomex/i.test(row["Fuel Sample Material"] ?? "")),
  },
  {
    id: "silicone",
    name: "Silicone",
    shortName: "Silicone",
    family: "Silicone",
    color: "#74a4cc",
    o2Ignition: 22.1,
    o2Extinguish: 21.9,
    fanIgnition: 20,
    fanExtinguish: 0.4,
    mode: "extinguishes",
    summary: "زمن الاحتراق غير ملحوظ تقريبًا في السجلات، مع طول احتراق يقارب الصفر.",
    nasaNote: "البيانات تسجل Burn Time غير ملحوظ وBurn Length يقارب 0؛ لذلك يظهر اللهب قصيرًا.",
    sourceRows: source.rows.filter((row) => row.Material === "Silicone"),
  },
];

function numberValue(value: string | null | undefined) {
  const match = value?.match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : "—";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function FlameChart({ intensity, color }: { intensity: number; color: string }) {
  const points = Array.from({ length: 15 }, (_, index) => {
    const x = 8 + index * 7;
    const wave = Math.sin(index * 1.25) * 5 + Math.cos(index * 0.52) * 3;
    const y = 79 - intensity * (37 + wave);
    return `${x},${clamp(y, 19, 79)}`;
  }).join(" ");
  return (
    <div className="flame-chart" style={{ "--chart-color": color } as React.CSSProperties}>
      <div className="chart-grid"><i /><i /><i /></div>
      <svg viewBox="0 0 110 88" role="img" aria-label="رسم متحرك لشدة اللهب" preserveAspectRatio="none">
        <polyline points={`8,79 15,79 22,79 29,79 36,79 43,79 50,79 57,79 64,79 71,79 78,79 85,79 92,79 99,79 106,79`} className="chart-baseline" />
        <polyline points={points} className="chart-line" />
      </svg>
      <span className="chart-axis">الزمن أثناء التجربة</span>
    </div>
  );
}

function MaterialCard({ profile, active, onClick }: { profile: MaterialProfile; active: boolean; onClick: () => void }) {
  return (
    <button className={`material-card ${active ? "active" : ""}`} onClick={onClick} style={{ "--material-color": profile.color } as React.CSSProperties}>
      <span className="material-card-dot" />
      <span className="material-card-copy"><strong>{profile.shortName}</strong><small>{profile.name}</small></span>
      <ChevronLeft size={16} />
    </button>
  );
}

export default function InteractiveLab({ onBack }: { onBack: () => void }) {
  const [activeId, setActiveId] = useState("pmma-thin");
  const [oxygen, setOxygen] = useState(0);
  const [fan, setFan] = useState(0);
  const profile = profiles.find((item) => item.id === activeId) ?? profiles[0];
  const reset = () => { setOxygen(0); setFan(0); };

  const reading = useMemo(() => {
    const hasIgnited = oxygen >= profile.o2Ignition && fan >= profile.fanIgnition;
    const extinguished = profile.mode === "insulating" || (hasIgnited && oxygen <= profile.o2Extinguish && fan <= profile.fanExtinguish);
    const persistent = profile.mode === "persistent" && hasIgnited;
    let status: "idle" | "burning" | "out" | "persistent" | "protected" = "idle";
    if (profile.mode === "insulating") status = "protected";
    else if (persistent) status = "persistent";
    else if (extinguished) status = "out";
    else if (hasIgnited) status = "burning";
    const intensity = status === "persistent" ? 0.92 : status === "burning" ? 0.75 : status === "protected" ? 0.06 : status === "out" ? 0.04 : 0.1;
    const statusText = status === "persistent" ? "حريق مستمر" : status === "protected" ? "عازل / مقاوم" : status === "burning" ? "الحريق نشط" : status === "out" ? "انطفأ" : "بانتظار نقطة الاشتعال";
    const statusColor = status === "persistent" || status === "burning" ? "#ef554c" : status === "protected" || status === "out" ? "#65bc91" : "#f2a65a";
    return { status, intensity, statusText, statusColor, hasIgnited, extinguished };
  }, [fan, oxygen, profile]);

  const sourceRows = profile.sourceRows;
  const representative = sourceRows[0];

  return (
    <div className="lab-app" dir="rtl">
      <header className="lab-header"><button className="lab-back" onClick={onBack}>← لوحة البيانات</button>
        <div className="lab-brand"><span className="lab-mark"><Flame size={19} /></span><span><b>Orbital Fire</b><small>Microgravity fire lab</small></span></div>
        <div className="lab-header-note"><span className="status-pulse" /> تجربة تعليمية من البيانات المرفقة</div>
      </header>

      <main className="lab-shell">
        <section className="lab-intro"><div><span className="lab-kicker">SAFETY INSIGHTS / INTERACTIVE LAB</span><h1>ماذا حدث للعينة<br /><em>عندما تغيّرت البيئة؟</em></h1><p>اختر مادة من نتائج التجارب السابقة، ثم حرّك الأكسجين والمراوح لترى لحظة الاشتعال وما إذا كان اللهب انطفأ أو استمر.</p></div><div className="lab-intro-orbit"><span /><b>LIVE<br />MODEL</b></div></section>

        <section className="material-section"><div className="section-head"><div><span className="lab-kicker">01 / SAMPLE LIBRARY</span><h2>اختر المادة</h2></div><span className="section-hint">{profiles.length} مواد من الملفات المرفقة</span></div><div className="material-grid">{profiles.map((item) => <MaterialCard key={item.id} profile={item} active={item.id === profile.id} onClick={() => { setActiveId(item.id); reset(); }} />)}</div></section>

        <section className="experiment-layout">
          <div className="control-column">
            <div className="section-head compact"><div><span className="lab-kicker">02 / ENVIRONMENT</span><h2>غيّر الظروف</h2></div><button className="reset-button" onClick={reset}>إعادة التجربة</button></div>
            <div className="control-card">
              <label className="slider-row"><span className="slider-top"><span><Wind size={16} /> سرعة المراوح <small>FAN SPEED</small></span><b>{fan.toFixed(1)} <i>cm/s</i></b></span><input type="range" min="0" max="25" step="0.1" value={fan} onChange={(event) => setFan(Number(event.target.value))} style={{ "--progress": `${(fan / 25) * 100}%` } as React.CSSProperties} /><span className="slider-meta"><span>0</span><span>نقطة الاشتعال: {profile.fanIgnition} cm/s</span><span>25</span></span></label>
              <label className="slider-row"><span className="slider-top"><span><Zap size={16} /> نسبة الأكسجين <small>O₂ LEVEL</small></span><b>{oxygen.toFixed(1)} <i>%</i></b></span><input type="range" min="0" max="30" step="0.1" value={oxygen} onChange={(event) => setOxygen(Number(event.target.value))} style={{ "--progress": `${(oxygen / 30) * 100}%` } as React.CSSProperties} /><span className="slider-meta"><span>0%</span><span>نقطة الاشتعال: {profile.o2Ignition}%</span><span>30%</span></span></label>
              <div className="threshold-callout"><Info size={15} /><span>اسحب كل شريط حتى يصل إلى نقطة الاشتعال، ثم خفّض القيم إلى نقطة الانطفاء لمراقبة التحول.</span></div>
            </div>
            <div className="source-mini"><span>السجل المستخدم</span><b>{profile.name}</b><small>{sourceRows.length ? `${sourceRows.length} سجلات مرتبطة من الملف` : "بيانات الملخص المرفق"}</small></div>
          </div>

          <div className="visual-column">
            <div className="visual-card"><div className="visual-card-head"><div><span className="lab-kicker">03 / OBSERVATION</span><h2>سلوك اللهب</h2></div><span className="live-tag"><span /> {reading.statusText}</span></div><div className="flame-stage" style={{ "--flame-color": reading.statusColor } as React.CSSProperties}><div className="stage-ring ring-a" /><div className="stage-ring ring-b" /><div className={`flame-icon ${reading.status === "idle" ? "idle" : ""}`} style={{ opacity: 0.22 + reading.intensity * 0.78 }}><Flame size={92} fill="currentColor" /></div><div className="stage-readout"><strong>{reading.status === "persistent" ? "∞" : Math.round(reading.intensity * 100)}</strong><small>FLAME INDEX</small></div></div><FlameChart intensity={reading.intensity} color={reading.statusColor} /><div className="state-bar"><span className="state-dot" style={{ background: reading.statusColor }} /><b>{reading.statusText}</b><span>{reading.status === "persistent" ? "لا توجد نقطة انطفاء في السجل" : reading.status === "protected" ? "Nomex يحافظ على حالته العازلة" : reading.status === "out" ? "انخفضت الشدة بعد الوصول لقيم الإطفاء" : reading.hasIgnited ? "القيم الحالية تدعم استمرار اللهب" : "حرّك الشرائط للوصول إلى الاشتعال"}</span></div></div>
          </div>
        </section>

        <section className="evidence-grid"><article className="note-card"><span className="lab-kicker">NASA NOTE / READING</span><h2>{profile.shortName}</h2><p>{profile.nasaNote}</p><div className="note-source"><Info size={14} /> قراءة تفسيرية مبنية على السجلات والملخص المرفق</div></article><article className="facts-card"><div className="section-head compact"><div><span className="lab-kicker">RECORDED VALUES</span><h2>ما الذي سُجّل؟</h2></div><Gauge size={18} /></div><div className="facts-list"><div><span>الأكسجين الابتدائي</span><b>{representative?.["Percent O2 (Note 1)"] ?? `${profile.o2Ignition}%`}</b></div><div><span>تدفق الهواء</span><b>{representative?.["Air Flow (cm/s)"] ?? `${profile.fanIgnition} cm/s`}</b></div><div><span>زمن الاحتراق</span><b>{representative?.["Burn Time (s)"] ?? (profile.mode === "persistent" ? "نشط" : "—")}</b></div><div><span>عدد السجلات المرتبطة</span><b>{sourceRows.length || "—"}</b></div></div></article></section>

        <footer className="lab-footer"><span>ORBITAL FIRE / SAFETY INSIGHTS</span><span>القيم المعروضة مأخوذة من الملفات المرفقة — وليست قراءة حساسات حية</span></footer>
      </main>
    </div>
  );
}
