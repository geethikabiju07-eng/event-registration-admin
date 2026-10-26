import React from "react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays, MapPin, Users, Plus, Search, Pencil, Trash2,
  ArrowUpRight, CalendarCheck, LayoutDashboard, Sparkles, ArrowLeft,
  X, CheckCircle2, AlertCircle
} from "lucide-react";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "./api";

function dateLabel(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function shortId(id) {
  return id ? `EV-${id.slice(-6).toUpperCase()}` : "—";
}

function Notice({ notice, onClose }) {
  if (!notice) return null;
  const Icon = notice.type === "error" ? AlertCircle : CheckCircle2;
  return (
    <div className={`notice ${notice.type || "success"}`} role="status">
      <Icon size={18} />
      <span>{notice.message}</span>
      <button aria-label="Dismiss notification" onClick={onClose}><X size={16} /></button>
    </div>
  );
}

function Header() {
  return (
    <header className="topbar">
      <NavLink to="/" className="brand" aria-label="Eventora home">
        <span className="brand-mark"><CalendarCheck size={21} /></span>
        <span>eventora<span className="brand-dot">.</span></span>
      </NavLink>
      <nav className="navigation" aria-label="Main navigation">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <LayoutDashboard size={17} /> Dashboard
        </NavLink>
        <NavLink to="/add-event" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <Plus size={17} /> Add Event
        </NavLink>
      </nav>
      <div className="admin-chip"><span className="avatar">A</span><span>Administrator</span></div>
    </header>
  );
}

function Dashboard({ setNotice }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  async function refreshEvents() {
    setLoading(true);
    setError("");
    try {
      const response = await getEvents();
      setEvents(response.data);
    } catch {
      setError("Could not load events. Check that the backend and MongoDB Atlas are running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshEvents(); }, []);

  const filteredEvents = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) =>
      [event.eventName, event.venue, event.eventDescription, shortId(event._id)]
        .some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [events, query]);

  const registrations = events.reduce((total, event) => total + (event.totalRegistrations || 0), 0);
  const upcoming = events.filter((event) => new Date(event.eventDate) >= new Date()).length;

  async function removeEvent(event) {
    const confirmed = window.confirm(`Delete "${event.eventName}"? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteEvent(event._id);
      setEvents((current) => current.filter((item) => item._id !== event._id));
      setNotice({ type: "success", message: "Event deleted successfully." });
    } catch {
      setNotice({ type: "error", message: "Could not delete this event. Please try again." });
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <div className="eyebrow"><Sparkles size={14} /> EVENT MANAGEMENT WORKSPACE</div>
          <h1>Good things happen<br className="desktop-break" /> when events come together.</h1>
          <p className="hero-copy">Plan, organize and keep track of every event from one simple workspace.</p>
        </div>
        <button className="button button-primary hero-button" onClick={() => navigate("/add-event")}>
          <Plus size={18} /> Create event
        </button>
        <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
      </section>

      <section className="stats-grid" aria-label="Event statistics">
        <article className="stat-card">
          <div className="stat-top"><span className="stat-icon purple"><CalendarDays size={19} /></span><span className="stat-kicker">ALL TIME</span></div>
          <p className="stat-label">Total events</p><div className="stat-value">{loading ? "—" : events.length}</div>
          <p className="stat-foot">Events in your workspace</p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-icon peach"><Users size={19} /></span><span className="stat-kicker">ATTENDANCE</span></div>
          <p className="stat-label">Total registrations</p><div className="stat-value">{loading ? "—" : registrations.toLocaleString("en-IN")}</div>
          <p className="stat-foot">Across all listed events</p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-icon mint"><CalendarCheck size={19} /></span><span className="stat-kicker">UP NEXT</span></div>
          <p className="stat-label">Upcoming events</p><div className="stat-value">{loading ? "—" : upcoming}</div>
          <p className="stat-foot">Scheduled from today onward</p>
        </article>
      </section>

      <section className="content-card">
        <div className="content-heading">
          <div><p className="section-overline">YOUR WORKSPACE</p><h2>All events <span className="inline-count">{events.length}</span></h2><p className="muted">A clear view of everything you have planned.</p></div>
          <label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events or venues" aria-label="Search events" /></label>
        </div>

        {error && <div className="state-message error-state"><AlertCircle size={20} /><div><strong>Connection issue</strong><p>{error}</p><button className="text-button" onClick={refreshEvents}>Try again</button></div></div>}
        {loading && !error && <div className="state-message"><span className="spinner" /> Loading your events…</div>}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><CalendarDays size={27} /></div>
            <h3>{query ? "No matching events" : "Your next great event starts here"}</h3>
            <p>{query ? "Try another event name or venue." : "Create an event and it will show up here, ready to manage."}</p>
            {!query && <button className="button button-primary" onClick={() => navigate("/add-event")}><Plus size={17} /> Add your first event</button>}
          </div>
        )}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="table-scroll">
            <table className="events-table">
              <thead><tr><th>EVENT</th><th>EVENT DATE</th><th>VENUE</th><th>REGISTRATIONS</th><th className="actions-heading">ACTIONS</th></tr></thead>
              <tbody>{filteredEvents.map((event) => (
                <tr key={event._id}>
                  <td><div className="event-cell"><div className="event-symbol"><CalendarDays size={18} /></div><div><strong>{event.eventName}</strong><span>{shortId(event._id)}</span></div></div></td>
                  <td><span className="date-value">{dateLabel(event.eventDate)}</span></td>
                  <td><span className="venue-value"><MapPin size={15} />{event.venue}</span></td>
                  <td><span className="registration-pill"><Users size={14} />{event.totalRegistrations || 0}</span></td>
                  <td><div className="row-actions">
                    <button className="icon-button edit-action" title="Update event" aria-label={`Update ${event.eventName}`} onClick={() => navigate(`/edit-event/${event._id}`)}><Pencil size={16} /></button>
                    <button className="icon-button delete-action" title="Delete event" aria-label={`Delete ${event.eventName}`} onClick={() => removeEvent(event)}><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        <div className="table-footer"><span>Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events</span><span className="live-indicator"><span /> Live workspace</span></div>
      </section>
      <footer className="page-footer"><span>Eventora Admin</span><span>Thoughtfully organized, effortlessly managed.</span></footer>
    </main>
  );
}

function EventForm({ setNotice }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState({ eventName: "", eventDescription: "", eventDate: "", venue: "" });
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    getEvent(id)
      .then(({ data }) => {
        if (!active) return;
        setForm({
          eventName: data.eventName || "",
          eventDescription: data.eventDescription || "",
          eventDate: data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 10) : "",
          venue: data.venue || ""
        });
      })
      .catch(() => { if (active) setError("This event could not be found. Return to the dashboard and try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateEvent(id, form);
        setNotice({ type: "success", message: "Your event changes have been saved." });
      } else {
        await createEvent(form);
        setNotice({ type: "success", message: "Your new event has been created." });
      }
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save the event. Check the backend connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="page-shell"><div className="state-message"><span className="spinner" /> Loading event details…</div></main>;

  return (
    <main className="page-shell form-shell">
      <button className="back-link" onClick={() => navigate("/")}><ArrowLeft size={16} /> Back to dashboard</button>
      <section className="form-intro">
        <div className="form-art"><CalendarCheck size={29} /></div>
        <div><div className="eyebrow"><Sparkles size={14} /> MAKE IT HAPPEN</div><h1>{editing ? "Edit your event" : "Create a new event"}</h1><p>Share the details below. You can always update them later.</p></div>
      </section>
      <section className="form-card">
        <div className="form-card-heading"><div><h2>Event details</h2><p>Fields marked with <span className="required-star">*</span> are required.</p></div><span className="form-step">DETAILS <ArrowUpRight size={14} /></span></div>
        <form onSubmit={submit}>
          <div className="field-group"><label htmlFor="eventName">Event name <span className="required-star">*</span></label><input id="eventName" name="eventName" value={form.eventName} onChange={updateField} placeholder="e.g. Campus Innovation Summit" required maxLength={100} /><small>Choose a clear, memorable name for your event.</small></div>
          <div className="field-group"><label htmlFor="eventDescription">Event description <span className="required-star">*</span></label><textarea id="eventDescription" name="eventDescription" value={form.eventDescription} onChange={updateField} placeholder="What is the event about? Include any useful details for attendees." rows={5} required maxLength={2000} /><div className="field-meta"><small>A short overview helps people understand what to expect.</small><small>{form.eventDescription.length}/2000</small></div></div>
          <div className="form-two-columns">
            <div className="field-group"><label htmlFor="eventDate">Event date <span className="required-star">*</span></label><div className="input-with-icon"><CalendarDays size={17} /><input id="eventDate" name="eventDate" type="date" value={form.eventDate} onChange={updateField} required /></div></div>
            <div className="field-group"><label htmlFor="venue">Venue <span className="required-star">*</span></label><div className="input-with-icon"><MapPin size={17} /><input id="venue" name="venue" value={form.venue} onChange={updateField} placeholder="e.g. Main auditorium" required maxLength={150} /></div></div>
          </div>
          {error && <div className="form-error"><AlertCircle size={17} />{error}</div>}
          <div className="form-bottom"><p><span className="secure-dot" /> Your event details will be saved to the database.</p><div className="form-buttons"><button type="button" className="button button-secondary" onClick={() => navigate("/")}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? "Saving…" : editing ? <><CheckCircle2 size={17} /> Save changes</> : <><Plus size={18} /> Create event</>}</button></div></div>
        </form>
      </section>
      <p className="form-note">You can manage registrations and update event information from your dashboard.</p>
    </main>
  );
}

function NotFound() {
  return <main className="page-shell empty-state"><h2>Page not found</h2><p>The page you requested does not exist.</p><NavLink className="button button-primary" to="/">Go to dashboard</NavLink></main>;
}

export default function App() {
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 3800);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <div className="app">
      <Header />
      <Notice notice={notice} onClose={() => setNotice(null)} />
      <Routes>
        <Route path="/" element={<Dashboard setNotice={setNotice} />} />
        <Route path="/add-event" element={<EventForm setNotice={setNotice} />} />
        <Route path="/edit-event/:id" element={<EventForm setNotice={setNotice} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
