import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  X,
  MapPin,
  Briefcase,
  IndianRupee,
  Layers,
  Edit2,
  Check,
  Save,
  Phone,
  Calendar,
  Trash2,
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { UserProfile, SocialCategory, HousingType } from '../types/agent';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';
import { isSimulatedMode, isLiveMode } from '../digilocker';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onUpdateUser: (updatedUser: AuthUser) => void;
  onDisconnectDigiLocker?: () => void;
  language: SupportedLanguage;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onDisconnectDigiLocker,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [state, setState] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('Farmer');
  const [landAcres, setLandAcres] = useState<string>('0');
  const [annualIncome, setAnnualIncome] = useState<string>('0');
  const [socialCategory, setSocialCategory] = useState<SocialCategory>('General');
  const [housingType, setHousingType] = useState<HousingType>('Pucca');
  const [isTaxpayer, setIsTaxpayer] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobile(user.mobile || '');
      const p = user.profile || {};
      setAge(p.age ? String(p.age) : '38');
      setGender(p.gender || 'Male');
      setState(p.state || 'Maharashtra');
      setDistrict(p.district || 'Nashik');
      setPincode(p.pincode || '422001');
      setOccupation(p.occupation || 'Farmer');
      setLandAcres(p.land_acres !== undefined ? String(p.land_acres) : '2.0');
      setAnnualIncome(p.annual_income_inr !== undefined ? String(p.annual_income_inr) : '80000');
      setSocialCategory((p.social_category as SocialCategory) || 'OBC');
      setHousingType((p.housing_type as HousingType) || 'Kutcha');
      setIsTaxpayer(Boolean(p.is_taxpayer));
      setIsEditing(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();

    const acresNum = occupation === 'Farmer' ? parseFloat(landAcres) || 0 : 0;
    const haNum = Number((acresNum * 0.4047).toFixed(4));
    const incNum = parseInt(annualIncome, 10) || 0;
    const ageNum = parseInt(age, 10) || null;

    const updatedProfile: UserProfile = {
      ...user.profile,
      name: name.trim() || user.name,
      age: ageNum,
      gender,
      state: state.trim() || 'Maharashtra',
      district: district.trim() || 'Nashik',
      pincode: pincode.trim() || '422001',
      occupation,
      land_acres: acresNum,
      land_hectares: haNum,
      has_land_ownership: acresNum > 0,
      annual_income_inr: incNum,
      social_category: socialCategory,
      housing_type: housingType,
      is_taxpayer: isTaxpayer,
      is_student: occupation === 'Student',
      preferred_language: user.profile?.preferred_language || 'Hindi',
    };

    const updatedUser: AuthUser = {
      ...user,
      name: name.trim() || user.name,
      mobile: mobile.trim() || user.mobile,
      profile: updatedProfile,
    };

    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl space-y-0 text-slate-800">
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#1B2A6B] text-white flex items-center justify-center font-bold text-base shadow-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#1B2A6B] text-base">{user.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E7B34] border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{user.authMethod === 'digilocker' ? 'DigiLocker Verified' : 'OTP Verified'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">+91 {user.mobile ? `${user.mobile.slice(0, 2)}******${user.mobile.slice(-2)}` : '98******10'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-xs font-bold text-[#1B2A6B] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-[#1B2A6B] border-b border-slate-200 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span>Demographic Profile Overview</span>
                    {user.authMethod === 'digilocker' && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isSimulatedMode()
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-emerald-50 text-[#1E7B34] border-emerald-200'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        <span>{isSimulatedMode() ? 'Simulated' : 'Connected to DigiLocker'}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {user.aadhaar_masked && (
                      <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Aadhaar: {user.aadhaar_masked}
                      </span>
                    )}
                    {onDisconnectDigiLocker && (user.authMethod === 'digilocker' || (user.documents && user.documents.length > 0)) && (
                      <button
                        type="button"
                        onClick={onDisconnectDigiLocker}
                        className="px-2.5 py-0.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Disconnect DigiLocker and remove stored documents"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Disconnect DigiLocker</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name:</span>
                    <span className="font-semibold text-slate-800 text-xs">{user.name}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Mobile Number (Masked):</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      +91 {user.mobile ? `${user.mobile.slice(0, 2)}******${user.mobile.slice(-2)}` : '98******10'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Age &amp; Gender:</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {user.profile?.age ? `${user.profile.age} yrs` : 'N/A'} • {user.profile?.gender || 'Not specified'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Location:</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {user.profile?.district || 'District'}, {user.profile?.state || 'State'} ({user.profile?.pincode || 'PIN'})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Occupation:</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {user.profile?.occupation || 'General'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Agricultural Land:</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {user.profile?.land_acres ?? 0} acres ({user.profile?.land_hectares ?? 0} ha)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Annual Family Income:</span>
                    <span className="font-bold text-[#1E7B34] text-xs">
                      ₹{(user.profile?.annual_income_inr ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Social Category:</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {user.profile?.social_category || 'General'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Housing Type:</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {user.profile?.housing_type || 'Pucca'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Taxpayer Status:</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {user.profile?.is_taxpayer ? 'Taxpayer (Exempt from select schemes)' : 'Non-taxpayer (Eligible)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-[#1E7B34] shrink-0" />
                <span>
                  These parameters prefill SchemeSetu's deterministic rules engine and application kits.
                </span>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form id="profile-edit-form" onSubmit={handleSaveChanges} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number (+91)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Occupation</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none bg-white"
                  >
                    <option value="Farmer">Farmer (Cultivator)</option>
                    <option value="Agricultural worker">Agricultural worker</option>
                    <option value="Student">Student</option>
                    <option value="Labourer">Labourer / Daily Wage</option>
                    <option value="Homemaker">Homemaker</option>
                    <option value="Other">Other / Self Employed</option>
                  </select>
                </div>

                {occupation === 'Farmer' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Land in Acres (1 acre = 0.4047 ha)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={landAcres}
                      onChange={(e) => setLandAcres(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      = {(Number(landAcres || 0) * 0.4047).toFixed(3)} hectares
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Annual Family Income (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Social Category</label>
                  <select
                    value={socialCategory}
                    onChange={(e) => setSocialCategory(e.target.value as SocialCategory)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none bg-white"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC (Other Backward Class)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Housing Type</label>
                  <select
                    value={housingType}
                    onChange={(e) => setHousingType(e.target.value as HousingType)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none bg-white"
                  >
                    <option value="Kutcha">Kutcha (Mud/Thatched - PMAY priority)</option>
                    <option value="Pucca">Pucca (Concrete)</option>
                    <option value="Homeless">Homeless</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="taxpayer-checkbox"
                  checked={isTaxpayer}
                  onChange={(e) => setIsTaxpayer(e.target.checked)}
                  className="rounded border-slate-300 text-[#1E7B34] focus:ring-[#1E7B34]"
                />
                <label htmlFor="taxpayer-checkbox" className="text-xs text-slate-700 cursor-pointer">
                  Income tax payee in the last assessment year
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            {isEditing ? 'Changes will be saved to your local profile.' : 'Official Citizen Profile'}
          </span>
          <div className="flex items-center gap-2.5">
            {isEditing ? (
              <button
                type="submit"
                form="profile-edit-form"
                className="px-5 py-2.5 rounded-[10px] bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save changes</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-[10px] bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
