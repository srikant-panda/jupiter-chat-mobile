import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../api";
import Avatar from "../common/Avatar";

export default function ProfileSettings({ section = "all" }) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [personalization, setPersonalization] = useState(
    user?.personalization || "",
  );
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const dirty =
    name !== user?.name ||
    personalization !== (user?.personalization || "") ||
    avatar !== (user?.avatar || "");
  const pickImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setStatus("");
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 600000
    ) {
      setError("Choose a PNG, JPEG or WebP image smaller than 600 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.onerror = () =>
      setError("Could not read this image. Please try another.");
    reader.readAsDataURL(file);
  };
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const payload = {
        name: section === "personalization" ? user.name : name,
        personalization:
          section === "profile" ? user.personalization || "" : personalization,
      };
      if (section !== "personalization" && avatar !== (user.avatar || ""))
        payload.avatar = avatar;
      const result = await updateProfile(payload);
      setUser(result.data);
      setAvatar(result.data.avatar);
      setName(result.data.name);
      setPersonalization(result.data.personalization);
      setStatus("Saved. Your preferences apply to your next message.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="profile-form" onSubmit={save}>
      {section !== "personalization" && (
        <>
          <div className="profile-image-row">
            <Avatar user={{ name, avatar }} size={64} />
            <div>
              <label className="experience-button secondary">
                Upload photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={pickImage}
                  disabled={busy}
                />
              </label>
              {avatar && (
                <button
                  type="button"
                  className="experience-button quiet"
                  disabled={busy}
                  onClick={() => setAvatar("")}
                >
                  Remove
                </button>
              )}
              <p className="experience-hint">
                PNG, JPEG or WebP · up to 600 KB
              </p>
            </div>
          </div>
          <label>
            Display name
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setStatus("");
              }}
              minLength={3}
              maxLength={150}
              required
              disabled={busy}
              autoComplete="name"
            />
          </label>
          <label>
            Email
            <input
              value={user?.email || ""}
              readOnly
              aria-describedby="email-note"
            />
          </label>
          <p id="email-note" className="experience-hint">
            Your sign-in email is managed by your account provider.
          </p>
        </>
      )}
      {section !== "profile" && (
        <label>
          How should Jupiter tailor its answers?
          <p className="experience-hint">
            Share your background, goals, preferred language or explanation
            style. These preferences are sent with your messages, including
            temporary chats. Avoid sensitive information.
          </p>
          <textarea
            rows={7}
            maxLength={4000}
            value={personalization}
            disabled={busy}
            onChange={(e) => {
              setPersonalization(e.target.value);
              setStatus("");
            }}
            placeholder="I’m learning backend development. Explain concepts step by step, use JavaScript examples, and point out tradeoffs."
          />
          <span className="experience-hint">
            {personalization.length.toLocaleString()} / 4,000 · App safety rules
            always apply.
          </span>
        </label>
      )}
      {error && (
        <p className="experience-error" role="alert">
          {error}
        </p>
      )}
      {status && (
        <p className="experience-success" role="status">
          {status}
        </p>
      )}
      <div className="experience-actions">
        <button className="experience-button" disabled={busy || !dirty}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        {dirty && <span className="experience-hint">Unsaved changes</span>}
      </div>
    </form>
  );
}
