import React from 'react';
import { jsPDF } from 'jspdf';
import { X, Download, Printer, Landmark, CheckCircle, FileText, MapPin } from 'lucide-react';
import { AgentResponse } from '../types/agent';

interface ActionPackModalProps {
  response: AgentResponse | null;
  onClose: () => void;
}

export const ActionPackModal: React.FC<ActionPackModalProps> = ({ response, onClose }) => {
  if (!response) return null;

  const { user_profile: profile, eligible_schemes, review_schemes, csc_recommendation } = response;

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(20, 83, 45); // Emerald
    doc.text('SCHEMESETU BHARAT - CITIZEN ACTION PACK', 20, y);
    y += 7;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Apni Yojana, Apna Haq - Official Welfare Discovery Summary', 20, y);
    y += 10;

    doc.setDrawColor(255, 153, 51);
    doc.setLineWidth(1);
    doc.line(20, y, 190, y);
    y += 10;

    // Citizen Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('1. CITIZEN DEMOGRAPHIC PROFILE', 20, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Name: ${profile.name || 'Citizen Applicant'}`, 25, y);
    doc.text(`Age: ${profile.age || 'N/A'} yrs`, 110, y);
    y += 6;
    doc.text(`Occupation: ${profile.occupation || 'General'}`, 25, y);
    doc.text(`Income: Rs. ${(profile.annual_income_inr || 0).toLocaleString('en-IN')}`, 110, y);
    y += 6;
    doc.text(`Landholding: ${profile.land_acres || 0} acres (${profile.land_hectares || 0} ha)`, 25, y);
    doc.text(`Location: ${profile.district || ''}, ${profile.state || ''} (${profile.pincode || 'N/A'})`, 110, y);
    y += 12;

    // Total Financial Benefit
    doc.setFontSize(12);
    doc.setTextColor(20, 83, 45);
    doc.text(`TOTAL POTENTIAL WELFARE BENEFIT: Rs. ${response.total_potential_benefit_inr.toLocaleString('en-IN')}`, 20, y);
    y += 10;

    // Eligible Schemes
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
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
      doc.setTextColor(0, 0, 0);
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
    doc.setTextColor(0, 0, 0);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="bg-slate-800/80 p-5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Citizen Welfare Action Pack</h3>
              <p className="text-xs text-slate-400">Printable document checklist & scheme overview</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          <div className="tricolour-gradient h-1 rounded"></div>

          {/* Top Banner */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">TOTAL FINANCIAL VALUE UNLOCKED</div>
              <div className="text-2xl font-black text-emerald-400">
                ₹ {response.total_potential_benefit_inr.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
              <div className="font-mono text-amber-400">ID: ACT-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          {/* Citizen Details */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">
              1. Citizen Profile & Declarations
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
              <div>
                Name: <span className="font-semibold text-white">{profile.name || 'Citizen Applicant'}</span>
              </div>
              <div>
                Age: <span className="font-semibold text-white">{profile.age || 'N/A'} yrs</span>
              </div>
              <div>
                Occupation: <span className="font-semibold text-white">{profile.occupation || 'General'}</span>
              </div>
              <div>
                Land: <span className="font-semibold text-white">{profile.land_acres || 0} acres</span>
              </div>
              <div>
                Income:{' '}
                <span className="font-semibold text-emerald-400">
                  ₹{(profile.annual_income_inr || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                State:{' '}
                <span className="font-semibold text-white">
                  {profile.district || ''}, {profile.state || ''}
                </span>
              </div>
            </div>
          </div>

          {/* Eligible Schemes list */}
          <div className="space-y-2">
            <div className="font-bold text-slate-200">
              2. Eligible Welfare Programs ({eligible_schemes.length})
            </div>
            <div className="space-y-2">
              {eligible_schemes.map((s, idx) => (
                <div
                  key={s.scheme_id}
                  className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-white">
                      {idx + 1}. {s.scheme_name}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{s.benefit_description}</div>
                    <div className="text-amber-300 text-[11px] mt-1">
                      Required Docs: {s.required_documents.join(', ')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-emerald-400">
                      ₹{s.benefit_amount_inr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">{s.benefit_frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearest CSC */}
          {csc_recommendation && (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>3. Recommended CSC Kiosk / Digital Seva Desk</span>
              </div>
              <div className="text-slate-300 font-semibold">{csc_recommendation.name}</div>
              <div className="text-slate-400">{csc_recommendation.address}</div>
              <div className="text-slate-400">
                Contact Phone: {csc_recommendation.phone || '+91 98721 04512'} • Hours: {csc_recommendation.hours}
              </div>
            </div>
          )}

          {/* Action Checklist */}
          <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl space-y-2">
            <div className="font-bold text-amber-300">4. Physical Checklist to Take to CSC:</div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>✓ Original Aadhaar Card of Applicant & Family Members</li>
              <li>✓ Active Aadhaar-seeded Bank Passbook / Cancelled Cheque</li>
              <li>✓ Land Title Deed / Khasra-Khatauni (if applying for farmer schemes)</li>
              <li>✓ Income / Caste Certificate (if applicable)</li>
              <li>✓ 2 Passport Size Photos</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/80 p-4 border-t border-slate-700 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>

          <button
            type="button"
            onClick={generatePDF}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Save PDF Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
