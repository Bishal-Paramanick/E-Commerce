import { useState, useEffect } from "react";
import { Header } from "../../Components/Header";
import { useAuth } from "../../context/AuthContext";
import { userApi, extractErrorMessage } from "../../services/api";
import toast from "react-hot-toast";

// ── Shared Tailwind class strings ─────────────────────────────────────────────
const inputCls =
  "w-full h-[39px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 " +
  "placeholder-slate-400 outline-none transition focus:border-transparent focus:bg-white " +
  "focus:ring-2 focus:ring-indigo-500";

const primaryBtn =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-indigo-600 " +
  "font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 " +
  "active:scale-95 disabled:cursor-not-allowed disabled:opacity-70";

const cardCls =
  "rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-indigo-500/5";

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

// ── Address Form Modal ────────────────────────────────────────────────────────
function AddressModal({ address, onClose, onSaved }) {
  const isEdit = !!address?.id;
  const [form, setForm] = useState({
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    streetAddress: address?.streetAddress || "",
    landmark: address?.landmark || "",
    city: address?.city || "",
    state: address?.state || "",
    postalCode: address?.postalCode || "",
    country: address?.country || "India",
    isDefault: address?.isDefault || false,
  });
  const [saving, setSaving] = useState(false);

  const labelCls = "mb-1.5 block text-xs font-semibold text-slate-600";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await userApi.updateAddress(address.id, form);
        toast.success("Address updated!");
      } else {
        await userApi.createAddress(form);
        toast.success("Address added!");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-[39rem] overflow-y-auto rounded-3xl border border-slate-200/90 bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="m-0 text-xl font-bold text-slate-900">
            {isEdit ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className={labelCls}>Full Name *</label>
              <input
                id="fullName" name="fullName" required
                value={form.fullName} onChange={handleChange}
                placeholder="John Doe"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelCls}>Phone *</label>
              <input
                id="phone" name="phone" required
                value={form.phone} onChange={handleChange}
                placeholder="+91 9876543210"
                className={inputCls}
              />
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label htmlFor="streetAddress" className={labelCls}>Street Address *</label>
            <input
              id="streetAddress" name="streetAddress" required
              value={form.streetAddress} onChange={handleChange}
              placeholder="123 Main Street, Apt 4B"
              className={inputCls}
            />
          </div>

          {/* Landmark */}
          <div>
            <label htmlFor="landmark" className={labelCls}>Landmark</label>
            <input
              id="landmark" name="landmark"
              value={form.landmark} onChange={handleChange}
              placeholder="Near Central Park"
              className={inputCls}
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className={labelCls}>City *</label>
              <input
                id="city" name="city" required
                value={form.city} onChange={handleChange}
                placeholder="Mumbai"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="state" className={labelCls}>State *</label>
              <input
                id="state" name="state" required
                value={form.state} onChange={handleChange}
                placeholder="Maharashtra"
                className={inputCls}
              />
            </div>
          </div>

          {/* Postal Code & Country */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="postalCode" className={labelCls}>Postal Code *</label>
              <input
                id="postalCode" name="postalCode" required
                value={form.postalCode} onChange={handleChange}
                placeholder="400001"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="country" className={labelCls}>Country</label>
              <input
                id="country" name="country"
                value={form.country} onChange={handleChange}
                placeholder="India"
                className={inputCls}
              />
            </div>
          </div>

          {/* Default checkbox */}
          <label className="my-1 flex cursor-pointer select-none items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
              className="h-4 w-4 cursor-pointer accent-indigo-600"
            />
            Set as default address
          </label>

          {/* Footer actions */}
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-[22px] text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`${primaryBtn} h-10 px-[22px] text-sm`}
            >
              {saving ? <Spinner /> : isEdit ? "Save Changes" : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Address Card ──────────────────────────────────────────────────────────────
function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Delete this address?")) return;
    setDeleting(true);
    try {
      await userApi.deleteAddress(address.id);
      toast.success("Address removed.");
      onDelete();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    setSettingDefault(true);
    try {
      await userApi.setDefaultAddress(address.id);
      toast.success("Default address updated.");
      onSetDefault();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSettingDefault(false);
    }
  };

  const linkBtn =
    "cursor-pointer border-none bg-transparent p-0 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border bg-slate-50/60 p-5 transition ${address.isDefault
        ? "border-indigo-400 ring-2 ring-indigo-100"
        : "border-slate-200 hover:border-slate-300"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-bold text-slate-900">{address.fullName}</div>
        {address.isDefault && (
          <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
            Default
          </span>
        )}
      </div>

      <div className="text-xs leading-relaxed text-slate-600">
        {address.streetAddress}
        {address.landmark && <>, {address.landmark}</>}
        <br />
        {address.city}, {address.state} – {address.postalCode}
        <br />
        {address.country}
      </div>

      <div className="text-xs font-medium text-slate-600">📞 {address.phone}</div>

      <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-3">
        <button
          type="button"
          onClick={() => onEdit(address)}
          className={`${linkBtn} text-indigo-600 hover:text-indigo-500`}
        >
          Edit
        </button>

        {!address.isDefault && (
          <>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleSetDefault}
              disabled={settingDefault}
              className={`${linkBtn} text-slate-600 hover:text-slate-900`}
            >
              {settingDefault ? "Setting…" : "Set Default"}
            </button>
          </>
        )}

        <span className="text-slate-300">|</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={`${linkBtn} text-rose-500 hover:text-rose-600`}
        >
          {deleting ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export function ProfilePage({ cart }) {
  const { user, profile, fetchProfile } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [addressModal, setAddressModal] = useState(null); // null | "new" | address object

  // Profile update state
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync email from profile
  useEffect(() => {
    if (profile?.email) setEmail(profile.email);
  }, [profile]);

  const loadAddresses = async () => {
    setLoadingAddr(true);
    try {
      const res = await userApi.getAddresses();
      setAddresses(res.data || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddr(false);
    }
  };

  useEffect(() => { loadAddresses(); }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {};
      if (email) payload.email = email;
      if (newPassword) payload.password = newPassword;
      await userApi.updateProfile(payload);
      await fetchProfile();
      toast.success("Profile updated!");
      setNewPassword("");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
      <title>My Account | BISHAL-MART</title>
      <Header cart={cart} />

      <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">

          {/* ── Card 1: Account Details ── */}
          <section className={cardCls}>
            <div className="mb-6 flex items-center gap-4">
              <span className="text-[22px] leading-none">👤</span>
              <h2 className="m-0 text-xl font-bold text-slate-900">Account Details</h2>
            </div>

            <div className="flex flex-wrap items-start gap-6">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Username
                </div>
                <div className="text-base font-semibold text-slate-900">
                  {user?.username || "—"}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Role
                </div>
                <span className="inline-block rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold uppercase text-indigo-600">
                  {user?.role?.replace("ROLE_", "") || "USER"}
                </span>
              </div>
            </div>

            <hr className="mb-8 mt-6 border-0 border-t border-slate-200" />

            <form onSubmit={handleProfileSave}>
              <h3 className="mb-4 mt-0 text-sm font-bold text-slate-900">Update Profile</h3>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-1.5 block text-xs font-semibold text-slate-500"
                  >
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-password"
                    className="mb-1.5 block text-xs font-semibold text-slate-500"
                  >
                    New Password
                  </label>
                  <input
                    id="profile-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className={`${primaryBtn} h-10 px-6 text-sm`}
              >
                {savingProfile ? <Spinner /> : "Save Changes"}
              </button>
            </form>
          </section>

          {/* ── Card 2: Address Book ── */}
          <section className={cardCls}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="text-[22px] leading-none">📍</span>
                <h2 className="m-0 text-xl font-bold text-slate-900">Address Book</h2>
              </div>
              <button
                type="button"
                onClick={() => setAddressModal("new")}
                className={`${primaryBtn} h-[34px] px-4 text-xs`}
              >
                + Add Address
              </button>
            </div>

            {loadingAddr ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-2 h-3.5 animate-pulse rounded-lg bg-slate-200" style={{ width: "60%" }} />
                    <div className="mb-2 h-3.5 animate-pulse rounded-lg bg-slate-200" style={{ width: "90%" }} />
                    <div className="h-3.5 animate-pulse rounded-lg bg-slate-200" style={{ width: "50%" }} />
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <p className="m-0 text-sm text-slate-500">No saved addresses yet.</p>
                <button
                  type="button"
                  onClick={() => setAddressModal("new")}
                  className={`${primaryBtn} px-2 py-0.5 text-xs`}
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={(a) => setAddressModal(a)}
                    onDelete={loadAddresses}
                    onSetDefault={loadAddresses}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Address Modal */}
      {addressModal && (
        <AddressModal
          address={addressModal === "new" ? null : addressModal}
          onClose={() => setAddressModal(null)}
          onSaved={loadAddresses}
        />
      )}
    </>
  );
}

export default ProfilePage;