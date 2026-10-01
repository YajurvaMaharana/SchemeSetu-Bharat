import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Star,
  Users,
  CheckCircle2,
  Zap,
  Printer,
  Share2,
  ShieldCheck,
  Building2,
  QrCode,
  Check,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CscCenter, CscAppointment, UserProfile } from '../types/agent';
import { generateCscAppointment } from '../services/cscLocator';

interface CscAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  center: CscCenter | null;
  userProfile?: UserProfile | null;
  onBookingConfirmed?: (appointment: CscAppointment) => void;
}

const AVAILABLE_SERVICES = [
  'PM-KISAN DBT e-KYC & Land Record Verification',
  'Ayushman Bharat PVC Card Printing & Biometrics',
  'Kisan Credit Card (KCC) Crop Loan Application',
  'Mahabhulekh 7/12 Land Record Mutation Print',
  'Income & Caste Certificate Statutory Attestation',
  'General Citizen Welfare Discovery & Filing',
];

const TIME_SLOTS = [
  '09:30 AM - 10:00 AM',
  '10:30 AM - 11:00 AM (Recommended)',
  '11:30 AM - 12:00 PM',
  '02:30 PM - 03:00 PM',
  '03:30 PM - 04:00 PM',
  '04:30 PM - 05:00 PM',
];

