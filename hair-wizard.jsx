// Corrected version of the code (removed syntax errors and improved React use)

// React + ReactDOM + Babel (one-time) - These should be included in the HTML, not in JSX
// <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
// <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
// <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

// Site-wide defaults — safe to tweak
window.__HAIR_WIZ_DEFAULTS__ = {
  title: "Assure Hair Intake",
  accentColor: "#5b9cff",
  shortMode: true,
  showJson: false,
  onSubmit: function({ form, result }) {
    alert("Thanks! We’ve received your details.");
    console.log("Submission payload", { form, result });
    return Promise.resolve();
  }
};

// The entire wizard, inline (no uploads needed)
/** Hair Wizard (inline JSX) */
const CSS = `
:root{--bg:#0b0c10;--card:#111217;--muted:#8f95a3;--text:#e6e8ee;--accent:#5b9cff;--ok:#27ae60;--warn:#f39c12;--bad:#e74c3c}
*{box-sizing:border-box}html,body{margin:0;padding:0}
.hz-wrap{max-width:980px;margin:24px auto;padding:16px}
.hz-card{background:var(--card);border-radius:18px;box-shadow:0 4px 24px rgba(0,0,0,.35);padding:20px;color:var(--text);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;font-size:16px}
.hz-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.hz-title{font-size:22px;font-weight:700}
.hz-muted{color:var(--muted)}
.hz-prog{height:8px;background:#1c1f2a;border-radius:999px;overflow:hidden;margin-top:8px}
.hz-prog>div{height:100%;background:linear-gradient(90deg,var(--accent),#86b6ff);width:0%}
.hz-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:800px){.hz-grid{grid-template-columns:1fr}}
.hz-field{display:flex;flex-direction:column;gap:6px}
.hz-field label{font-size:13px;color:var(--muted)}
.hz-input,.hz-select,.hz-textarea{background:#0f1117;color:var(--text);border:1px solid #1f2330;border-radius:12px;padding:10px}
.hz-textarea{min-height:88px}
.hz-btns{display:flex;justify-content:space-between;margin-top:16px;gap:8px}
.hz-btn{border:none;border-radius:12px;padding:10px 14px;background:#191d28;color:var(--text);cursor:pointer}
.hz-btn.primary{background:var(--accent);color:#fff}
.hz-btn:disabled{opacity:.5;cursor:not-allowed}
.hz-badges{display:flex;flex-wrap:wrap;gap:6px}
.hz-badge{background:#1a2130;color:#b9c5ff;border:1px solid #263150;border-radius:999px;padding:6px 10px;font-size:12px}
.hz-alert{background:#121521;border:1px solid #223058;border-radius:14px;padding:12px;margin-top:12px}
.hz-code{background:#000;color:#d1d5db;border-radius:10px;padding:12px;overflow:auto;max-height:260px;font-size:12px}
.hz-hr{height:1px;background:#1b2130;margin:12px 0}
`;

const YESNO = [{label:"Yes", value:"yes"}, {label:"No", value:"no"}];
const ynToBool = (v) => v==="yes" ? true : v==="no" ? false : undefined;
const numberOrNull = (v) => (v===undefined||v===null||v==="") ? null : (isNaN(Number(v)) ? null : Number(v));
function parseStage(sex, norwood, ludwig){
  if (sex==="male" && norwood){ const n=Number(norwood); if(!isNaN(n)) return {scale:"Norwood",stage:n}; }
  if (sex==="female" && ludwig){ const map={I:1,II:2,III:3}; if(ludwig in map) return {scale:"Ludwig",stage:map[ludwig]}; }
  return { scale:"Unknown", stage:0 };
}

