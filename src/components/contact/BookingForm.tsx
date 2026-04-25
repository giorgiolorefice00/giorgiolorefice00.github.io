import { useState } from "react";

interface FormState {
  name: string; email: string; eventType: string;
  date: string; venue: string; budget: string;
  message: string; riderAck: boolean;
}

const INIT: FormState = {
  name: "", email: "", eventType: "", date: "",
  venue: "", budget: "", message: "", riderAck: false,
};

export default function BookingForm() {
  const [form, setForm] = useState<FormState>(INIT);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to email service
    console.log("Booking inquiry:", form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ padding: "80px 0" }}>
        <div style={{ fontFamily: "'Anton',sans-serif", fontSize: "clamp(28px,4vw,48px)", color: "#c8102e", letterSpacing: "0.02em", marginBottom: 16 }}>RECEIVED.</div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#6b6b6b", letterSpacing: "0.1em", lineHeight: 1.7 }}>
          we'll be in touch within 48 hours. don't follow up before then.
        </div>
      </div>
    );
  }

  const field = (id: string) => ({
    className: "booking-field",
    id,
    value: form[id as keyof FormState] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      set(id as keyof FormState, e.target.value),
  });

  return (
    <form onSubmit={onSubmit} style={{ position: "relative", zIndex: 2, maxWidth: 760 }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#c8102e", letterSpacing: "0.22em", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 20, height: 1, background: "#c8102e", display: "inline-block" }} />
        [ 001 / for bookings &amp; gigs ]
      </div>
      <div style={{ fontFamily: "'Anton',sans-serif", fontSize: "clamp(40px,5vw,72px)", color: "#e8e8e8", letterSpacing: "0.01em", lineHeight: 0.92, marginBottom: 20 }}>
        BOOKING INQUIRY.
      </div>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#6b6b6b", letterSpacing: "0.1em", lineHeight: 1.7, marginBottom: 48 }}>
        tell us about the night. we reply within 48 hours.
      </p>

      <div className="booking-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        {/* Name */}
        <div style={{ gridColumn: "1 / -1", marginBottom: 32 }}>
          <label className="booking-label" htmlFor="name">name</label>
          <input type="text" required {...field("name")} />
        </div>
        {/* Email */}
        <div style={{ gridColumn: "1 / -1", marginBottom: 32 }}>
          <label className="booking-label" htmlFor="email">email</label>
          <input type="email" required {...field("email")} />
        </div>
        {/* Event type */}
        <div style={{ marginBottom: 32 }}>
          <label className="booking-label" htmlFor="eventType">event type</label>
          <select {...field("eventType")} className="booking-field">
            <option value="">— select —</option>
            {["club night", "festival", "private event", "radio", "corporate", "other"].map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        {/* Date */}
        <div style={{ marginBottom: 32 }}>
          <label className="booking-label" htmlFor="date">event date</label>
          <input type="date" {...field("date")} />
        </div>
        {/* Venue */}
        <div style={{ marginBottom: 32 }}>
          <label className="booking-label" htmlFor="venue">venue / location</label>
          <input type="text" {...field("venue")} />
        </div>
        {/* Budget */}
        <div style={{ marginBottom: 32 }}>
          <label className="booking-label" htmlFor="budget">estimated budget</label>
          <select {...field("budget")} className="booking-field">
            <option value="">— select —</option>
            {["under €5k", "€5–10k", "€10–25k", "€25k+", "to discuss"].map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        {/* Message */}
        <div style={{ gridColumn: "1 / -1", marginBottom: 32 }}>
          <label className="booking-label" htmlFor="message">message</label>
          <textarea
            id="message"
            rows={5}
            className="booking-field"
            style={{ resize: "none" }}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
          />
        </div>
        {/* Rider ack */}
        <div style={{ gridColumn: "1 / -1", marginBottom: 40, display: "flex", alignItems: "center", gap: 16 }}>
          <input
            type="checkbox"
            id="riderAck"
            checked={form.riderAck}
            onChange={(e) => set("riderAck", e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "#c8102e", cursor: "pointer" }}
          />
          <label htmlFor="riderAck" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#6b6b6b", letterSpacing: "0.1em", cursor: "pointer" }}>
            i acknowledge the technical rider requirements
          </label>
        </div>
      </div>

      <button type="submit" className="btn-primary" style={{ width: "100%", padding: "18px 40px", fontSize: 11 }}>
        <span>→ SEND INQUIRY</span>
      </button>
    </form>
  );
}
