import React from 'react';
import { jsPDF } from 'jspdf';
import { X, Download, Printer, FileText, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { AgentResponse } from '../types/agent';
import { AuthUser } from '../types/auth';
import { isSimulatedMode } from '../digilocker';

interface ActionPackModalProps {
  response: AgentResponse | null;
  onClose: () => void;
  authUser?: AuthUser | null;
}

export const ActionPackModal: React.FC<ActionPackModalProps> = ({ response, onClose, authUser }) => {
  if (!response) return null;

  const { user_profile: profile, eligible_schemes, csc_recommendation } = response;
  const citizenName = authUser?.name || profile.name || 'Citizen Applicant';
  const isDigiLocker = authUser?.authMethod === 'digilocker';

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(27, 42, 107); // Navy #1B2A6B
    doc.text('SCHEMESETU BHARAT - CITIZEN ACTION PACK', 20, y);
    y += 7;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Apni Yojana, Apna Haq - Official Welfare Discovery Summary', 20, y);
    if (isDigiLocker) {
      doc.setTextColor(30, 123, 52); // Green #1E7B34
      doc.setFontSize(9);
      doc.text('[ DIGILOCKER VERIFIED CITIZEN ]', 135, y);
    }
    y += 10;

    doc.setDrawColor(242, 140, 40); // Saffron #F28C28
    doc.setLineWidth(1);
    doc.line(20, y, 190, y);
    y += 10;

    // Citizen Info
    doc.setFontSize(12);
    doc.setTextColor(27, 42, 107);
    doc.text('1. CITIZEN DEMOGRAPHIC PROFILE', 20, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Name: ${citizenName}`, 25, y);
    doc.text(`Age: ${profile.age || 'N/A'} yrs`, 110, y);
    y += 6;
    doc.text(`Occupation: ${profile.occupation || 'General'}`, 25, y);
    doc.text(`Income: Rs. ${(profile.annual_income_inr || 0).toLocaleString('en-IN')}`, 110, y);
    y += 6;
    doc.text(`Landholding: ${profile.land_acres || 0} acres (${profile.land_hectares || 0} ha)`, 25, y);
    doc.text(`Location: ${profile.district || ''}, ${profile.state || ''} (${profile.pincode || 'N/A'})`, 110, y);
    y += 6;
    if (isDigiLocker) {
      doc.setTextColor(30, 123, 52);
      const verifyText = isSimulatedMode()
        ? `Verification: Verified via DigiLocker (Simulated) (Aadhaar: ${authUser?.aadhaar_masked || 'XXXX XXXX 4821'})`
        : `Verification: Connected to DigiLocker (Aadhaar: ${authUser?.aadhaar_masked || 'XXXX XXXX 4821'})`;
      doc.text(verifyText, 25, y);
      y += 6;
    }
    y += 6;

    // Total Financial Benefit
    doc.setFontSize(12);
    doc.setTextColor(30, 123, 52); // Green #1E7B34
    doc.text(`TOTAL POTENTIAL WELFARE BENEFIT: Rs. ${response.total_potential_benefit_inr.toLocaleString('en-IN')}`, 20, y);
    y += 10;

    // Eligible Schemes
    doc.setFontSize(12);
    doc.setTextColor(27, 42, 107);
    doc.text(`2. ELIGIBLE SCHEMES (${eligible_schemes.length})`, 20, y);
    y += 6;

    doc.setFontSize(10);
    eligible_schemes.forEach((s, idx) => {
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. ${s.scheme_name} - Rs. ${s.benefit_amount_inr.toLocaleString('en-IN')} (${s.benefit_frequency})`, 25, y);
      y += 5;
      doc.setTextColor(71, 85, 105);
      doc.text(`   Required Docs: ${s.required_documents.slice(0, 3).join(', ')}`, 25, y);
      y += 7;
    });

    y += 5;

    // Nearest CSC
    if (csc_recommendation) {
      doc.setFontSize(12);
      doc.setTextColor(27, 42, 107);
      doc.text('3. NEAREST COMMON SERVICE CENTRE (CSC)', 20, y);
      y += 6;

      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`Centre: ${csc_recommendation.name}`, 25, y);
      y += 5;
      doc.text(`Address: ${csc_recommendation.address}`, 25, y);
      y += 5;
      doc.text(`VLE Contact: ${csc_recommendation.phone || '+91 98721 04512'}`, 25, y);
      y += 10;
    }

    // Next Steps Checklist
    doc.setFontSize(12);
    doc.setTextColor(27, 42, 107);
    doc.text('4. MANDATORY ACTION STEPS FOR CITIZEN', 20, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('[ ] Carry original Aadhaar Card and Aadhaar-seeded Bank Passbook', 25, y);
    y += 5;
    doc.text('[ ] Carry Land Record (Khasra-Khatauni) or Category Certificate', 25, y);
    y += 5;
    doc.text('[ ] Visit nearest CSC Kiosk for biometric e-KYC and form dispatch', 25, y);

    // Save
    doc.save(`SchemeSetu_Action_Pack_${profile.name || 'Citizen'}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2A6B]/10 text-[#1B2A6B] flex items-center justify-center border border-[#1B2A6B]/20">
              <FileText className="w-5 h-5 text-[#1B2A6B]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1B2A6B] text-base">Citizen Welfare Action Pack</h3>
              <p className="text-xs text-slate-500">Official Filing Kit &amp; Verified Benefit Checklist</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          <div className="tricolour-gradient h-1.5 rounded-full" />

          {/* Top Banner */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">
                Total Financial Value Unlocked
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1E7B34]">
                ₹ {response.total_potential_benefit_inr.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-medium">
              <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
              <div className="font-mono text-[#F28C28] font-bold">ID: ACT-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          {/* Citizen Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-bold text-[#1B2A6B] border-b border-slate-200 pb-1.5 text-xs flex items-center justify-between">
              <span>1. Citizen Profile &amp; Declarations</span>
              {isDigiLocker && (
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${
                  isSimulatedMode()
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-emerald-50 text-[#1E7B34] border-emerald-200'
                }`}>
                  <ShieldCheck className="w-3 h-3 text-[#1E7B34]" />
                  <span>{isSimulatedMode() ? 'DigiLocker Verified (Simulated)' : 'Connected to DigiLocker'}</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-slate-700">
              <div>
                Name: <span className="font-semibold text-slate-900">{citizenName}</span>
              </div>
              <div>
                Age: <span className="font-semibold text-slate-900">{profile.age || 'N/A'} yrs</span>
              </div>
              <div>
                Occupation: <span className="font-semibold text-slate-900">{profile.occupation || 'General'}</span>
              </div>
              <div>
                Land: <span className="font-semibold text-slate-900">{profile.land_acres || 0} acres</span>
              </div>
              <div>
                Income:{' '}
                <span className="font-semibold text-[#1E7B34]">
                  ₹{(profile.annual_income_inr || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                Location:{' '}
                <span className="font-semibold text-slate-900">
                  {profile.district || ''}, {profile.state || ''}
                </span>
              </div>
            </div>
          </div>

          {/* Eligible Schemes list */}
          <div className="space-y-2.5">
            <div className="font-bold text-[#1B2A6B]">
              2. Eligible Welfare Programs ({eligible_schemes.length})
            </div>
            <div className="space-y-2">
              {eligible_schemes.map((s, idx) => (
                <div
                  key={s.scheme_id}
                  className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="font-bold text-[#1B2A6B]">
                      {idx + 1}. {s.scheme_name}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{s.benefit_description}</div>
                    <div className="text-[#d97706] text-[11px] mt-1 font-medium">
                      Required Docs: {s.required_documents.join(', ')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-[#1E7B34]">
                      ₹{s.benefit_amount_inr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500">{s.benefit_frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearest CSC */}
          {csc_recommendation && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-[#1B2A6B] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F28C28]" />
                <span>3. Recommended CSC Kiosk / Digital Seva Desk</span>
              </div>
              <div className="text-slate-800 font-bold">{csc_recommendation.name}</div>
              <div className="text-slate-600">{csc_recommendation.address}</div>
              <div className="text-slate-600">
                Contact Phone: {csc_recommendation.phone || '+91 98721 04512'} • Hours: {csc_recommendation.hours}
              </div>
            </div>
          )}

          {/* Action Checklist */}
          <div className="bg-amber-50/80 border border-amber-300 p-4 rounded-2xl space-y-2">
            <div className="font-bold text-[#1B2A6B]">4. Physical Checklist to Take to CSC:</div>
            <ul className="space-y-1.5 text-slate-700 text-[11px] font-medium">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#1E7B34]" />
                <span>Original Aadhaar Card of Applicant &amp; Family Members</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#1E7B34]" />
                <span>Active Aadhaar-seeded Bank Passbook / Cancelled Cheque</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#1E7B34]" />
                <span>Land Title Deed / Khasra-Khatauni (if applying for farmer schemes)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#1E7B34]" />
                <span>Income / Caste Certificate (if applicable)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#1E7B34]" />
                <span>2 Passport Size Photos</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>

          <button
            type="button"
            onClick={generatePDF}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs transition shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Save PDF Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