export const CscAppointmentModal: React.FC<CscAppointmentModalProps> = ({
  isOpen,
  onClose,
  center,
  userProfile,
  onBookingConfirmed,
}) => {
  const [selectedService, setSelectedService] = useState<string>(AVAILABLE_SERVICES[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[1]);
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(1); // 0 = today, 1 = tomorrow, 2 = day after
  const [phoneInput, setPhoneInput] = useState<string>('9872104512');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<CscAppointment | null>(null);

  if (!isOpen || !center) return null;

  const dates = [
    { label: 'Today', offset: 0 },
    { label: 'Tomorrow', offset: 1 },
    { label: 'Day After', offset: 2 },
  ].map((d) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + d.offset);
    return {
      label: d.label,
      offset: d.offset,
      formatted: dt.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
    };
  });

  const handleBook = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const appt = generateCscAppointment(
        center,
        userProfile || { name: 'Citizen Applicant', pincode: center.pin_code } as UserProfile,
        selectedSlot,
        selectedService
      );
      setConfirmedBooking(appt);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1E7B34', '#F28C28', '#1B2A6B'],
      });
      if (onBookingConfirmed) {
        onBookingConfirmed(appt);
      }
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!confirmedBooking) return;
    const text = encodeURIComponent(
      `🏛️ *CSC Priority Appointment Pass*\nCenter: ${confirmedBooking.centerName}\nToken: *${confirmedBooking.tokenNumber}*\nDate: ${confirmedBooking.appointmentDate} (${confirmedBooking.appointmentTimeSlot})\nService: ${confirmedBooking.serviceRequested}\nVLE Operator: ${confirmedBooking.vleName} (${confirmedBooking.vlePhone})\nAddress: ${confirmedBooking.address}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Tricolour Accent Line */}
        <div className="h-1.5 w-full tricolour-gradient" />

        {/* Modal Header */}
        <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B2A6B] text-white flex items-center justify-center shadow-xs shrink-0">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34] border border-emerald-300">
                  Priority Pass Booking
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  [Simulated]
                </span>
              </div>
              <h3 className="font-extrabold text-[#1B2A6B] text-base sm:text-lg">
                Book CSC Helpdesk Appointment
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {!confirmedBooking ? (
            /* Booking Form */
            <div className="space-y-5 animate-fadeIn">
              {/* Selected Center Summary Card */}
              <div className="bg-gradient-to-r from-blue-50/70 via-white to-emerald-50/70 p-4 rounded-2xl border border-blue-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#1B2A6B]">{center.name}</h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F28C28] shrink-0" />
                      <span className="line-clamp-1">{center.address}</span>
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1E7B34] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">
                    {center.distance_km} km
                  </span>
                </div>

                {/* Real-time Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="font-bold">{center.vle_rating || 4.9}</span>
                    <span className="text-[10px] text-slate-400">({center.vle_rating_count || 184})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold">{center.current_queue_length} in queue</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{center.predicted_wait_time_minutes}m wait</span>
                  </div>
                </div>
              </div>

              {/* Priority Fast-Track Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-[#F28C28] shrink-0" />
                <span>
                  <strong>Priority Digital Token:</strong> Pre-booking allocates a dedicated counter slot, reducing expected wait time to under 5 minutes.
                </span>
              </div>

              {/* Service Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Assistance Service:
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E7B34]"
                >
                  {AVAILABLE_SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Appointment Date:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {dates.map((d) => (
                    <button
                      key={d.offset}
                      type="button"
                      onClick={() => setSelectedDateOffset(d.offset)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        selectedDateOffset === d.offset
                          ? 'bg-[#1B2A6B] text-white border-[#1B2A6B] shadow-2xs font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{d.label}</div>
                      <div className="text-[10px] opacity-80">{d.formatted}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Preferred Time Slot:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        selectedSlot === slot
                          ? 'bg-emerald-50 border-[#1E7B34] text-[#1E7B34] font-bold ring-2 ring-[#1E7B34]/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Confirmation Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Mobile Number for SMS / WhatsApp Pass:
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 overflow-hidden text-xs">
                  <span className="px-3 py-2.5 bg-slate-200/80 font-bold text-slate-600 border-r border-slate-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    maxLength={10}
                    placeholder="9872104512"
                    className="flex-1 px-3 py-2.5 bg-transparent font-mono text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleBook}
                  className="w-full py-3.5 bg-[#1E7B34] hover:bg-[#18682B] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{isSubmitting ? 'Confirming with CSC Gateway...' : 'Confirm Appointment & Generate Token'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Confirmed Appointment Pass */
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="w-14 h-14 rounded-full bg-[#1E7B34] text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1E7B34] border border-emerald-300">
                  Priority Slot Reserved
                </span>
                <h4 className="text-xl font-black text-[#1B2A6B] mt-1">
                  CSC Appointment Confirmed!
                </h4>
                <p className="text-xs text-slate-500">
                  Present this digital pass at the center counter for priority fast-track assistance.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 border-2 border-emerald-300 rounded-3xl p-5 text-left space-y-4 shadow-sm relative overflow-hidden" id="csc-appointment-pass">
                {/* Token Badge */}
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Priority Token Number:
                    </span>
                    <div className="text-2xl font-black font-mono text-[#1E7B34]">
                      {confirmedBooking.tokenNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Booking Reference:</span>
                    <strong className="text-xs font-mono text-slate-800">
                      {confirmedBooking.bookingId}
                    </strong>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Center Name:</span>
                    <strong className="text-slate-900 block">{confirmedBooking.centerName}</strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      {confirmedBooking.address}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">VLE Operator:</span>
                    <strong className="text-slate-900 block">{confirmedBooking.vleName}</strong>
                    <span className="text-[11px] text-[#1E7B34] font-medium block mt-0.5">
                      {confirmedBooking.vlePhone}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Date &amp; Time:</span>
                    <strong className="text-slate-900 block">{confirmedBooking.appointmentDate}</strong>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      {confirmedBooking.appointmentTimeSlot}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Service:</span>
                    <strong className="text-slate-900 line-clamp-2">{confirmedBooking.serviceRequested}</strong>
                  </div>
                </div>

                {/* Priority Queue Status */}
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span className="font-bold">Fast-Track Estimated Wait:</span>
                  </div>
                  <span className="font-extrabold text-[#1E7B34] bg-emerald-50 px-2 py-0.5 rounded-md">
                    &lt; {confirmedBooking.estimatedWaitMinutes} minutes
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Digitally Validated via SchemeSetu Bharat</span>
                  <span>Simulated VLE Confirmation</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send to WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Pass</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-3 rounded-xl bg-[#1B2A6B] hover:bg-[#142052] text-white font-bold text-xs transition cursor-pointer"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
