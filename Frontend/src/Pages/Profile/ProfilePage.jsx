import { useState, useEffect } from "react";
import { Header } from "../../Components/Header";
import { useAuth } from "../../context/AuthContext";
import { userApi, extractErrorMessage } from "../../services/api";
import toast from "react-hot-toast";

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}

// ── Address Form Modal ────────────────────────────────────────────────────────
function AddressModal({ address, onClose, onSaved }) {
  const isEdit = !!address?.id;
  const [form, setForm] = useState({
    fullName:      address?.fullName      || "",
    phone:         address?.phone         || "",
    streetAddress: address?.streetAddress || "",
    landmark:      address?.landmark      || "",
    city:          address?.city          || "",
    state:         address?.state         || "",
    postalCode:    address?.postalCode    || "",
    country:       address?.country       || "India",
    isDefault:     address?.isDefault     || false,
  });
  const [saving, setSaving] = useState(false);

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
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-8 relative animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Bishal Paramanick"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone *
              </label>
              <input
                id="phone"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 XXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label htmlFor="streetAddress" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Street Address *
            </label>
            <input
              id="streetAddress"
              name="streetAddress"
              required
              value={form.streetAddress}
              onChange={handleChange}
              placeholder="e.g. 92, Acharya Prafulla Chandra Road"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Landmark */}
          <div>
            <label htmlFor="landmark" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Landmark
            </label>
            <input
              id="landmark"
              name="landmark"
              value={form.landmark}
              onChange={handleChange}
              placeholder="Near Rajabazar Science College"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                City *
              </label>
              <input
                id="city"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                placeholder="Kolkata"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                State *
              </label>
              <input
                id="state"
                name="state"
                required
                value={form.state}
                onChange={handleChange}
                placeholder="West Bengal"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Postal Code & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Postal Code *
              </label>
              <input
                id="postalCode"
                name="postalCode"
                required
                value={form.postalCode}
                onChange={handleChange}
                placeholder="700009"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Country
              </label>
              <input
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="India"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Default checkbox */}
          <label className="flex items-center gap-2.5 pt-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
            />
            Set as default address
          </label>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer"
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

  return (
    <div
      className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 ${
        address.isDefault
          ? "bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm"
          : "bg-slate-50/70 border-slate-200/90 hover:border-indigo-300 hover:shadow-sm"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-slate-900 text-base">{address.fullName}</h3>
          {address.isDefault && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Default
            </span>
          )}
        </div>

        <div className="text-xs text-slate-600 leading-relaxed">
          <p>
            {address.streetAddress}
            {address.landmark && <>, {address.landmark}</>}
          </p>
          <p>
            {address.city}, {address.state} – {address.postalCode}
          </p>
          <p>{address.country}</p>
        </div>

        <div className="text-xs font-medium text-slate-700">
          📞 {address.phone}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-200/70 text-xs">
        <button
          type="button"
          onClick={() => onEdit(address)}
          className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
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
              className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
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
          className="font-semibold text-rose-600 hover:text-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
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

  const [addresses, setAddresses]       = useState([]);
  const [loadingAddr, setLoadingAddr]   = useState(true);
  const [addressModal, setAddressModal] = useState(null); // null | "new" | address object

  // Profile update state
  const [email, setEmail]                 = useState(() => profile?.email || "");
  const [newPassword, setNewPassword]     = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync email when profile changes
  const [prevProfileEmail, setPrevProfileEmail] = useState(profile?.email);
  if (profile?.email && profile.email !== prevProfileEmail) {
    setPrevProfileEmail(profile.email);
    setEmail(profile.email);
  }

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

  useEffect(() => {
    let ignore = false;
    userApi
      .getAddresses()
      .then((res) => {
        if (!ignore) {
          setAddresses(res.data || []);
          setLoadingAddr(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setAddresses([]);
          setLoadingAddr(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {};
      if (email)       payload.email    = email;
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

      <div className="min-h-screen bg-slate-50/50 pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* ── Card 1: Account Details ── */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">👤</span>
              <h2 className="text-xl font-bold text-slate-900">Account Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  USERNAME
                </div>
                <div className="text-base font-semibold text-slate-800">
                  {user?.username || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  ROLE
                </div>
                <span className="inline-flex items-center bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {user?.role?.replace("ROLE_", "") || "USER"}
                </span>
              </div>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleProfileSave}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Update Profile
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-password"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                  >
                    New Password
                  </label>
                  <input
                    id="profile-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {savingProfile ? <Spinner /> : "Save Changes"}
              </button>
            </form>
          </section>

          {/* ── Card 2: Address Book ── */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <h2 className="text-xl font-bold text-slate-900">Address Book</h2>
              </div>
              <button
                type="button"
                onClick={() => setAddressModal("new")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-sm transition active:scale-95 inline-flex items-center gap-1 cursor-pointer"
              >
                + Add Address
              </button>
            </div>

            {loadingAddr ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 animate-pulse"
                  >
                    <div className="h-4 bg-slate-200 rounded w-3/5" />
                    <div className="h-3 bg-slate-200 rounded w-4/5" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <p className="text-slate-500 text-sm mb-4">No saved addresses yet.</p>
                <button
                  type="button"
                  onClick={() => setAddressModal("new")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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