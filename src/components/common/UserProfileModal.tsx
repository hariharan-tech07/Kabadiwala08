import React, { useState } from 'react';
import { User, VernacularLang } from '../../types';
import { translations } from '../../translations';
import {
  User as UserIcon, ShieldCheck, MapPin, Phone, Building2,
  CheckCircle2, X, QrCode, Smartphone, Globe, ShieldAlert,
  Calendar, Award, Key, RefreshCw, FileText, Download, Check
} from 'lucide-react';
import { AadhaarKYCModal } from './AadhaarKYCModal';

interface UserProfileModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  user: User;
  lang?: VernacularLang;
  isEmbedded?: boolean; // When rendered directly inside the dashboard tab
  onSwitchUser?: (role: 'scrapper' | 'recycler' | 'household' | 'admin') => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen = true,
  onClose,
  user,
  lang = 'en',
  isEmbedded = false,
  onSwitchUser
}) => {
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen && !isEmbedded) return null;

  const t = translations[lang] || translations.en;

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'scrapper':
        return {
          gradient: 'from-emerald-600 to-teal-700',
          badgeBg: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40',
          accent: 'emerald',
          label: 'Informal Scrap Collector (Kabadiwala)'
        };
      case 'recycler':
        return {
          gradient: 'from-cyan-600 to-blue-700',
          badgeBg: 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/40',
          accent: 'cyan',
          label: 'Authorized E-Waste Recycler'
        };
      case 'household':
        return {
          gradient: 'from-blue-600 to-indigo-700',
          badgeBg: 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/40',
          accent: 'blue',
          label: 'Household Citizen Member'
        };
      case 'admin':
        return {
          gradient: 'from-amber-600 to-orange-700',
          badgeBg: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40',
          accent: 'amber',
          label: 'CPCB Directorate Regulatory Officer'
        };
    }
  };

  const roleMeta = getRoleColor();

  const content = (
    <div className={`space-y-6 ${isEmbedded ? '' : 'p-4 sm:p-6'}`}>
      {/* Top Profile Header Card */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${roleMeta.gradient} p-5 sm:p-6 text-white shadow-lg`}>
        <div className="absolute right-0 top-0 -mt-6 -mr-6 h-36 w-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-2xl sm:text-3xl text-white shadow-inner shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {user.name}
                </h2>
                {user.verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-white/80 font-medium mt-0.5">
                {roleMeta.label}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-white/90 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md font-mono">
                  ID: {user.id}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>{user.location}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {user.role === 'scrapper' && (
              <button
                type="button"
                id="profile-view-aadhaar-btn"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 active:scale-95 text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-white/60"
              >
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Aadhaar Card</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary User Details Grid (Displayed in Every Tab of Portal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Detail 1: Full Legal Name */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Full Legal Name</span>
            <button
              type="button"
              onClick={() => handleCopy('name', user.name)}
              className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {copiedField === 'name' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">
            {user.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Username: @{user.username}
          </div>
        </div>

        {/* Detail 2: Verified Contact Phone */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-500" />
              <span>Contact Mobile</span>
            </span>
            {user.phone && (
              <button
                type="button"
                onClick={() => handleCopy('phone', user.phone || '')}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {copiedField === 'phone' ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 font-mono">
            {user.phone || 'Not Registered'}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>SMS & OTP Alerts Active</span>
          </div>
        </div>

        {/* Detail 3: Operating Location & District */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            <span>Operating Location</span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 truncate" title={user.location}>
            {user.location}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            District: Bengaluru Urban • Karnataka
          </div>
        </div>

        {/* Detail 4: Aadhaar KYC Reference (Scrapper / Citizen) */}
        {(user.role === 'scrapper' || user.role === 'household') && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Aadhaar Identity</span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 font-mono">
              XXXX-XXXX-{user.aadhaar_last4 || '8821'}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 font-semibold">
              <Check className="w-3 h-3" />
              <span>UIDAI KYC Verified</span>
            </div>
          </div>
        )}

        {/* Detail 5: CPCB Authorization (Recycler / Admin) */}
        {(user.role === 'recycler' || user.role === 'admin' || user.cpcb_number) && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-500" />
                <span>CPCB Auth Number</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy('cpcb', user.cpcb_number || 'CPCB/EW/KAR/2024/7742')}
                className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {copiedField === 'cpcb' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 font-mono">
              {user.cpcb_number || 'CPCB/EW/KAR/2024/7742'}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">
              Rule 13 E-Waste 2022 Validated
            </div>
          </div>
        )}

        {/* Detail 6: Facility / Directorate Entity */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Registered Entity / Hub
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">
            {user.entity_name || (user.role === 'scrapper' ? 'Peenya Collection Hub (Main Yard)' : user.role === 'recycler' ? 'EcoWaste Recyclers India Hub' : user.role === 'admin' ? 'CPCB Central Regulatory Authority' : 'Bangalore East Citizen Sector')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Status: Active & Certified
          </div>
        </div>

        {/* Detail 7: Access Level & Permissions */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            RBAC Access Tier
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-indigo-500" />
            <span className="capitalize">{user.role} Tier (Level 1)</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full operational permissions granted
          </div>
        </div>
      </div>

      {/* Account Identity Document & Legal Safeguard Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200">
              Government of India E-Waste EPR Formalization Registry
            </h4>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80">
              This identity provides statutory legal immunity against arbitrary municipal confiscations and ensures fair benchmark prices.
            </p>
          </div>
        </div>

        {user.role === 'scrapper' && (
          <button
            type="button"
            onClick={() => setIsAadhaarModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
          >
            Show Identity Card
          </button>
        )}
      </div>

      {/* Optional Role Switcher for Admin testing if requested */}
      {onSwitchUser && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Switch Test Persona (Dual Master Control)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onSwitchUser('scrapper')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                user.role === 'scrapper'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              Scrapper Persona
            </button>
            <button
              type="button"
              onClick={() => onSwitchUser('recycler')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                user.role === 'recycler'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              Recycler Persona
            </button>
            <button
              type="button"
              onClick={() => onSwitchUser('household')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                user.role === 'household'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              Household Persona
            </button>
            <button
              type="button"
              onClick={() => onSwitchUser('admin')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                user.role === 'admin'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              Admin Persona
            </button>
          </div>
        </div>
      )}

      {/* Aadhaar KYC Modal */}
      {isAadhaarModalOpen && (
        <AadhaarKYCModal
          isOpen={isAadhaarModalOpen}
          onClose={() => setIsAadhaarModalOpen(false)}
          user={user}
          lang={lang}
        />
      )}
    </div>
  );

  // If embedded directly inside dashboard tab:
  if (isEmbedded) {
    return (
      <div className="bg-white dark:bg-[#0A101D] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-7">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                User Profile & Identity Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official registry information and account credentials
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Active Session
          </span>
        </div>
        {content}
      </div>
    );
  }

  // Otherwise render as Modal:
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0C1220] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
              User Profile
            </span>
          </div>
          {onClose && (
            <button
              type="button"
              id="profile-modal-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {content}

        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