function computeSegmentation(data){
  const sex = data.sex;
  const age = numberOrNull(data.age);
  const pregnant = sex==="female" ? ynToBool(data.pregnant) : false;
  const breastfeeding = sex==="female" ? ynToBool(data.breastfeeding) : false;

  const nw = parseStage(sex, data.norwood, data.ludwig);
  const durationMonths = numberOrNull(data.duration_months);
  const rapidProgress = ynToBool(data.rapid_progress);
  const suddenTrigger = ynToBool(data.sudden_trigger);
  const recentStress = ynToBool(data.recent_stress);

  const itch = ynToBool(data.itching);
  const flakes = ynToBool(data.dandruff);
  const pain = ynToBool(data.trichodynia);
  const scalpOily = ynToBool(data.oily_scalp);

  const thyroid = ynToBool(data.hx_thyroid);
  const pcos = ynToBool(data.hx_pcos);
  const anemia = ynToBool(data.hx_anemia);
  const autoimmune = ynToBool(data.hx_autoimmune);
  const diabetes = ynToBool(data.hx_diabetes);

  const onAnticoagulants = ynToBool(data.on_anticoagulants);
  const plateletDisorder = ynToBool(data.platelet_disorder);
  const smoker = ynToBool(data.smoker);

  const ferritin = numberOrNull(data.lab_ferritin);
  const hb = numberOrNull(data.lab_hb);
  const tsh = numberOrNull(data.lab_tsh);
  const vitd = numberOrNull(data.lab_vitd);

  const willingnessMeds = ynToBool(data.willingness_meds);
  const willingnessSurgery = ynToBool(data.willingness_surgery);
  const willingnessPRP = ynToBool(data.willingness_prp);

  const flags = [];
  if (pregnant) flags.push("Pregnant");
  if (breastfeeding) flags.push("Breastfeeding");
  if (onAnticoagulants) flags.push("On blood thinners (PRP caution)");
  if (plateletDisorder) flags.push("Platelet disorder (PRP not advised)");
  if (smoker) flags.push("Smoker (outcomes may reduce)");

  if (ferritin!==null && ferritin<40) flags.push("Low ferritin suspected");
  const hbLow = hb!==null && ((sex==="male" && hb<13.5) || (sex==="female" && hb<12));
  if (hbLow) flags.push("Low hemoglobin");
  if (tsh!==null && (tsh<0.4 || tsh>4.5)) flags.push("Thyroid imbalance risk");
  if (vitd!==null && vitd<30) flags.push("Low Vitamin D");

  if (itch || flakes || pain || scalpOily) flags.push("Active scalp symptoms");
  if (rapidProgress) flags.push("Rapid progression");
  if (suddenTrigger || recentStress) flags.push("Recent trigger/stress");

  const paths = [];
  const systemic = (ferritin!==null && ferritin<30) || hbLow || (tsh!==null && (tsh<0.3 || tsh>5)) || (sex==="female" && pcos) || anemia || thyroid;
  if (systemic || suddenTrigger) paths.push("Investigate systemic causes first");

  const scalpActive = itch || flakes || pain;
  if (scalpActive) paths.push("Treat scalp condition first");

  const earlyOrMid =
    (nw.scale!=="Unknown" && ((nw.scale==="Norwood" && nw.stage<=3) || (nw.scale==="Ludwig" && nw.stage<=2))) ||
    durationMonths===null || (durationMonths!==null && durationMonths<24);
  if (earlyOrMid) paths.push("Medical stabilization");

  const prpOk = !onAnticoagulants && !plateletDisorder && !pregnant && !breastfeeding;
  const prpStageOk = (nw.scale==="Norwood" && nw.stage>=2 && nw.stage<=5) || (nw.scale==="Ludwig" && nw.stage>=1 && nw.stage<=3);
  if (prpOk && prpStageOk) paths.push("PRP course candidate");

  const stableLong = durationMonths!==null && durationMonths>=12 && !rapidProgress;
  const transplantStage = (nw.scale==="Norwood" && nw.stage>=3) || (nw.scale==="Ludwig" && nw.stage>=2);
  const ageOk = age!==null ? age>=25 : false;
  if (transplantStage && stableLong && ageOk) paths.push("Transplant evaluation");

  if (!rapidProgress && (nw.scale!=="Unknown" && ((nw.scale==="Norwood" && nw.stage<=2) || (nw.scale==="Ludwig" && nw.stage===1)))) {
    paths.push("Maintenance & prevention");
  }

  const filtered = paths.filter((p)=>{
    if (p==="Transplant evaluation" && willingnessSurgery===false) return false;
    if (p==="PRP course candidate" && willingnessPRP===false) return false;
    if (p==="Medical stabilization" && willingnessMeds===false) return false;
    return true;
  });

  let leadBucket = "Medical";
  if (filtered.includes("Transplant evaluation")) leadBucket = "Surgery";
  else if (filtered.includes("PRP course candidate") || filtered.includes("Treat scalp condition first")) leadBucket = "Non invasive";

  const notes = [];
  if (sex==="female" && (pregnant || breastfeeding)) {
    notes.push("Avoid finasteride. Consider topical minoxidil & nutrition. PRP after clearance.");
  }
  if (sex==="male" && age!==null && age<25) {
    notes.push("Be cautious with transplant under 25. Focus on stabilization.");
  }
  if (smoker) notes.push("Advise smoking cessation to improve outcomes.");

  const priority = [
    "Investigate systemic causes first",
    "Treat scalp condition first",
    "Transplant evaluation",
    "Medical stabilization",
    "PRP course candidate",
    "Maintenance & prevention",
  ];
  const primaryPath = priority.find((p)=>filtered.includes(p)) || filtered[0] || "Needs in person evaluation";

  return { flags, paths: filtered, primaryPath, leadBucket, notes };
}

