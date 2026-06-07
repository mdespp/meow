import { useEffect, useMemo, useRef, useState } from "react";

function seedLog(type, title, note, severity = "Normal", time = "Jun 6, 2026, 9:40 AM") {
  return { id: `${type}-${title}-${time}`, type, title, note, severity, time, person: "Sample Volunteer", role: "Volunteer" };
}

const initialCats = [
  {
    id: "luna", name: "Luna", initial: "L", room: "Cat Room", cage: "Cage 4", age: "3 years old", sex: "Female",
    mood: "Shy", favoriteToys: "Wand toy, soft mouse", wetFood: "Turkey pate", dryFood: "Sensitive stomach dry",
    handling: "Move slowly. No sudden pickup.",
    activeMedications: [
      { name: "Clavamox", route: "oral", schedule: "Every 12 hrs", directions: "Give with food when possible. Confirm concentration and label before giving." },
      { name: "Azithromycin", route: "oral", schedule: "Once daily", directions: "Use only if currently prescribed/approved." }
    ], medicalInfo: "Monitor appetite. Current weight 8.4 lb.",
    logs: [
      seedLog("feeding", "Breakfast feeding", "Ate some turkey pate.", "Normal", "Jun 6, 2026, 8:50 AM"),
      seedLog("medical", "Appetite concern", "Ate less than usual. Review again tomorrow.", "Needs review", "Jun 6, 2026, 9:40 AM"),
      seedLog("cleaning", "Cage needs spot clean", "Bedding soiled.", "Needs review", "Jun 6, 2026, 10:05 AM")
    ]
  },
  {
    id: "milo", name: "Milo", initial: "M", room: "Free room", cage: "Free room", age: "2 years old", sex: "Male",
    mood: "Friendly", favoriteToys: "Springs", wetFood: "Chicken pate", dryFood: "Regular dry",
    handling: "Likes petting. Okay with gentle handling.",
    activeMedications: [], medicalInfo: "No current medical notes.",
    logs: [seedLog("interaction", "Playtime", "Friendly, played with springs.", "Normal", "Jun 6, 2026, 12:20 PM")]
  },
  {
    id: "snowflake", name: "Snowflake", initial: "S", room: "Cat Room", cage: "Cage 2", age: "4 years old", sex: "Female",
    mood: "Quiet", favoriteToys: "Soft mouse", wetFood: "Seafood pate", dryFood: "Sensitive dry",
    handling: "Quiet. Let her come to you.", medicalInfo: "No current medical notes.", logs: []
  },
  {
    id: "bean", name: "Bean", initial: "B", room: "Free room", cage: "Free room", age: "10 months old", sex: "Male",
    mood: "Playful", favoriteToys: "Wand toy, tunnel", wetFood: "Kitten wet food", dryFood: "Kitten dry",
    handling: "Very playful. Watch the door.",
    activeMedications: [
      { name: "Panacur", route: "oral", schedule: "Once daily for 3–5 days", directions: "Confirm current weight and protocol before giving." }
    ], medicalInfo: "No current medical notes.",
    logs: [seedLog("cleaning", "Poop outside litterbox", "Found outside litterbox.", "Needs review", "Jun 6, 2026, 11:15 AM")]
  },
  {
    id: "olive", name: "Olive", initial: "O", room: "Cat Room", cage: "Cage 6", age: "6 years old", sex: "Female",
    mood: "Calm", favoriteToys: "Felt mouse", wetFood: "Chicken shreds", dryFood: "Indoor dry",
    handling: "Likes slow pets. Does not like being picked up.",
    activeMedications: [], medicalInfo: "No current medical notes.", logs: []
  },
  {
    id: "pepper", name: "Pepper", initial: "P", room: "Intake", cage: "Cage 1", age: "1 year old", sex: "Male",
    mood: "Nervous", favoriteToys: "String toy", wetFood: "Turkey pate", dryFood: "Sensitive dry",
    handling: "Give space at first. Watch body language.", medicalInfo: "Monitor sneezing.", logs: []
  },
  {
    id: "mochi", name: "Mochi", initial: "M", room: "Cat Room", cage: "Cage 8", age: "2 years old", sex: "Female",
    mood: "Sweet", favoriteToys: "Crinkle ball", wetFood: "Seafood pate", dryFood: "Regular dry",
    handling: "Very gentle. Likes chin scratches.", medicalInfo: "No current medical notes.", logs: []
  },
  {
    id: "toast", name: "Toast", initial: "T", room: "Free room", cage: "Free room", age: "4 years old", sex: "Male",
    mood: "Curious", favoriteToys: "Tunnel, wand toy", wetFood: "Chicken pate", dryFood: "Regular dry",
    handling: "Door dasher. Check before opening.", medicalInfo: "No current medical notes.", logs: []
  }
];

const initialApartmentLogs = [
  { id: "apt1", title: "Apartment log submitted", note: "Litterboxes, supplies, and windows checked.", severity: "Normal", time: "Jun 6, 2026, 7:05 PM", person: "Sample Volunteer", role: "Volunteer" },
  { id: "apt2", title: "Paper towels low", note: "Paper towels low in food prep area.", severity: "Needs review", time: "Jun 6, 2026, 7:18 PM", person: "Sample Volunteer", role: "Volunteer" }
];