const Badge = ({ text }) => <span className="hz-badge">{text}</span>;
const SectionTitle = ({ title, subtitle }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontWeight: 600 }}>{title}</div>
    {subtitle ? <div className="hz-muted" style={{ fontSize: 12 }}>{subtitle}</div> : null}
  </div>
);
const Field = ({ label, children }) => (
  <div className="hz-field">
    <label>{label}</label>
    {children}
  </div>
);
const Row = ({ children }) => <div className="hz-grid">{children}</div>;

function HairAssessmentWizard({ title, accentColor, shortMode, showJson, onSubmit }) {
  const [step, setStep] = React.useState(0);
  const [consent, setConsent] = React.useState(false);
  const [form, setForm] = React.useState({ sex: "male", budget: "medium" });
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(()=>{
    if (!document.getElementById("hz-styles")) {
      const s = document.createElement("style");
      s.id = "hz-styles"; s.textContent = CSS; document.head.appendChild(s);
    }
    if (accentColor) document.documentElement.style.setProperty("--accent", accentColor);
  }, [accentColor]);

  const STEPS_BASE = ["Profile","Pattern & Stage","Timeline","Scalp & Symptoms","Medical & Lifestyle","Labs (optional)","Preferences","Summary"];
  const steps = React.useMemo(()=> shortMode ? STEPS_BASE.filter(s=>s!=="Labs (optional)") : STEPS_BASE, [shortMode]);
  const pct = Math.round(((step+1)/steps.length)*100);
  const result = React.useMemo(()=> computeSegmentation(form), [form]);
  const update = (k,v)=> setForm(prev=>({...prev,[k]:v}));

  async function handleSubmit(){
    const payload = { form, result };
    try{
      setSubmitting(true);
      if (onSubmit) await onSubmit(payload);
      else { console.log("HairAssessmentWizard payload", payload); alert("Submitted (check console)."); }
    } finally { setSubmitting(false); }
  }

  return (
    <div className="hz-wrap">
      <div className="hz-card">
        <div className="hz-head">
          <div className="hz-title">{title || "Hair Assessment & Segmentation"}</div>
          <div className="hz-muted" style={{ fontSize: 12 }}>Step {step+1} of {steps.length}</div>
        </div>
        <div className="hz-prog"><div style={{ width: pct + "%" }} /></div>

        {steps[step] === "Profile" && (
          <div>
            <SectionTitle title="Profile" subtitle="Basic details and consent" />
            <Row>
              <Field label="Full name">
                <input className="hz-input" placeholder="Enter full name" value={form.name||""} onChange={e=>update("name", e.target.value)} />
              </Field>
              <Field label="Age">
                <input className="hz-input" type="number" placeholder="Years" value={form.age||""} onChange={e=>update("age", e.target.value)} />
              </Field>
            </Row>
            <Row>
              <Field label="Sex at birth">
                <select className="hz-select" value={form.sex} onChange={e=>update("sex", e.target.value)}>
                  <option value="male">Male</option><option value="female">Female</option>
                </select>
              </Field>
              <Field label="Phone or WhatsApp">
                <input className="hz-input" placeholder="Contact" value={form.phone||""} onChange={e=>update("phone", e.target.value)} />
              </Field>
            </Row>
            {form.sex==="female" && (
              <Row>
                <Field label="Pregnant?">
                  <select className="hz-select" value={form.pregnant||""} onChange={e=>update("pregnant", e.target.value)}>
                    <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Breastfeeding?">
                  <select className="hz-select" value={form.breastfeeding||""} onChange={e=>update("breastfeeding", e.target.value)}>
                    <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              </Row>
            )}
            <div className="hz-hr" />
            <label className="hz-muted" style={{ fontSize: 12 }}>
              <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{ marginRight: 8 }} />
              I agree to share my details for assessment and follow up.
            </label>
          </div>
        )}

        {steps[step] === "Pattern & Stage" && (
          <div>
            <SectionTitle title="Pattern & Stage" subtitle="Self assessment" />
            {form.sex==="male" ? (
              <Row>
                <Field label="Norwood stage (1 to 7)">
                  <input className="hz-input" type="number" min={1} max={7} placeholder="e.g. 3" value={form.norwood||""} onChange={e=>update("norwood", e.target.value)} />
                </Field>
                <Field label="Areas involved">
                  <textarea className="hz-textarea" placeholder="temples, crown, frontal, diffuse" value={form.areas||""} onChange={e=>update("areas", e.target.value)} />
                </Field>
              </Row>
            ) : (
              <Row>
                <Field label="Ludwig stage">
                  <select className="hz-select" value={form.ludwig||""} onChange={e=>update("ludwig", e.target.value)}>
                    <option value="">Select</option><option value="I">I</option><option value="II">II</option><option value="III">III</option>
                  </select>
                </Field>
                <Field label="Part width or diffuse thinning details">
                  <textarea className="hz-textarea" placeholder="Describe where thinning is most visible" value={form.areas||""} onChange={e=>update("areas", e.target.value)} />
                </Field>
              </Row>
            )}
            <Row>
              <Field label="Donor hair quality">
                <select className="hz-select" value={form.donor_quality||""} onChange={e=>update("donor_quality", e.target.value)}>
                  <option value="">Select</option><option value="good">Good</option><option value="average">Average</option><option value="poor">Poor</option>
                </select>
              </Field>
              <Field label="Hair caliber">
                <select className="hz-select" value={form.hair_caliber||""} onChange={e=>update("hair_caliber", e.target.value)}>
                  <option value="">Select</option><option value="thick">Thick</option><option value="medium">Medium</option><option value="fine">Fine</option>
                </select>
              </Field>
            </Row>
          </div>
        )}

        {steps[step] === "Timeline" && (
          <div>
            <SectionTitle title="Timeline & Triggers" subtitle="When did it start and what changed" />
            <Row>
              <Field label="Duration of hair loss (months)">
                <input className="hz-input" type="number" placeholder="e.g. 18" value={form.duration_months||""} onChange={e=>update("duration_months", e.target.value)} />
              </Field>
              <Field label="Rapid progression in last 6 months?">
                <select className="hz-select" value={form.rapid_progress||""} onChange={e=>update("rapid_progress", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="Any sudden trigger in last 3 months?">
                <select className="hz-select" value={form.sudden_trigger||""} onChange={e=>update("sudden_trigger", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="High stress recently?">
                <select className="hz-select" value={form.recent_stress||""} onChange={e=>update("recent_stress", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </Row>
          </div>
        )}

        {steps[step] === "Scalp & Symptoms" && (
          <div>
            <SectionTitle title="Scalp & Symptoms" subtitle="What you feel on scalp" />
            <Row>
              <Field label="Itching">
                <select className="hz-select" value={form.itching||""} onChange={e=>update("itching", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Dandruff or flaking">
                <select className="hz-select" value={form.dandruff||""} onChange={e=>update("dandruff", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="Scalp pain or burning">
                <select className="hz-select" value={form.trichodynia||""} onChange={e=>update("trichodynia", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Oily scalp">
                <select className="hz-select" value={form.oily_scalp||""} onChange={e=>update("oily_scalp", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </Row>
          </div>
        )}

        {steps[step] === "Medical & Lifestyle" && (
          <div>
            <SectionTitle title="Medical & Lifestyle" subtitle="History and current use" />
            <Row>
              <Field label="Thyroid disorder diagnosed?">
                <select className="hz-select" value={form.hx_thyroid||""} onChange={e=>update("hx_thyroid", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              {form.sex==="female" && (
                <Field label="PCOS diagnosed?">
                  <select className="hz-select" value={form.hx_pcos||""} onChange={e=>update("hx_pcos", e.target.value)}>
                    <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              )}
            </Row>
            <Row>
              <Field label="Anemia or low iron history?">
                <select className="hz-select" value={form.hx_anemia||""} onChange={e=>update("hx_anemia", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Autoimmune condition?">
                <select className="hz-select" value={form.hx_autoimmune||""} onChange={e=>update("hx_autoimmune", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="Diabetes?">
                <select className="hz-select" value={form.hx_diabetes||""} onChange={e=>update("hx_diabetes", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Smoker?">
                <select className="hz-select" value={form.smoker||""} onChange={e=>update("smoker", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </Row>
            <div className="hz-hr" />
            <Row>
              <Field label="Currently on minoxidil?">
                <select className="hz-select" value={form.on_minox||""} onChange={e=>update("on_minox", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Currently on finasteride/dutasteride?">
                <select className="hz-select" value={form.on_fina||""} onChange={e=>update("on_fina", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="On anticoagulants (blood thinners)?">
                <select className="hz-select" value={form.on_anticoagulants||""} onChange={e=>update("on_anticoagulants", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Known platelet disorder?">
                <select className="hz-select" value={form.platelet_disorder||""} onChange={e=>update("platelet_disorder", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </Row>
            <Field label="Any other medical issues or medications?">
              <textarea className="hz-textarea" placeholder="Free text" value={form.other_medical||""} onChange={e=>update("other_medical", e.target.value)} />
            </Field>
          </div>
        )}

        {steps[step] === "Labs (optional)" && (
          <div>
            <SectionTitle title="Labs (optional)" subtitle="Enter if available" />
            <Row>
              <Field label="Ferritin (ng/mL)">
                <input className="hz-input" type="number" value={form.lab_ferritin||""} onChange={e=>update("lab_ferritin", e.target.value)} />
              </Field>
              <Field label="Hemoglobin (g/dL)">
                <input className="hz-input" type="number" value={form.lab_hb||""} onChange={e=>update("lab_hb", e.target.value)} />
              </Field>
            </Row>
            <Row>
              <Field label="TSH (mIU/L)">
                <input className="hz-input" type="number" value={form.lab_tsh||""} onChange={e=>update("lab_tsh", e.target.value)} />
              </Field>
              <Field label="Vitamin D (ng/mL)">
                <input className="hz-input" type="number" value={form.lab_vitd||""} onChange={e=>update("lab_vitd", e.target.value)} />
              </Field>
            </Row>
          </div>
        )}

        {steps[step] === "Preferences" && (
          <div>
            <SectionTitle title="Preferences" subtitle="What you are comfortable with" />
            <Row>
              <Field label="Willing for medications?">
                <select className="hz-select" value={form.willingness_meds||""} onChange={e=>update("willingness_meds", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Willing for PRP/course of sessions?">
                <select className="hz-select" value={form.willingness_prp||""} onChange={e=>update("willingness_prp", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="Willing for transplant if suitable?">
                <select className="hz-select" value={form.willingness_surgery||""} onChange={e=>update("willingness_surgery", e.target.value)}>
                  <option value="">Select</option>{YESNO.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Budget range">
                <select className="hz-select" value={form.budget||""} onChange={e=>update("budget", e.target.value)}>
                  <option value="">Select</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </Field>
            </Row>
          </div>
        )}

        {steps[step] === "Summary" && (
          <div>
            <SectionTitle title="Summary" subtitle="Estimated segmentation based on your inputs" />
            <div className="hz-alert hz-muted" style={{ fontSize: 12 }}>
              This tool offers an initial triage and is not a medical diagnosis. A clinician should confirm your plan.
            </div>
            <div className="hz-hr" />
            <div className="hz-muted" style={{ fontSize: 12 }}>Lead bucket</div>
            <div style={{ fontWeight: 600 }}>{result.leadBucket}</div>
            <div className="hz-muted" style={{ fontSize: 12, marginTop: 8 }}>Primary path</div>
            <div style={{ fontWeight: 600 }}>{result.primaryPath}</div>
            <div className="hz-muted" style={{ fontSize: 12, marginTop: 8 }}>All suggested paths</div>
            <div className="hz-badges" style={{ marginTop: 6 }}>{result.paths.map((p)=> <Badge key={p} text={p} />)}</div>
            {result.flags.length>0 && (
              <div style={{ marginTop: 8 }}>
                <div className="hz-muted" style={{ fontSize: 12 }}>Flags</div>
                <div className="hz-badges" style={{ marginTop: 6 }}>{result.flags.map((f)=> <Badge key={f} text={f} />)}</div>
              </div>
            )}
            {result.notes.length>0 && (
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <div className="hz-muted" style={{ fontSize: 12 }}>Notes</div>
                <ul>{result.notes.map((n,i)=> <li key={i}>{n}</li>)}</ul>
              </div>
            )}
            {showJson && (<><div className="hz-muted" style={{ fontSize: 12, marginTop: 8 }}>Payload preview</div><pre className="hz-code">{JSON.stringify({ form, result }, null, 2)}</pre></>)}
          </div>
        )}

        <div className="hz-btns">
          <div className="hz-badges">{result.paths.map((p)=> <span className="hz-badge" key={p}>{p}</span>)}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {step>0 && <button className="hz-btn" onClick={()=>setStep(step-1)}>Back</button>}
            {step<steps.length-1 ? (
              <button className="hz-btn primary" onClick={()=>setStep(step+1)} disabled={step===0 && !consent}>Next</button>
            ) : (
              <button className="hz-btn primary" onClick={handleSubmit} disabled={submitting}>{submitting?"Submitting...":"Submit"}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Global mount for your page
window.HairWizard = window.HairWizard || {};
window.HairWizard.mount = function(selector, props){
  const el = document.querySelector(selector);
  if(!el){ console.error("HairWizard: target not found", selector); return; }
  const root = ReactDOM.createRoot(el);
  const defaults = window.__HAIR_WIZ_DEFAULTS__ || {};
  const merged = Object.assign({ title:"Hair Assessment & Segmentation", accentColor:"#5b9cff", shortMode:true, showJson:false }, defaults, props||{});
  root.render(<HairAssessmentWizard {...merged} />);
};