function nowLabel() {
  return new Date().toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function dayOnly(x) { return String(x || "").split(",").slice(0, 2).join(",").trim(); }
function dateInputToDayLabel(value) {
  if (!value) return "Jun 6, 2026";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Jun 6, 2026";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function label(type) {
  return { feeding: "Feeding", cleaning: "Cleaning", interaction: "Interaction", medical: "Medical", note: "Note", apartment: "Apartment", profile: "Profile" }[type] || type;
}
function tone(severity) { return severity === "Urgent" ? "danger" : severity === "Needs review" ? "warning" : "normal"; }

export default function App() {
  const [cats, setCats] = useState(initialCats);
  const [aptLogs, setAptLogs] = useState(initialApartmentLogs);
  const [selectedCatId, setSelectedCatId] = useState("luna");
  const [profileCatIds, setProfileCatIds] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState("");
  const [profileLogDate, setProfileLogDate] = useState("2026-06-06");
  const profileRef = useRef(null);
  const hasAutoScrolledToProfile = useRef(false);
  const todayPanelRef = useRef(null);
  const [todayHeight, setTodayHeight] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState("Cat Apartment");
  const [day, setDay] = useState("Jun 6, 2026");
  const [modal, setModal] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminDateRange, setAdminDateRange] = useState({ from: "2026-06-01", to: "2026-06-06" });
  const [adminReportDate, setAdminReportDate] = useState("2026-06-06");
  const [adminFilters, setAdminFilters] = useState(["all"]);
  const [excelExportOptions, setExcelExportOptions] = useState({ range: "today", from: "2026-06-01", to: "2026-06-06", types: ["all"], include: ["cat", "apartment", "medical", "incidents", "medication"] });
  const [adminEditCat, setAdminEditCat] = useState(null);
  const [adminMedicalCat, setAdminMedicalCat] = useState(null);

  const cat = cats.find(c => c.id === selectedCatId);
  const activeProfileCat = cats.find(c => c.id === activeProfileId) || cats.find(c => c.id === profileCatIds[0]) || cat;
  const profileLogDay = dateInputToDayLabel(profileLogDate);
  const activeProfileLogs = activeProfileCat?.logs?.filter(l => dayOnly(l.time) === profileLogDay) || [];

  const issues = useMemo(() => {
    const catIssues = cats.flatMap(c => c.logs.filter(l => l.severity !== "Normal").map(l => ({ ...l, source: c.name, catId: c.id })));
    const aptIssues = aptLogs.filter(l => l.severity !== "Normal").map(l => ({ ...l, type: "apartment", source: "Apartment", catId: null }));
    return [...catIssues, ...aptIssues];
  }, [cats, aptLogs]);

  const days = useMemo(() => {
    const s = new Set(["Jun 6, 2026"]);
    cats.forEach(c => c.logs.forEach(l => s.add(dayOnly(l.time))));
    aptLogs.forEach(l => s.add(dayOnly(l.time)));
    return Array.from(s);
  }, [cats, aptLogs]);

  const filteredCats = cats.filter(c => !profileCatIds.includes(c.id) && `${c.name} ${c.room} ${c.cage} ${c.mood}`.toLowerCase().includes(query.toLowerCase()));
  const allCatLogsToday = cats.flatMap(c => c.logs.filter(l => dayOnly(l.time) === day).map(l => ({ ...l, who: c.name, catId: c.id })));
  const aptLogsToday = aptLogs.filter(l => dayOnly(l.time) === day).map(l => ({ ...l, who: "Apartment", type: "apartment" }));

  useEffect(() => {
    const element = todayPanelRef.current;
    if (!element) return;

    const updateHeight = () => {
      if (window.innerWidth <= 900) {
        setTodayHeight(null);
        return;
      }

      setTodayHeight(Math.ceil(element.getBoundingClientRect().height));
    };

    updateHeight();

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateHeight);
      observer.observe(element);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [issues.length, allCatLogsToday.length, aptLogsToday.length, page, day]);

  function toggleProfileCat(catId) {
    const wasEmpty = profileCatIds.length === 0;

    if (profileCatIds.includes(catId)) {
      setActiveProfileId(catId);
      setSelectedCatId(catId);
      return;
    }

    if (profileCatIds.length >= 5) {
      alert("Pick up to 5 cats at once.");
      return;
    }

    setProfileCatIds((current) => [...current, catId]);
    setActiveProfileId(catId);
    setSelectedCatId(catId);

    if (wasEmpty && !hasAutoScrolledToProfile.current) {
      hasAutoScrolledToProfile.current = true;
      setTimeout(() => profileRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }

  function removeProfileCat(catId) {
    setProfileCatIds((current) => {
      const next = current.filter((id) => id !== catId);
      if (activeProfileId === catId) {
        const nextActive = next[0] || "";
        setActiveProfileId(nextActive);
        if (nextActive) setSelectedCatId(nextActive);
      }
      return next;
    });
  }

  function updateCat(nextCat) {
    setCats(list => list.map(c => c.id === cat.id ? nextCat : c));
  }

  function addCatLog(log) {
    const saved = { id: `log-${Date.now()}`, time: nowLabel(), ...log };
    updateCat({ ...cat, logs: [saved, ...cat.logs] });
    setDay(dayOnly(saved.time));
    setModal(null);
  }

  function addCatLogs(catIds, logsByCat, personInfo) {
    const time = nowLabel();

    setCats((list) =>
      list.map((currentCat) => {
        if (!catIds.includes(currentCat.id)) return currentCat;

        const data = logsByCat[currentCat.id];
        const savedLogs = buildLogsForCat(currentCat, data, personInfo, time);

        return {
          ...currentCat,
          logs: [...savedLogs, ...currentCat.logs],
        };
      })
    );

    setDay(dayOnly(time));
    setModal(null);
  }

  function addApartmentLog(log) {
    const saved = { id: `apt-${Date.now()}`, time: nowLabel(), ...log };
    setAptLogs(list => [saved, ...list]);
    setDay(dayOnly(saved.time));
    setModal(null);
  }

  function saveProfile(profile) {
    const current = activeProfileCat || cat;
    setCats(list => list.map(c => c.id === current.id ? {
      ...current,
      ...profile,
      logs: [{ id: `profile-${Date.now()}`, type: "profile", title: "Profile updated", note: "Cat profile details were updated.", severity: "Normal", time: nowLabel(), person: profile.person, role: profile.role }, ...current.logs]
    } : c));
    setModal(null);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><div className="logo logo-image"><img src={`${import.meta.env.BASE_URL}meowsquad-logo.png`} alt="MeowSquad logo" /></div><div><h1>MEOWSQUAD</h1><p>Care log portal</p></div></div>
        <nav className="page-tabs">
          <button
            className={page === "Cat Apartment" ? "active" : ""}
            onClick={() => setPage("Cat Apartment")}
            type="button"
          >
            Cat Apartment
          </button>

          <button
            className={page === "Foster" ? "active" : ""}
            onClick={() => setModal("fosterPlaceholder")}
            type="button"
          >
            Foster
          </button>

          <button
            className={page === "Admin" ? "active" : ""}
            onClick={() => setModal("adminPassword")}
            type="button"
          >
            Admin
          </button>

          <button
            className="help-nav"
            onClick={() => setModal("help")}
            type="button"
          >
            Help / Handbook
          </button>
        </nav>
      </header>

      <main>
        {page === "Admin" ? (
          <AdminPage
            cats={cats}
            issues={issues}
            allCatLogsToday={allCatLogsToday}
            aptLogsToday={aptLogsToday}
            dateRange={adminDateRange}
            setDateRange={setAdminDateRange}
            reportDate={adminReportDate}
            setReportDate={setAdminReportDate}
            filters={adminFilters}
            setFilters={setAdminFilters}
            onOpenExcel={() => setModal("excelExport")}
            onEditCat={(cat) => { setAdminEditCat(cat); setModal("adminEditProfile"); }}
            onMedicalCat={(cat) => { setAdminMedicalCat(cat); setModal("adminMedical"); }}
            onReturnHome={() => setPage("Cat Apartment")}
          />
        ) : (
          <>

        

        <section className="hub-row hub-pills">
          <button className="hub-pill action" onClick={() => setModal("catLog")}>
            <span className="plus">+</span>Cat Log
          </button>

          <button className="hub-pill action" onClick={() => setModal("aptLog")}>
            <span className="plus">+</span>Apartment Log
          </button>

          <button className="hub-pill alert" onClick={() => setModal("alerts")}>
            🔔 Alerts <span className="alert-badge">{issues.length}</span>
          </button>
        </section>

        <section className="workspace">
          <aside className="cat-list" id="cats" style={todayHeight ? { "--today-panel-height": `${todayHeight}px` } : undefined}>
            <div className="card-head center"><span className="eyebrow">Cats</span><h2>Cat List</h2></div>
            <div className="search-row"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search cats..." /><button onClick={() => { setQuery(""); setProfileCatIds([]); setActiveProfileId(""); }}>Clear</button></div>
            <div className="cat-list-tabs">
              {profileCatIds.length === 0 && <span>No cats picked yet.</span>}
              {profileCatIds.map(id => {
                const pickedCat = cats.find(c => c.id === id);
                if (!pickedCat) return null;
                return (
                  <button
                    key={id}
                    className={activeProfileId === id ? "file-tab active" : "file-tab"}
                    onClick={() => { setActiveProfileId(id); setSelectedCatId(id); }}
                    type="button"
                  >
                    <i>{pickedCat.initial}</i>{pickedCat.name}
                    <b onClick={(event) => { event.stopPropagation(); removeProfileCat(id); }}>×</b>
                  </button>
                );
              })}
            </div>
            <div className="cat-scroll">
              {filteredCats.map(c => {
                const hasIssue = c.logs.some(l => l.severity !== "Normal");
                return <button key={c.id} className="cat-tile" onClick={() => toggleProfileCat(c.id)}>
                  <div className="avatar">{c.initial}</div><div><strong>{c.name}</strong><p>{c.room} · {c.cage}</p><span>{c.mood}</span>{hasIssue && <em>Needs attention</em>}</div><small>Full profile</small>
                </button>
              })}
            </div>
          </aside>

          <section className="today-panel" ref={todayPanelRef}>
            <div className="panel-title no-date-picker"><div><h2>Today at {page}</h2><p>Default view. Open a form only when adding a log.</p></div></div>

            <div className="mini-section">
              <div className="mini-section-head"><h3>Needs attention</h3><span>Normal notes stay in history.</span></div>
              <div className="stack">
                {issues.length === 0 && <p className="empty">No open issues.</p>}
                {issues.slice(0, 4).map(i => <button key={i.id} className={`attention-row ${tone(i.severity)}`} onClick={() => i.catId && toggleProfileCat(i.catId)}><i>!</i><div><strong>{i.source}</strong><p>{i.title} · {i.time}</p></div><span>{label(i.type)}</span></button>)}
              </div>
            </div>

            <div className="mini-section">
              <div className="mini-section-head"><h3>Today’s logs</h3><span>Newest first.</span></div>
              <div className="stack">
                {[...allCatLogsToday, ...aptLogsToday].sort((a, b) => String(b.time).localeCompare(String(a.time))).map(l => <article className="submitted-row" key={`${l.who}-${l.id}`}><i>{l.who[0]}</i><div><strong>{label(l.type)} log submitted</strong><p>{l.who} · {l.title} · {l.time}</p></div><button onClick={() => setModal({type:"details", log:l})}>Details</button></article>)}
              </div>
            </div>
          </section>
        </section>

        <section className="profile-wide-wrap" id="profile" ref={profileRef}>
          <div className="profile-file-tabs">
            {profileCatIds.map(id => {
              const pickedCat = cats.find(c => c.id === id);
              if (!pickedCat) return null;
              return (
                <button
                  key={id}
                  className={activeProfileId === id ? "profile-file-tab active" : "profile-file-tab"}
                  onClick={() => { setActiveProfileId(id); setSelectedCatId(id); }}
                  type="button"
                >
                  <i>{pickedCat.initial}</i>{pickedCat.name}
                  <b onClick={(event) => { event.stopPropagation(); removeProfileCat(id); }}>×</b>
                </button>
              );
            })}
          </div>

          {profileCatIds.length === 0 ? (
            <section className="profile-card empty-profile-card">
              Pick a cat from the Cat List to show the profile here.
            </section>
          ) : (
            <section className="profile-card wide-profile">
              <div className="profile-left"><div className="photo">Photo</div><div><span className="eyebrow">Cat profile</span><h2>{activeProfileCat.name}</h2><p>{activeProfileCat.sex} · {activeProfileCat.age} · {activeProfileCat.room} · {activeProfileCat.cage}</p></div></div>
              <button className="plain-pill" onClick={() => setModal("editProfile")}>Edit profile</button>
              <div className="profile-tags">
                <span><b>Wet food</b>{activeProfileCat.wetFood}</span><span><b>Dry food</b>{activeProfileCat.dryFood}</span><span><b>Toys</b>{activeProfileCat.favoriteToys}</span>
                <span><b>Mood</b>{activeProfileCat.mood}</span><span><b>Medical info</b>{activeProfileCat.medicalInfo}</span><span><b>Handling</b>{activeProfileCat.handling}</span>
              </div>

              <section className="profile-day-logs">
                <div className="profile-log-toolbar">
                  <p>Showing selected cat’s logs for this date.</p>
                  <label>
                    <span>Day</span>
                    <input type="date" value={profileLogDate} onChange={(event) => setProfileLogDate(event.target.value)} />
                  </label>
                </div>

                <div className="profile-log-list">
                  {activeProfileLogs.length === 0 && <p className="empty profile-log-empty">No logs for this cat on this date.</p>}
                  {activeProfileLogs.map(log => (
                    <article className={`profile-log-row ${log.severity !== "Normal" ? "alert" : ""}`} key={log.id}>
                      <i>{activeProfileCat.initial}</i>
                      <div>
                        <strong>{log.title}</strong>
                        <p>{log.note} · {log.time.split(", ").slice(-1)[0]}</p>
                      </div>
                      <button onClick={() => setModal({type:"details", log})}>Details</button>
                    </article>
                  ))}
                </div>
              </section>
            </section>
          )}
        </section>

          </>
        )}
      </main>

      {modal === "catLog" && <CatLogModal cats={cats} startingCatId={selectedCatId} onClose={() => setModal(null)} onSave={addCatLogs} />}
      {modal === "aptLog" && <ApartmentLogModal onClose={() => setModal(null)} onSave={addApartmentLog} />}
      {modal === "editProfile" && <EditProfileModal cat={activeProfileCat} onClose={() => setModal(null)} onSave={saveProfile} />}
      {modal === "alerts" && <SimpleModal title="Alerts" onClose={() => setModal(null)}>{issues.map(i => <article className={`modal-row ${tone(i.severity)}`} key={i.id}><strong>{i.source}: {i.title}</strong><p>{i.note}</p><span>{label(i.type)} · {i.time}</span></article>)}</SimpleModal>}
      {modal === "help" && <HandbookHelpModal onClose={() => setModal(null)} onOpenHandbook={() => setModal("handbookViewer")} />}
      {modal === "handbookViewer" && <HandbookViewerModal onClose={() => setModal(null)} onBack={() => setModal("help")} />}
      {modal === "fosterPlaceholder" && (
        <SimpleModal title="Foster" onClose={() => setModal(null)}>
          <p className="help-text">Foster tools can go here later. For now, this section is intentionally empty while MeowSquad decides what foster users should see.</p>
        </SimpleModal>
      )}

      {modal === "adminPassword" && (
        <AdminPasswordModal
          value={adminPassword}
          setValue={setAdminPassword}
          onClose={() => setModal(null)}
          onAccess={() => {
            if (adminPassword.trim()) {
              setPage("Admin");
              setAdminPassword("");
              setModal(null);
            }
          }}
        />
      )}

      {modal === "excelExport" && (
        <ExcelExportModal
          options={excelExportOptions}
          setOptions={setExcelExportOptions}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "adminEditProfile" && adminEditCat && (
        <AdminEditProfileModal
          cat={adminEditCat}
          onClose={() => {
            setAdminEditCat(null);
            setModal(null);
          }}
        />
      )}

      {modal === "adminMedical" && adminMedicalCat && (
        <AdminMedicalModal
          cat={adminMedicalCat}
          onClose={() => {
            setAdminMedicalCat(null);
            setModal(null);
          }}
        />
      )}
      {modal?.type === "details" && <SimpleModal title={modal.log.title} onClose={() => setModal(null)}><p>{modal.log.note}</p><p className="help-text">{modal.log.time} · {modal.log.person || "Unknown"} ({modal.log.role || "Role not listed"})</p></SimpleModal>}
    </div>
  );
}




function HandbookHelpModal({ onClose, onOpenHandbook }) {
  const topics = [
    {
      id: "cat-log",
      group: "Cat Log",
      title: "How to use Cat Log",
      tags: ["cat log", "forms"],
      summary: "Use Cat Log when something belongs to a specific cat. Pick the cat first, then add feeding, cleaning/litterbox, behavior, medical, medication, incident, or a general note.",
      note: "Each selected cat still gets an individual log. Do not batch one note across cats unless each cat has been reviewed.",
      checks: ["Select the correct cat", "Add only the sections that actually happened", "Routine notes stay in history", "Concerns can become alerts"],
      logFields: ["Volunteer first and last name", "Time/date", "Selected cat", "Care section", "Details if needed"]
    },
    {
      id: "medical-concern",
      group: "Medical",
      title: "When to add a medical concern",
      tags: ["cat log", "medical", "foster"],
      summary: "Use this when something is outside normal routine care: not eating, vomiting, diarrhea, sneezing/URI signs, eye discharge, wound, lethargy, unable to urinate, or sudden behavior change.",
      note: "This should create an alert unless it is marked as a routine note.",
      checks: ["Eating less or not eating", "Vomiting or diarrhea", "Eye/nose discharge", "Lethargy or hiding unusually", "Trouble using litterbox", "Visible wound or limping"],
      logFields: ["Concern type", "Severity", "What you saw", "Time noticed", "Whether leadership was contacted"]
    },
    {
      id: "who-contact",
      group: "Medical",
      title: "Who to contact",
      tags: ["medical", "incident", "foster"],
      summary: "Contact leadership when a concern is urgent, worsening, safety-related, or outside routine volunteer judgment.",
      note: "Volunteers should not make independent medical decisions.",
      checks: ["Breathing concern", "Unable to urinate", "Severe injury", "Repeated vomiting/diarrhea", "Bite or scratch incident", "Escape or unsafe condition"],
      logFields: ["Who was contacted", "When they were contacted", "What instructions were given", "Follow-up needed"]
    },
    {
      id: "med-lookup",
      group: "Medication",
      title: "Medication lookup",
      tags: ["medication", "medical"],
      summary: "Use only as a quick reference area for approved medication instructions. It should never replace leadership or veterinary directions.",
      note: "Always verify medication name, concentration, dose, route, frequency, and current weight before logging.",
      checks: ["Medication name matches label", "Dose matches instruction", "Route is correct", "Cat is the correct cat", "Timing is correct"],
      logFields: ["Medication", "Dose/amount", "Route", "Time", "Reaction/refusal note"]
    },
    {
      id: "med-log",
      group: "Medication",
      title: "Medication given log",
      tags: ["medication", "forms", "cat log"],
      summary: "Use this when medication was actually given. The form should capture enough detail for another trained person to understand what happened.",
      note: "This can stay locked or only visible to trained users.",
      checks: ["Medication was approved", "Cat identity was checked", "Dose was confirmed", "Any refusal/reaction was noted"],
      logFields: ["Medication name", "Dose/amount", "Route", "Given by", "Time given", "Reaction or refusal"]
    },
    {
      id: "apartment-checklist",
      group: "Apartment Log",
      title: "Apartment shift checklist",
      tags: ["apartment", "forms"],
      summary: "Use Apartment Log for shared-space care that does not belong to one cat.",
      note: "Apartment Log is not cat-specific.",
      checks: ["Food/water stations checked", "Litterbox areas checked", "Laundry/trash handled", "Supplies restocked", "Windows/doors secure", "Unsafe items removed"],
      logFields: ["Area", "Task completed", "Issue found", "Volunteer name", "Optional note"]
    },
    {
      id: "foster-update",
      group: "Foster",
      title: "Foster update guidance",
      tags: ["foster", "forms"],
      summary: "Foster updates should be shorter than the Cat Apartment flow but still clear enough for follow-up.",
      note: "Foster logs should focus on what MeowSquad needs to know next.",
      checks: ["Appetite", "Litterbox", "Behavior", "Medication if any", "Medical concern if any", "Supplies needed"],
      logFields: ["Cat name", "Foster name", "Update type", "Main note", "Follow-up needed"]
    },
    {
      id: "incident-report",
      group: "Incident",
      title: "Incident report",
      tags: ["incident", "forms"],
      summary: "Use for bites, scratches, escapes, injuries, unsafe conditions, or any person/animal safety issue.",
      note: "This should be PDF-ready later for records.",
      checks: ["Person or animal involved", "What happened", "Where it happened", "First aid/actions taken", "Leadership notified"],
      logFields: ["Incident type", "Person involved", "Cat involved", "Description", "Actions taken", "Date/time"]
    },
    {
      id: "exports",
      group: "Forms",
      title: "Forms and exports",
      tags: ["forms", "admin"],
      summary: "Admin exports should default to everything, then allow filters when needed.",
      note: "Do not make volunteers think about exports while logging.",
      checks: ["Date range", "Cat or location", "Form type", "Alert status", "Submitted by"],
      logFields: ["Excel export", "Incident PDF", "Medication report", "Foster update report"]
    }
  ];

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState([]);
  const [activeId, setActiveId] = useState("med-log");

  const filterOptions = ["cat log", "apartment", "foster", "medical", "medication", "incident", "forms"];

  const shown = topics.filter((topic) => {
    const haystack = `${topic.group} ${topic.title} ${topic.tags.join(" ")} ${topic.summary} ${topic.checks.join(" ")}`.toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
    const matchesFilter = filters.length === 0 || topic.tags.some(tag => filters.includes(tag));
    return matchesQuery && matchesFilter;
  });

  const active = shown.find(topic => topic.id === activeId) || shown[0] || topics[0];

  function toggleFilter(filter) {
    setFilters(current => current.includes(filter) ? current.filter(item => item !== filter) : [...current, filter]);
  }

  function clearFilters() {
    setQuery("");
    setFilters([]);
    setActiveId("med-log");
  }

  return (
    <div className="modal-backdrop">
      <section className="modal-card handbook-hub-card">
        <div className="handbook-hub-top">
          <div>
            <h2>Help / Handbook</h2>
            <p>Search directly or filter topics. The full PDF stays available, but common guidance appears as compact internal pages.</p>
          </div>
          <div className="handbook-top-actions">
            <button className="handbook-full-pdf" onClick={onOpenHandbook} type="button">Full Handbook PDF</button>
            <button className="handbook-close-pill" onClick={onClose} type="button">× close</button>
          </div>
        </div>

        <div className="handbook-filter-box">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Direct lookup: vomiting, medication, kitten, post-op, litterbox, foster, cleaning..."
          />

          <div className="handbook-filter-pills">
            {filterOptions.map(filter => (
              <button
                key={filter}
                className={filters.includes(filter) ? "active" : ""}
                onClick={() => toggleFilter(filter)}
                type="button"
              >
                {filter === "cat log" ? "Cat log" : filter[0].toUpperCase() + filter.slice(1)}
              </button>
            ))}
            <button onClick={clearFilters} type="button">Clear filters</button>
          </div>

          <div className="handbook-status">
            Showing: {filters.length ? filters.join(" + ") : "all topics"} · {shown.length} item{shown.length === 1 ? "" : "s"} shown
          </div>
        </div>

        <div className="handbook-hub-grid">
          <aside className="handbook-list">
            {shown.length === 0 && <p className="handbook-empty">No results. Clear filters or search another word.</p>}
            {Object.entries(shown.reduce((groups, topic) => {
              groups[topic.group] = groups[topic.group] || [];
              groups[topic.group].push(topic);
              return groups;
            }, {})).map(([group, items]) => (
              <div className="handbook-group" key={group}>
                <h3>{group}</h3>
                {items.map(topic => (
                  <button
                    key={topic.id}
                    className={active?.id === topic.id ? "active" : ""}
                    onClick={() => setActiveId(topic.id)}
                    type="button"
                  >
                    <strong>{topic.title}</strong>
                    <span>{topic.tags.join(" · ")}</span>
                  </button>
                ))}
              </div>
            ))}
          </aside>

          <section className="handbook-detail">
            <span className="eyebrow">{active.group}</span>
            <h2>{active.title}</h2>
            <p>{active.summary}</p>
            <div className="handbook-callout">{active.note}</div>

            <div className="handbook-detail-columns">
              <article>
                <strong>What to check</strong>
                <ul>
                  {active.checks.map(item => <li key={item}>{item}</li>)}
                </ul>
              </article>
              <article>
                <strong>What to log</strong>
                <ul>
                  {active.logFields.map(item => <li key={item}>{item}</li>)}
                </ul>
              </article>
            </div>

            <div className="handbook-mini-cards">
              <article>
                <strong>Where it goes</strong>
                <p>Cat-specific items go to Cat Log. Shared-space items go to Apartment Log.</p>
              </article>
              <article>
                <strong>When it alerts</strong>
                <p>Only concerns, safety issues, or important submitted notes should show as alerts.</p>
              </article>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function HandbookViewerModal({ onClose, onBack }) {
  return (
    <div className="modal-backdrop">
      <section className="modal-card handbook-viewer-card">
        <div className="modal-top handbook-viewer-top">
          <div>
            <span className="eyebrow">Full handbook</span>
            <h2>MeowSquad Volunteer Handbook</h2>
          </div>
          <div className="handbook-actions">
            <button onClick={onBack} type="button">← back</button>
            <button onClick={onClose} type="button">× close</button>
          </div>
        </div>

        <div className="handbook-pdf-wrap">
          <iframe
            title="MeowSquad Volunteer Handbook PDF"
            src={`${import.meta.env.BASE_URL}MeowSquad-Volunteer-Handbook.pdf#toolbar=1&navpanes=0&scrollbar=1&page=1&zoom=page-fit`}
          />
          <div className="handbook-pdf-fallback">
            <p>If the preview does not load or looks cramped on your phone, open the handbook directly.</p>
            <a href={`${import.meta.env.BASE_URL}MeowSquad-Volunteer-Handbook.pdf`} target="_blank" rel="noreferrer">Open PDF</a>
          </div>
        </div>
      </section>
    </div>
  );
}


function SimpleModal({ title, children, onClose }) {
  return <div className="modal-backdrop"><section className="modal-card"><div className="modal-top"><h2>{title}</h2><button onClick={onClose}>× close</button></div><div className="modal-body">{children}</div></section></div>;
}

function PersonFields({ form, setForm }) {
  return <div className="two-col"><label>Your full name<input value={form.person} onChange={e => setForm({...form, person:e.target.value})} placeholder="First and last name" /></label><label>Role<select value={form.role} onChange={e => setForm({...form, role:e.target.value})}><option value="">Select role</option><option>Volunteer</option><option>Staff</option><option>Foster</option><option>Medical</option><option>Other</option></select></label></div>;
}




function AdminPage({ cats, issues, allCatLogsToday, aptLogsToday, dateRange, setDateRange, reportDate, setReportDate, filters, setFilters, onOpenExcel, onEditCat, onMedicalCat, onReturnHome }) {
  const [adminCatQuery, setAdminCatQuery] = useState("");
  const [activeAdminCatId, setActiveAdminCatId] = useState("");

  const filterOptions = [
    { id: "all", label: "All reports" },
    { id: "cat", label: "Cat logs" },
    { id: "apartment", label: "Apartment logs" },
    { id: "medical", label: "Medical" },
    { id: "cleaning", label: "Cleaning" },
    { id: "feeding", label: "Feeding" },
    { id: "incident", label: "Incidents" },
    { id: "medication", label: "Medication" },
    { id: "alerts", label: "Alerts only" }
  ];

  const allReports = [
    ...cats.flatMap(cat => cat.logs.map(log => ({ ...log, who: cat.name, catId: cat.id, sourceType: "cat" }))),
    ...aptLogsToday.map(log => ({ ...log, who: "Apartment", sourceType: "apartment" }))
  ];

  const selectedReportDay = dateInputToDayLabel(reportDate);
  const todaysReports = allReports.filter(log => dayOnly(log.time) === selectedReportDay);

  const filteredReports = todaysReports.filter(log => {
    if (filters.includes("all")) return true;
    const type = String(log.type || "").toLowerCase();
    const isAlert = log.severity && log.severity !== "Normal";
    return (
      (filters.includes("cat") && log.sourceType === "cat") ||
      (filters.includes("apartment") && log.sourceType === "apartment") ||
      (filters.includes("medical") && type.includes("medical")) ||
      (filters.includes("cleaning") && type.includes("cleaning")) ||
      (filters.includes("feeding") && type.includes("feeding")) ||
      (filters.includes("incident") && type.includes("incident")) ||
      (filters.includes("medication") && type.includes("medication")) ||
      (filters.includes("alerts") && isAlert)
    );
  });

  const searchedCats = cats.filter(cat => {
    const haystack = `${cat.name} ${cat.room} ${cat.cage} ${cat.mood} ${cat.medicalInfo}`.toLowerCase();
    return !adminCatQuery.trim() || haystack.includes(adminCatQuery.trim().toLowerCase());
  });

  const activeCat = cats.find(cat => cat.id === activeAdminCatId);
  const activeCatLogs = activeCat ? activeCat.logs : [];
  const activeStats = activeCat ? getAdminCatStats(activeCat) : null;
  const mostRecentReports = filteredReports.slice().sort((a, b) => String(b.time).localeCompare(String(a.time)));

  function toggleFilter(id) {
    if (id === "all") {
      setFilters(["all"]);
      return;
    }

    setFilters(current => {
      const withoutAll = current.filter(item => item !== "all");
      const next = withoutAll.includes(id) ? withoutAll.filter(item => item !== id) : [...withoutAll, id];
      return next.length ? next : ["all"];
    });
  }

  return (
    <section className="admin-page">
      <div className="admin-hero">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>Admin reports</h2>
          <p>Password-protected in the real version. Similar to the home dashboard, but with more detail for records, exports, and review.</p>
        </div>
        <button onClick={onReturnHome} type="button">Return home</button>
      </div>

      <div className="admin-summary-row">
        <article><strong>{cats.length}</strong><span>Pets</span></article>
        <article><strong>{todaysReports.length}</strong><span>Reports that day</span></article>
        <article><strong>{issues.length}</strong><span>Open alerts</span></article>
        <article><strong>{todaysReports.filter(log => log.severity !== "Normal").length}</strong><span>Concerns/incidents</span></article>
        <article><strong>{todaysReports.filter(log => log.type === "medication").length}</strong><span>Medication logs</span></article>
      </div>

      <section className="admin-controls-panel light-admin-controls">
        <div className="admin-day-filter">
          <strong>All reports for</strong>
          <label>
            <span>Day</span>
            <input type="date" value={reportDate} onChange={event => setReportDate(event.target.value)} />
          </label>
        </div>

        <div className="admin-filter-panel">
          <strong>Filter today’s reports</strong>
          <div className="admin-filter-pills">
            {filterOptions.map(option => (
              <button
                key={option.id}
                className={filters.includes(option.id) ? "active" : ""}
                onClick={() => toggleFilter(option.id)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-box admin-reports-full">
        <div className="admin-box-head">
          <div>
            <span className="eyebrow">Reports</span>
            <h3>All reports today</h3>
          </div>
          <p>Showing {selectedReportDay}. Newest first.</p>
        </div>

        <div className="admin-report-list full">
          {mostRecentReports.length === 0 && <p className="empty">No reports match this day and filter.</p>}
          {mostRecentReports.map(log => (
            <article className={`admin-report-card ${log.severity !== "Normal" ? "alert" : ""}`} key={`${log.who}-${log.id}`}>
              <i>{log.who[0]}</i>
              <div>
                <strong>{log.title}</strong>
                <p>{log.who} · {label(log.type)} · {log.time}</p>
              </div>
              <span>{log.severity === "Normal" ? "Log" : "Alert"}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-cat-review">
        <div className="admin-cat-list-panel">
          <div className="admin-box-head">
            <div>
              <span className="eyebrow">Pets</span>
              <h3>All cats</h3>
            </div>
            <p>Choose a cat to review details, charts, edits, and downloads.</p>
          </div>

          <div className="admin-cat-search-row">
            <input
              value={adminCatQuery}
              onChange={event => setAdminCatQuery(event.target.value)}
              placeholder="Search cats..."
            />
            <button type="button" onClick={() => setAdminCatQuery("")}>Clear</button>
          </div>

          <div className="admin-cat-picker-list">
            {searchedCats.map(cat => {
              const stats = getAdminCatStats(cat);
              return (
                <article className={`admin-cat-picker-card ${activeAdminCatId === cat.id ? "active" : ""}`} key={cat.id}>
                  <div className="avatar">{cat.initial}</div>
                  <div>
                    <strong>{cat.name}</strong>
                    <p>{cat.room} · {cat.cage} · {cat.mood}</p>
                    <small>{stats.concerns} concerns · {stats.normal} normal · {stats.total} total</small>
                  </div>
                  <button type="button" onClick={() => setActiveAdminCatId(cat.id)}>
                    Review
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <div className="admin-cat-detail-panel">
          {!activeCat && (
            <div className="admin-empty-detail">
              <span className="eyebrow">Cat details</span>
              <h3>Select a cat</h3>
              <p>Detailed charts and logs only load after you press Review, so the main admin page stays lighter.</p>
            </div>
          )}

          {activeCat && activeStats && (
            <>
              <div className="admin-selected-profile">
                <div className="photo">Photo</div>
                <div>
                  <span className="eyebrow">Cat profile</span>
                  <h3>{activeCat.name}</h3>
                  <p>{activeCat.sex} · {activeCat.age} · {activeCat.room} · {activeCat.cage}</p>
                </div>
                <div className="admin-cat-actions">
                  <button type="button" onClick={() => onEditCat(activeCat)}>Edit profile</button>
                  <button type="button" onClick={() => onMedicalCat(activeCat)}>Medical / weight</button>
                  <button type="button">Download cat data</button>
                </div>
              </div>

              <div className="admin-selected-fields">
                <span><b>Wet food</b>{activeCat.wetFood}</span>
                <span><b>Dry food</b>{activeCat.dryFood}</span>
                <span><b>Toys</b>{activeCat.favoriteToys}</span>
                <span><b>Mood</b>{activeCat.mood}</span>
                <span><b>Medical info</b>{activeCat.medicalInfo}</span>
                <span><b>Handling</b>{activeCat.handling}</span>
              </div>

              <div className="admin-medical-review">
                <div className="admin-box-head simple">
                  <div>
                    <span className="eyebrow">Medical</span>
                    <h3>Medical notes and directions</h3>
                  </div>
                  <button type="button" onClick={() => onMedicalCat(activeCat)}>Manage medical</button>
                </div>

                <div className="admin-medical-grid">
                  <article>
                    <strong>Current info</strong>
                    <p>{activeCat.medicalInfo}</p>
                  </article>
                  <article>
                    <strong>Current weight</strong>
                    <p>{activeCat.currentWeight || activeCat.medicalInfo?.match(/[\d.]+\s*lb/i)?.[0] || "No weight listed"}</p>
                  </article>
                  <article>
                    <strong>Directions</strong>
                    <p>Staff/admin can add medication directions, monitoring notes, restrictions, and follow-up instructions here.</p>
                  </article>
                </div>
              </div>

              <div className="admin-cat-stats-row">
                <article><strong>{activeStats.total}</strong><span>Total logs</span></article>
                <article><strong>{activeStats.concerns}</strong><span>Concerns</span></article>
                <article><strong>{activeStats.medical}</strong><span>Medical</span></article>
                <article><strong>{activeStats.feeding}</strong><span>Feeding</span></article>
              </div>

              <div className="admin-chart-card">
                <div className="admin-box-head simple">
                  <div>
                    <span className="eyebrow">Charts</span>
                    <h3>{activeCat.name}'s data</h3>
                  </div>
                  <p>Review trends for this cat.</p>
                </div>

                <div className="admin-bars">
                  {activeStats.chart.map(item => (
                    <div className="admin-bar-row" key={item.label}>
                      <strong>{item.label}</strong>
                      <div><span style={{ width: `${item.width}%` }} /></div>
                      <em>{item.value}</em>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-cat-log-panel">
                <div className="admin-box-head simple">
                  <div>
                    <span className="eyebrow">Reports</span>
                    <h3>Cat report history</h3>
                  </div>
                  <p>Only this cat.</p>
                </div>

                <div className="admin-report-list compact">
                  {activeCatLogs.length === 0 && <p className="empty">No logs yet for this cat.</p>}
                  {activeCatLogs.map(log => (
                    <article className={`admin-report-card ${log.severity !== "Normal" ? "alert" : ""}`} key={log.id}>
                      <i>{activeCat.initial}</i>
                      <div>
                        <strong>{log.title}</strong>
                        <p>{label(log.type)} · {log.note} · {log.time}</p>
                      </div>
                      <span>{log.severity === "Normal" ? "Log" : "Alert"}</span>
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="admin-export-panel">
        <div>
          <span className="eyebrow">Exports</span>
          <h3>Export tools</h3>
          <p>Use Download Excel to choose date range, report types, pet data, incidents, medication records, or foster updates.</p>
        </div>
        <div className="admin-export-actions">
          <button type="button" onClick={onOpenExcel}>Download Excel</button>
        </div>
      </section>
    </section>
  );
}

function getAdminCatStats(cat) {
  const logs = cat.logs || [];
  const counts = {
    total: logs.length,
    normal: logs.filter(log => log.severity === "Normal").length,
    concerns: logs.filter(log => log.severity !== "Normal" || log.type === "incident").length,
    medical: logs.filter(log => String(log.type || "").toLowerCase().includes("medical")).length,
    feeding: logs.filter(log => String(log.type || "").toLowerCase().includes("feeding")).length,
    cleaning: logs.filter(log => String(log.type || "").toLowerCase().includes("cleaning")).length,
    interaction: logs.filter(log => String(log.type || "").toLowerCase().includes("interaction")).length,
    medication: logs.filter(log => String(log.type || "").toLowerCase().includes("medication")).length
  };

  const max = Math.max(1, counts.total, counts.concerns, counts.medical, counts.feeding, counts.cleaning, counts.interaction, counts.medication);

  counts.chart = [
    { label: "Total", value: counts.total, width: counts.total === 0 ? 0 : Math.round((counts.total / max) * 100) },
    { label: "Concerns", value: counts.concerns, width: counts.concerns === 0 ? 0 : Math.round((counts.concerns / max) * 100) },
    { label: "Medical", value: counts.medical, width: counts.medical === 0 ? 0 : Math.round((counts.medical / max) * 100) },
    { label: "Feeding", value: counts.feeding, width: counts.feeding === 0 ? 0 : Math.round((counts.feeding / max) * 100) },
    { label: "Cleaning", value: counts.cleaning, width: counts.cleaning === 0 ? 0 : Math.round((counts.cleaning / max) * 100) },
    { label: "Interaction", value: counts.interaction === 0 ? 0 : counts.interaction, width: counts.interaction === 0 ? 0 : Math.round((counts.interaction / max) * 100) },
    { label: "Medication", value: counts.medication, width: counts.medication === 0 ? 0 : Math.round((counts.medication / max) * 100) }
  ];

  return counts;
}




function AdminEditProfileModal({ cat, onClose }) {
  const [draft, setDraft] = useState({
    wetFood: cat.wetFood || "",
    dryFood: cat.dryFood || "",
    favoriteToys: cat.favoriteToys || "",
    mood: cat.mood || "",
    medicalInfo: cat.medicalInfo || "",
    handling: cat.handling || "",
    room: cat.room || "",
    cage: cat.cage || ""
  });

  function update(field, value) {
    setDraft(current => ({ ...current, [field]: value }));
  }

  return (
    <div className="modal-backdrop">
      <section className="modal-card admin-edit-modal">
        <div className="modal-top">
          <div>
            <span className="eyebrow">Edit profile</span>
            <h2>{cat.name}</h2>
          </div>
          <button onClick={onClose} type="button">× close</button>
        </div>

        <div className="admin-edit-body">
          <p className="admin-edit-note">Prototype only: these fields show how admin editing should work. In the real app, saving would update the database and add a history note.</p>

          <div className="admin-edit-grid">
            <label>Room / area<input value={draft.room} onChange={event => update("room", event.target.value)} /></label>
            <label>Cage / location<input value={draft.cage} onChange={event => update("cage", event.target.value)} /></label>
            <label>Wet food<input value={draft.wetFood} onChange={event => update("wetFood", event.target.value)} /></label>
            <label>Dry food<input value={draft.dryFood} onChange={event => update("dryFood", event.target.value)} /></label>
            <label>Toys<input value={draft.favoriteToys} onChange={event => update("favoriteToys", event.target.value)} /></label>
            <label>Mood<input value={draft.mood} onChange={event => update("mood", event.target.value)} /></label>
            <label className="wide">Medical info<textarea value={draft.medicalInfo} onChange={event => update("medicalInfo", event.target.value)} /></label>
            <label className="wide">Handling<textarea value={draft.handling} onChange={event => update("handling", event.target.value)} /></label>
          </div>

          <div className="admin-edit-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="button" onClick={onClose}>Save profile</button>
          </div>
        </div>
      </section>
    </div>
  );
}


function AdminMedicalModal({ cat, onClose }) {
  const [weight, setWeight] = useState(cat.currentWeight || "");
  const [direction, setDirection] = useState(cat.medicalInfo || "");
  const [medications, setMedications] = useState(cat.activeMedications?.length ? cat.activeMedications : [
    { name: "", route: "oral", schedule: "", directions: "" }
  ]);

  const parsedWeight = parseCatWeight(weight);
  const medsWithDose = medications.map((med) => ({
    ...med,
    handbookDose: getHandbookDose(med.name, parsedWeight)
  }));

  function updateMedication(index, field, value) {
    setMedications(current => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function addMedication() {
    setMedications(current => [...current, { name: "", route: "oral", schedule: "", directions: "" }]);
  }

  function removeMedication(index) {
    setMedications(current => current.length === 1 ? [{ name: "", route: "oral", schedule: "", directions: "" }] : current.filter((_, i) => i !== index));
  }

  return (
    <div className="modal-backdrop">
      <section className="modal-card admin-medical-modal">
        <div className="modal-top">
          <div>
            <span className="eyebrow">Medical</span>
            <h2>{cat.name}</h2>
          </div>
          <button onClick={onClose} type="button">× close</button>
        </div>

        <div className="admin-medical-body">
          <p className="admin-edit-note">Prototype only. Admin/staff can update weight, active medications, and medical directions here. Doses are reference estimates from the handbook and still need staff/vet confirmation.</p>

          <section className="admin-medical-card">
            <div>
              <strong>Current weight</strong>
              <p>When the medication appears in the handbook chart, the reference dose updates from this weight.</p>
            </div>
            <input value={weight} onChange={event => setWeight(event.target.value)} placeholder="Example: 8.4 lb" />
          </section>

          <section className="admin-medical-card">
            <div>
              <strong>Medical directions</strong>
              <p>Use this for monitoring instructions, restrictions, vet/staff directions, and follow-up reminders.</p>
            </div>
            <textarea value={direction} onChange={event => setDirection(event.target.value)} placeholder="Directions or medical watch notes..." />
          </section>

          <section className="admin-medication-manager">
            <div className="admin-med-manager-top">
              <div>
                <strong>Active medications</strong>
                <p>Allow more than one medication. If the medication has a handbook chart and a weight is entered, the reference dose shows automatically.</p>
              </div>
              <button type="button" onClick={addMedication}>+ Add medication</button>
            </div>

            <div className="admin-med-list">
              {medsWithDose.map((med, index) => (
                <article className="admin-med-entry" key={index}>
                  <div className="admin-med-entry-top">
                    <strong>Medication {index + 1}</strong>
                    <button type="button" onClick={() => removeMedication(index)}>Remove</button>
                  </div>

                  <div className="admin-med-two">
                    <label>Medication name
                      <select value={med.name} onChange={event => updateMedication(index, "name", event.target.value)}>
                        <option value="">Choose medication</option>
                        <option value="Clavamox">Clavamox</option>
                        <option value="Azithromycin">Azithromycin</option>
                        <option value="Panacur">Panacur</option>
                        <option value="Doxycycline">Doxycycline</option>
                        <option value="Terramycin">Terramycin</option>
                        <option value="Other">Other / not in handbook chart</option>
                      </select>
                    </label>

                    <label>Route
                      <input value={med.route} onChange={event => updateMedication(index, "route", event.target.value)} placeholder="oral / eye / topical" />
                    </label>
                  </div>

                  <div className="admin-med-two">
                    <label>Schedule
                      <input value={med.schedule} onChange={event => updateMedication(index, "schedule", event.target.value)} placeholder="Every 12 hrs / once daily" />
                    </label>

                    <label>Reference dose
                      <input readOnly value={med.handbookDose?.dose || "No handbook dose for this weight/med"} />
                    </label>
                  </div>

                  {med.handbookDose && (
                    <div className="dose-reference-box">
                      <b>{med.name} handbook reference</b>
                      <span>{parsedWeight} lb → {med.handbookDose.dose} · {med.handbookDose.frequency}</span>
                    </div>
                  )}

                  <label className="wide-med-label">Directions / notes
                    <textarea value={med.directions} onChange={event => updateMedication(index, "directions", event.target.value)} placeholder="Give with food, watch for refusal, confirm label, etc." />
                  </label>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-medical-card danger-soft">
            <div>
              <strong>Remove outdated note</strong>
              <p>This would remove a resolved medication/direction from the active profile while keeping a history record.</p>
            </div>
            <button type="button">Remove selected note</button>
          </section>

          <div className="admin-edit-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="button" onClick={onClose}>Save medical updates</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function parseCatWeight(value) {
  const match = String(value || "").match(/[\d.]+/);
  if (!match) return null;
  return Math.round(Number(match[0]));
}

function getHandbookDose(name, weight) {
  if (!name || !weight) return null;
  const key = String(name).toLowerCase();

  const charts = {
    clavamox: {
      frequency: "Every 12 hrs",
      doses: {3:"0.3 mL",4:"0.4 mL",5:"0.5 mL",6:"0.6 mL",7:"0.7 mL",8:"0.8 mL",9:"0.9 mL",10:"1.0 mL",12:"1.2 mL",15:"1.5 mL",20:"2.0 mL"}
    },
    azithromycin: {
      frequency: "Once daily",
      doses: {3:"0.45 mL",4:"0.6 mL",5:"0.75 mL",6:"0.9 mL",7:"1.05 mL",8:"1.2 mL",9:"1.35 mL",10:"1.5 mL",11:"1.65 mL",12:"1.8 mL",13:"1.95 mL",14:"2.1 mL",15:"2.25 mL",16:"2.4 mL",17:"2.55 mL",18:"2.7 mL",19:"2.85 mL",20:"3.0 mL"}
    },
    panacur: {
      frequency: "Once daily for 3–5 days",
      doses: {3:"0.6 mL",4:"0.8 mL",5:"1.0 mL",6:"1.2 mL",7:"1.4 mL",8:"1.6 mL",9:"1.8 mL",10:"2.0 mL",11:"2.2 mL",12:"2.4 mL",13:"2.6 mL",14:"2.8 mL",15:"3.0 mL",16:"3.2 mL",17:"3.4 mL",18:"3.6 mL",19:"3.8 mL",20:"4.0 mL"}
    }
  };

  let chartKey = null;
  if (key.includes("clavamox")) chartKey = "clavamox";
  if (key.includes("azith")) chartKey = "azithromycin";
  if (key.includes("panacur") || key.includes("fenbendazole")) chartKey = "panacur";

  if (!chartKey) return null;
  const chart = charts[chartKey];
  const availableWeights = Object.keys(chart.doses).map(Number).sort((a, b) => a - b);
  const closest = availableWeights.reduce((best, current) => Math.abs(current - weight) < Math.abs(best - weight) ? current : best, availableWeights[0]);

  return {
    weight: closest,
    dose: chart.doses[closest],
    frequency: chart.frequency
  };
}


function ExcelExportModal({ options, setOptions, onClose }) {
  const typeOptions = [
    { id: "all", label: "Everything" },
    { id: "cat", label: "Cat logs" },
    { id: "apartment", label: "Apartment logs" },
    { id: "medical", label: "Medical" },
    { id: "cleaning", label: "Cleaning" },
    { id: "feeding", label: "Feeding" },
    { id: "incidents", label: "Incidents" },
    { id: "medication", label: "Medication" },
    { id: "alerts", label: "Alerts only" }
  ];

  const includeOptions = [
    { id: "cat", label: "Pet profiles" },
    { id: "apartment", label: "Apartment reports" },
    { id: "medical", label: "Medical notes" },
    { id: "incidents", label: "Incident reports" },
    { id: "medication", label: "Medication records" },
    { id: "foster", label: "Foster updates" }
  ];

  function toggleList(key, id) {
    setOptions(current => {
      if (key === "types" && id === "all") return { ...current, types: ["all"] };
      const withoutAll = key === "types" ? current[key].filter(item => item !== "all") : current[key];
      const next = withoutAll.includes(id) ? withoutAll.filter(item => item !== id) : [...withoutAll, id];
      return { ...current, [key]: next.length ? next : (key === "types" ? ["all"] : []) };
    });
  }

  return (
    <div className="modal-backdrop">
      <section className="modal-card excel-export-modal">
        <div className="modal-top">
          <div>
            <span className="eyebrow">Export</span>
            <h2>Download Excel</h2>
          </div>
          <button onClick={onClose} type="button">× close</button>
        </div>

        <div className="excel-export-body">
          <p className="excel-note">Use these options only when exporting. The admin page itself only loads the chosen day so it stays lighter.</p>

          <div className="excel-range-card">
            <strong>What date range?</strong>
            <div className="excel-choice-row">
              {["today", "range", "everything"].map(choice => (
                <button
                  key={choice}
                  className={options.range === choice ? "active" : ""}
                  onClick={() => setOptions({...options, range: choice})}
                  type="button"
                >
                  {choice === "today" ? "Today only" : choice === "range" ? "Choose range" : "Everything"}
                </button>
              ))}
            </div>

            {options.range === "range" && (
              <div className="excel-date-row">
                <label>From<input type="date" value={options.from} onChange={event => setOptions({...options, from: event.target.value})} /></label>
                <label>To<input type="date" value={options.to} onChange={event => setOptions({...options, to: event.target.value})} /></label>
              </div>
            )}
          </div>

          <div className="excel-range-card">
            <strong>Which reports?</strong>
            <div className="excel-pill-grid">
              {typeOptions.map(option => (
                <button
                  key={option.id}
                  className={options.types.includes(option.id) ? "active" : ""}
                  onClick={() => toggleList("types", option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="excel-range-card">
            <strong>Include sections</strong>
            <div className="excel-pill-grid">
              {includeOptions.map(option => (
                <button
                  key={option.id}
                  className={options.include.includes(option.id) ? "active" : ""}
                  onClick={() => toggleList("include", option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="excel-download-footer">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="button">Generate Excel</button>
          </div>
        </div>
      </section>
    </div>
  );
}


function AdminPasswordModal({ value, setValue, onClose, onAccess }) {
  return <SimpleModal title="Admin access" onClose={onClose}>
    <form className="compact-form" onSubmit={e => { e.preventDefault(); onAccess(); }}>
      <label>Admin password<input type="password" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter password" autoFocus /></label>
      <button className="submit-btn" disabled={!value.trim()}>Access admin</button>
    </form>
  </SimpleModal>;
}


function CatLogModal({ cats, startingCatId, onClose, onSave }) {
  const [step, setStep] = useState("person");
  const [person, setPerson] = useState({ firstName: "", lastName: "", role: "" });
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeCatId, setActiveCatId] = useState(startingCatId);
  const [expanded, setExpanded] = useState({
    food: false,
    cleaning: false,
    behavior: false,
    medical: false,
    medication: false,
    incident: false,
  });

  const [forms, setForms] = useState(() => {
    const starter = {};
    cats.forEach((cat) => {
      starter[cat.id] = emptyCatLogForm(cat);
    });
    return starter;
  });

  const filteredCats = cats.filter((cat) =>
    !selectedIds.includes(cat.id) &&
    `${cat.name} ${cat.room} ${cat.cage} ${cat.mood}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCat = cats.find((cat) => cat.id === activeCatId) || cats[0];
  const activeForm = forms[activeCat.id] || emptyCatLogForm(activeCat);

  function updateActive(section, patch) {
    setForms((current) => ({
      ...current,
      [activeCat.id]: {
        ...current[activeCat.id],
        [section]: {
          ...current[activeCat.id][section],
          ...patch,
        },
      },
    }));
  }

  function toggleCat(catId) {
    setSelectedIds((current) => {
      const next = current.includes(catId)
        ? current.filter((id) => id !== catId)
        : [...current, catId];

      if (!next.includes(activeCatId) && next.length > 0) {
        setActiveCatId(next[0]);
      }

      if (!activeCatId && next.length > 0) {
        setActiveCatId(next[0]);
      }

      return next;
    });
  }

  function clearActiveForm() {
    setForms((current) => ({
      ...current,
      [activeCat.id]: emptyCatLogForm(activeCat),
    }));
  }

  const canStartSelecting = person.firstName.trim() && person.lastName.trim() && person.role;
  const canStartLogs = selectedIds.length > 0;
  const allSelectedHaveData = selectedIds.length > 0 && selectedIds.every((id) => catFormHasData(forms[id]));

  return (
    <SimpleModal title={step === "person" ? "Volunteer info" : step === "select" ? "Select cats for Cat Log" : `Cat Log: ${activeCat.name}`} onClose={onClose}>
      {step === "person" && (
        <form className="catlog-person" onSubmit={(event) => {
          event.preventDefault();
          if (canStartSelecting) setStep("select");
        }}>
          <p className="catlog-help">Enter your name first. It will be attached to every cat log you submit.</p>

          <div className="two-col">
            <label>First name<input value={person.firstName} onChange={(event) => setPerson({ ...person, firstName: event.target.value })} placeholder="First name" autoFocus /></label>
            <label>Last name<input value={person.lastName} onChange={(event) => setPerson({ ...person, lastName: event.target.value })} placeholder="Last name" /></label>
          </div>

          <label>Role<select value={person.role} onChange={(event) => setPerson({ ...person, role: event.target.value })}>
            <option value="">Select role</option>
            <option>Volunteer</option>
            <option>Staff</option>
            <option>Foster</option>
            <option>Medical</option>
            <option>Other</option>
          </select></label>

          <div className="catlog-footer">
            <button type="button" className="ghost-pill" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={!canStartSelecting}>Continue</button>
          </div>
        </form>
      )}

      {step === "select" && (
        <div className="cat-select-step">
          <p className="catlog-help">Select all relevant cats first. Each cat will still get an individual log.</p>

          {selectedIds.length > 0 && (
            <div className="chosen-cat-pills" aria-label="Selected cats">
              {selectedIds.map((id) => {
                const selectedCat = cats.find((cat) => cat.id === id);
                if (!selectedCat) return null;
                return (
                  <button
                    type="button"
                    key={id}
                    className="chosen-cat-pill"
                    onClick={() => toggleCat(id)}
                    title={`Remove ${selectedCat.name}`}
                  >
                    <span className="chosen-cat-photo">{selectedCat.initial}</span>
                    <span>{selectedCat.name}</span>
                    <b>×</b>
                  </button>
                );
              })}
            </div>
          )}

          <input className="catlog-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cats..." />

          <div className="select-cat-list">
            {filteredCats.length === 0 && <p className="empty-select">No more cats match this search.</p>}
            {filteredCats.map((cat) => (
              <button
                type="button"
                key={cat.id}
                className="select-cat-row"
                onClick={() => toggleCat(cat.id)}
              >
                <span className="select-photo">{cat.initial}</span>
                <span>
                  <strong>{cat.name}</strong>
                  <em>{cat.cage}</em>
                  
                </span>
                <b>Select</b>
              </button>
            ))}
          </div>

          <div className="catlog-footer no-cancel">
            <span>{selectedIds.length} selected</span>
            <button
              type="button"
              className="submit-btn"
              disabled={!canStartLogs}
              onClick={() => {
                if (!selectedIds.includes(activeCatId)) setActiveCatId(selectedIds[0]);
                setStep("form");
              }}
            >
              Start Cat Logs
            </button>
          </div>
        </div>
      )}

      {step === "form" && (
        <div className="catlog-workspace">
          <aside className="catlog-sidebar">
            <h3>Selected cats</h3>
            <p>Switch cats. Your work is saved automatically.</p>

            <div className="selected-cat-stack">
              {selectedIds.map((id) => {
                const selectedCat = cats.find((cat) => cat.id === id);
                const complete = catFormHasData(forms[id]);
                return (
                  <button
                    type="button"
                    key={id}
                    className={id === activeCat.id ? "selected-cat active" : "selected-cat"}
                    onClick={() => setActiveCatId(id)}
                  >
                    <span className="avatar-lite">{selectedCat.initial}</span>
                    <span>
                      <strong>{selectedCat.name}</strong>
                      <em>{selectedCat.cage}</em>
                    </span>
                    <b className={complete ? "status-pill has-data" : "status-pill not-started"}>{complete ? "has data" : "not started"}</b>
                  </button>
                );
              })}
            </div>

            <div className="catlog-profile-card">
              <h3>{activeCat.name} profile</h3>
              <p>{activeCat.cage}</p>
              <small>{activeCat.mood}</small>
              <small className="auto-filled">auto-filled</small>
              <div className="profile-note-box">
                Food: {activeCat.wetFood}<br />
                Toy: {activeCat.favoriteToys}<br />
                Medical: {activeCat.medicalInfo}
              </div>
            </div>
          </aside>

          <section className="catlog-form-area">
            <h2>Cat Log: {activeCat.name}</h2>
            <p className="catlog-status">{catFormHasData(activeForm) ? "Auto-saved while editing." : "Not started yet."}</p>

            <ExpandableSection title="Food / water" tone="food" filled={sectionHasData(activeForm.food)} open={expanded.food} onToggle={() => setExpanded({ ...expanded, food: !expanded.food })}>
              <ChipGroup
                options={["Wet food offered", "Dry food available", "Water refilled", "Treats"]}
                selected={activeForm.food.items}
                onChange={(items) => updateActive("food", { items })}
              />
              <textarea value={activeForm.food.note} onChange={(event) => updateActive("food", { note: event.target.value })} placeholder="Food/water note, if needed." />
            </ExpandableSection>

            <ExpandableSection title="Litterbox / cage condition" tone="cleaning" filled={sectionHasData(activeForm.cleaning)} open={expanded.cleaning} onToggle={() => setExpanded({ ...expanded, cleaning: !expanded.cleaning })}>
              <ChipGroup
                options={["Looks normal", "Spot cleaned", "Needs cleaning", "Diarrhea", "No urine seen", "Blood seen"]}
                selected={activeForm.cleaning.items}
                onChange={(items) => updateActive("cleaning", { items })}
              />
              <textarea value={activeForm.cleaning.note} onChange={(event) => updateActive("cleaning", { note: event.target.value })} placeholder="Cleaning/litterbox note, if needed." />
            </ExpandableSection>

            <ExpandableSection title="Behavior / interaction" tone="behavior" filled={sectionHasData(activeForm.behavior)} open={expanded.behavior} onToggle={() => setExpanded({ ...expanded, behavior: !expanded.behavior })}>
              <ChipGroup
                options={["Friendly", "Shy", "Hiding", "Playful", "Stressed", "Not safe to handle"]}
                selected={activeForm.behavior.items}
                onChange={(items) => updateActive("behavior", { items })}
              />
              <textarea value={activeForm.behavior.note} onChange={(event) => updateActive("behavior", { note: event.target.value })} placeholder="Behavior note, if needed." />
            </ExpandableSection>

            <ExpandableSection title="Medical observation / concern" tone="warning" filled={sectionHasData(activeForm.medical)} open={expanded.medical} onToggle={() => setExpanded({ ...expanded, medical: !expanded.medical })}>
              <p className="section-help">Creates an alert unless marked “Just noting.”</p>
              <ChipGroup
                options={["Not eating", "Vomiting", "Diarrhea", "Sneezing / URI signs", "Eye discharge", "Wound", "Unable to urinate", "Lethargic"]}
                selected={activeForm.medical.items}
                onChange={(items) => updateActive("medical", { items })}
              />
              <select value={activeForm.medical.status} onChange={(event) => updateActive("medical", { status: event.target.value })}>
                <option>Just noting</option>
                <option>Needs review</option>
                <option>Urgent</option>
              </select>
              <textarea value={activeForm.medical.note} onChange={(event) => updateActive("medical", { note: event.target.value })} placeholder="Details, if needed." />
            </ExpandableSection>

            <ExpandableSection title="Medication given 🔒" tone="medication" filled={sectionHasData(activeForm.medication)} open={expanded.medication} onToggle={() => setExpanded({ ...expanded, medication: !expanded.medication })}>
              <p className="section-help">Could be password-protected later or shown only to trained users.</p>
              <div className="two-col">
                <input value={activeForm.medication.name} onChange={(event) => updateActive("medication", { name: event.target.value })} placeholder="Medication name" />
                <input value={activeForm.medication.amount} onChange={(event) => updateActive("medication", { amount: event.target.value })} placeholder="Dose / amount" />
              </div>
              <input value={activeForm.medication.route} onChange={(event) => updateActive("medication", { route: event.target.value })} placeholder="Route, e.g. oral / eye / topical" />
              <textarea value={activeForm.medication.note} onChange={(event) => updateActive("medication", { note: event.target.value })} placeholder="Reaction, refusal, or notes." />
            </ExpandableSection>

            <ExpandableSection title="Incident report" tone="danger" filled={sectionHasData(activeForm.incident)} open={expanded.incident} onToggle={() => setExpanded({ ...expanded, incident: !expanded.incident })}>
              <p className="section-help">Only use when needed. This can become a PDF-ready incident report later.</p>
              <ChipGroup
                options={["Bite", "Scratch", "Escape", "Injury", "Unsafe condition", "Washed with soap/water", "Antiseptic used", "Bandaged", "Leadership notified"]}
                selected={activeForm.incident.items}
                onChange={(items) => updateActive("incident", { items })}
              />
              <input value={activeForm.incident.personInvolved} onChange={(event) => updateActive("incident", { personInvolved: event.target.value })} placeholder="Person involved, leave blank if it was you" />
              <textarea value={activeForm.incident.note} onChange={(event) => updateActive("incident", { note: event.target.value })} placeholder="What happened?" />
            </ExpandableSection>

            <section className="optional-note-box">
              <h3>Optional general note</h3>
              <textarea value={activeForm.generalNote} onChange={(event) => setForms((current) => ({ ...current, [activeCat.id]: { ...current[activeCat.id], generalNote: event.target.value } }))} placeholder="Any extra notes." />
            </section>

            <div className="catlog-submit-row">
              <button type="button" className="danger-outline" onClick={clearActiveForm}>Clear form</button>
              <span>{allSelectedHaveData ? "Ready to submit." : "Add data to every selected cat before submitting."}</span>
              <button
                type="button"
                className="submit-btn"
                disabled={!allSelectedHaveData}
                onClick={() => onSave(selectedIds, forms, person)}
              >
                {selectedIds.length === 1 ? `Submit ${activeCat.name}` : "Submit data"}
              </button>
            </div>
          </section>
        </div>
      )}
    </SimpleModal>
  );
}

function emptyCatLogForm(cat) {
  return {
    food: { items: [], note: "" },
    cleaning: { items: [], note: "" },
    behavior: { items: [], note: "" },
    medical: { items: [], status: "Just noting", note: "" },
    medication: { name: "", amount: "", route: "", note: "" },
    incident: { items: [], personInvolved: "", note: "" },
    generalNote: "",
  };
}

function catFormHasData(form) {
  if (!form) return false;
  return (
    form.food.items.length > 0 ||
    form.food.note.trim() ||
    form.cleaning.items.length > 0 ||
    form.cleaning.note.trim() ||
    form.behavior.items.length > 0 ||
    form.behavior.note.trim() ||
    form.medical.items.length > 0 ||
    form.medical.note.trim() ||
    form.medication.name.trim() ||
    form.medication.amount.trim() ||
    form.medication.route.trim() ||
    form.medication.note.trim() ||
    form.incident.items.length > 0 ||
    form.incident.personInvolved.trim() ||
    form.incident.note.trim() ||
    form.generalNote.trim()
  );
}


function sectionHasData(section) {
  if (!section) return false;

  return Object.values(section).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim().length > 0 && value !== "Just noting";
    return Boolean(value);
  });
}

function buildLogsForCat(cat, form, personInfo, time) {
  const person = `${personInfo.firstName.trim()} ${personInfo.lastName.trim()}`.trim();
  const role = personInfo.role;
  const logs = [];

  if (form.food.items.length || form.food.note.trim()) {
    logs.push({
      id: `food-${cat.id}-${Date.now()}`,
      type: "feeding",
      title: "Food / water",
      note: `${form.food.items.join(", ")}${form.food.note ? `. ${form.food.note}` : ""}`.trim(),
      severity: "Normal",
      time,
      person,
      role,
    });
  }

  if (form.cleaning.items.length || form.cleaning.note.trim()) {
    const needsReview = form.cleaning.items.some((item) => ["Needs cleaning", "Diarrhea", "No urine seen", "Blood seen"].includes(item));
    logs.push({
      id: `cleaning-${cat.id}-${Date.now()}`,
      type: "cleaning",
      title: "Litterbox / cage condition",
      note: `${form.cleaning.items.join(", ")}${form.cleaning.note ? `. ${form.cleaning.note}` : ""}`.trim(),
      severity: needsReview ? "Needs review" : "Normal",
      time,
      person,
      role,
    });
  }

  if (form.behavior.items.length || form.behavior.note.trim()) {
    const needsReview = form.behavior.items.some((item) => ["Stressed", "Not safe to handle"].includes(item));
    logs.push({
      id: `behavior-${cat.id}-${Date.now()}`,
      type: "interaction",
      title: "Behavior / interaction",
      note: `${form.behavior.items.join(", ")}${form.behavior.note ? `. ${form.behavior.note}` : ""}`.trim(),
      severity: needsReview ? "Needs review" : "Normal",
      time,
      person,
      role,
    });
  }

  if (form.medical.items.length || form.medical.note.trim()) {
    logs.push({
      id: `medical-${cat.id}-${Date.now()}`,
      type: "medical",
      title: "Medical observation / concern",
      note: `${form.medical.items.join(", ")}${form.medical.note ? `. ${form.medical.note}` : ""}`.trim(),
      severity: form.medical.status === "Just noting" ? "Normal" : form.medical.status,
      time,
      person,
      role,
    });
  }

  if (form.medication.name.trim() || form.medication.amount.trim() || form.medication.route.trim() || form.medication.note.trim()) {
    logs.push({
      id: `medication-${cat.id}-${Date.now()}`,
      type: "medical",
      title: "Medication given",
      note: `${form.medication.name} ${form.medication.amount} ${form.medication.route}. ${form.medication.note}`.trim(),
      severity: "Normal",
      time,
      person,
      role,
    });
  }

  if (form.incident.items.length || form.incident.personInvolved.trim() || form.incident.note.trim()) {
    logs.push({
      id: `incident-${cat.id}-${Date.now()}`,
      type: "note",
      title: "Incident report",
      note: `${form.incident.items.join(", ")}. Person involved: ${form.incident.personInvolved || person}${form.incident.note ? `. ${form.incident.note}` : ""}`.trim(),
      severity: "Urgent",
      time,
      person,
      role,
    });
  }

  if (form.generalNote.trim()) {
    logs.push({
      id: `general-${cat.id}-${Date.now()}`,
      type: "note",
      title: "General note",
      note: form.generalNote,
      severity: "Normal",
      time,
      person,
      role,
    });
  }

  return logs;
}

function ExpandableSection({ title, children, open, onToggle, tone = "normal", filled = false }) {
  return (
    <section className={`expand-section ${tone} ${filled ? "filled" : "empty"}`}>
      <button type="button" className="expand-head" onClick={onToggle}>
        <span>{title}</span>
        <span className="section-right">
          {filled && <em>filled</em>}
          <b>{open ? "−" : "+"}</b>
        </span>
      </button>
      {open && <div className="expand-body">{children}</div>}
    </section>
  );
}

function ChipGroup({ options, selected, onChange }) {
  function toggle(item) {
    onChange(selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item]);
  }

  return (
    <div className="chip-grid">
      {options.map((option) => (
        <button type="button" key={option} className={selected.includes(option) ? "chip selected" : "chip"} onClick={() => toggle(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}


function ApartmentLogModal({ onClose, onSave }) {
  const [step, setStep] = useState("person");
  const [person, setPerson] = useState({
    firstName: "",
    lastName: "",
    role: "",
    shiftTime: new Date().toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    }),
  });

  const [expanded, setExpanded] = useState({
    area: false,
    routine: false,
    safety: false,
    note: false,
  });

  const [form, setForm] = useState({
    area: [],
    routine: [],
    safety: [],
    note: "",
  });

  const canContinue = person.firstName.trim() && person.lastName.trim() && person.role && person.shiftTime.trim();
  const hasApartmentData =
    form.area.length > 0 ||
    form.routine.length > 0 ||
    form.safety.length > 0 ||
    form.note.trim();

  const hasSafetyConcern = form.safety.some((item) =>
    ["Supplies low", "Temperature issue", "Odor/ammonia", "Pest concern", "Unsafe item"].includes(item)
  );

  function submitApartmentLog(event) {
    event.preventDefault();

    const fullName = `${person.firstName.trim()} ${person.lastName.trim()}`.trim();
    const pieces = [];

    if (form.area.length) pieces.push(`Area: ${form.area.join(", ")}`);
    if (form.routine.length) pieces.push(`Routine tasks: ${form.routine.join(", ")}`);
    if (form.safety.length) pieces.push(`Safety/facility: ${form.safety.join(", ")}`);
    if (form.note.trim()) pieces.push(`Note: ${form.note.trim()}`);
    pieces.push(`Shift time: ${person.shiftTime}`);

    onSave({
      title: "Apartment log submitted",
      note: pieces.join(". "),
      severity: hasSafetyConcern ? "Needs review" : "Normal",
      person: fullName,
      role: person.role,
    });
  }

  return (
    <SimpleModal title={step === "person" ? "Apartment Log" : "Apartment Log"} onClose={onClose}>
      {step === "person" && (
        <form className="apartment-person apartment-log-form" onSubmit={(event) => {
          event.preventDefault();
          if (canContinue) setStep("form");
        }}>
          <p className="apartment-intro">Not cat-specific. This is for the shared apartment space.</p>

          <div className="two-col">
            <label>First name<input value={person.firstName} onChange={(event) => setPerson({ ...person, firstName: event.target.value })} placeholder="First name" autoFocus /></label>
            <label>Last name<input value={person.lastName} onChange={(event) => setPerson({ ...person, lastName: event.target.value })} placeholder="Last name" /></label>
          </div>

          <div className="two-col">
            <label>Role<select value={person.role} onChange={(event) => setPerson({ ...person, role: event.target.value })}>
              <option value="">Select role</option>
              <option>Volunteer</option>
              <option>Staff</option>
              <option>Foster</option>
              <option>Medical</option>
              <option>Other</option>
            </select></label>
            <label>Time<input value={person.shiftTime} onChange={(event) => setPerson({ ...person, shiftTime: event.target.value })} /></label>
          </div>

          <button className="submit-btn" disabled={!canContinue}>Continue</button>
        </form>
      )}

      {step === "form" && (
        <form className="apartment-log-form" onSubmit={submitApartmentLog}>
          <p className="apartment-intro">Shared-space log by {person.firstName} {person.lastName}. Open only the sections you need.</p>

          <ApartmentSection
            title="Area"
            tone="area"
            open={expanded.area}
            filled={form.area.length > 0}
            onToggle={() => setExpanded({ ...expanded, area: !expanded.area })}
          >
            <ChipGroup
              options={["Main room", "Food prep", "Laundry", "Quarantine / cage area"]}
              selected={form.area}
              onChange={(area) => setForm({ ...form, area })}
            />
          </ApartmentSection>

          <ApartmentSection
            title="Routine tasks"
            tone="routine"
            open={expanded.routine}
            filled={form.routine.length > 0}
            onToggle={() => setExpanded({ ...expanded, routine: !expanded.routine })}
          >
            <ChipGroup
              options={["Food/water stations checked", "Litterboxes scooped", "Laundry done", "Trash removed", "Supplies restocked", "Bowls cleaned"]}
              selected={form.routine}
              onChange={(routine) => setForm({ ...form, routine })}
            />
          </ApartmentSection>

          <ApartmentSection
            title="Safety / facility check"
            tone="safety"
            open={expanded.safety}
            filled={form.safety.length > 0}
            onToggle={() => setExpanded({ ...expanded, safety: !expanded.safety })}
          >
            <p className="section-help">Anything concerning here will show as a dashboard alert.</p>
            <ChipGroup
              options={["No issue", "Windows secure", "Doors/latches secure", "Supplies low", "Temperature issue", "Odor/ammonia", "Pest concern", "Unsafe item"]}
              selected={form.safety}
              onChange={(safety) => setForm({ ...form, safety })}
            />
          </ApartmentSection>

          <ApartmentSection
            title="Optional note"
            tone="note"
            open={expanded.note}
            filled={Boolean(form.note.trim())}
            onToggle={() => setExpanded({ ...expanded, note: !expanded.note })}
          >
            <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Any extra apartment notes." />
          </ApartmentSection>

          <div className="apartment-submit-row">
            <button type="button" className="danger-outline" onClick={() => setForm({ area: [], routine: [], safety: [], note: "" })}>Clear form</button>
            <span>{hasApartmentData ? "Ready to submit." : "Add at least one apartment update before submitting."}</span>
            <button className="submit-btn" disabled={!hasApartmentData}>Submit Apartment Log</button>
          </div>
        </form>
      )}
    </SimpleModal>
  );
}

function ApartmentSection({ title, children, open, onToggle, tone = "normal", filled = false }) {
  return (
    <section className={`apartment-section ${tone} ${filled ? "filled" : "empty"}`}>
      <button type="button" className="apartment-section-head" onClick={onToggle}>
        <span>{title}</span>
        <span className="section-right">
          {filled && <em>filled</em>}
          <b>{open ? "−" : "+"}</b>
        </span>
      </button>
      {open && <div className="apartment-section-body">{children}</div>}
    </section>
  );
}

function EditProfileModal({ cat, onClose, onSave }) {
  const [form, setForm] = useState({ room:cat.room, cage:cat.cage, mood:cat.mood, favoriteToys:cat.favoriteToys, wetFood:cat.wetFood, dryFood:cat.dryFood, handling:cat.handling, medicalInfo:cat.medicalInfo, person:"", role:"" });
  return <SimpleModal title={`Edit profile: ${cat.name}`} onClose={onClose}><form className="compact-form" onSubmit={e => {e.preventDefault(); onSave(form);}}>
    <div className="two-col"><label>Room / area<input value={form.room} onChange={e => setForm({...form, room:e.target.value})}/></label><label>Cage / location<input value={form.cage} onChange={e => setForm({...form, cage:e.target.value})}/></label></div>
    <div className="two-col"><label>Mood<input value={form.mood} onChange={e => setForm({...form, mood:e.target.value})}/></label><label>Favorite toys<input value={form.favoriteToys} onChange={e => setForm({...form, favoriteToys:e.target.value})}/></label></div>
    <div className="two-col"><label>Wet food<input value={form.wetFood} onChange={e => setForm({...form, wetFood:e.target.value})}/></label><label>Dry food<input value={form.dryFood} onChange={e => setForm({...form, dryFood:e.target.value})}/></label></div>
    <label>Medical info<textarea value={form.medicalInfo} onChange={e => setForm({...form, medicalInfo:e.target.value})}/></label>
    <label>Handling notes<textarea value={form.handling} onChange={e => setForm({...form, handling:e.target.value})}/></label>
    <PersonFields form={form} setForm={setForm}/><button className="submit-btn" disabled={!form.person.trim() || !form.role}>Save profile</button>
  </form></SimpleModal>;
}
