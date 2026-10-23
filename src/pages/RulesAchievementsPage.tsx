import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Sparkles,
  Trophy,
  Medal,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ClassRule, ClassAchievement } from '../types';

interface RulesAchievementsPageProps {
  rules: ClassRule[];
  achievements: ClassAchievement[];
  defaultTab?: 'rules' | 'achievements';
}

export const RulesAchievementsPage: React.FC<RulesAchievementsPageProps> = ({
  rules,
  achievements,
  defaultTab = 'rules',
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'achievements'>(defaultTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            {activeTab === 'rules' ? (
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            ) : (
              <Award className="w-7 h-7 text-yellow-400" />
            )}
            {activeTab === 'rules' ? 'PERATURAN & TATA TERTIB 8F' : 'PENCAPAIAN & PRESTASI KELAS 8F'}
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            {activeTab === 'rules'
              ? 'Pedoman norma, etika, dan ketertiban bersama untuk kenyamanan belajar'
              : 'Momen kebanggaan, piala kejuaraan, dan rekam jejak positif keluarga besar 8F'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl glass-card p-1 border border-purple-500/30 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Peraturan Kelas
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Pencapaian Kelas
          </button>
        </div>
      </div>

      {activeTab === 'rules' ? (
        <div className="space-y-5">
          {/* Official disclaimer box */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3 text-xs text-purple-200">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Catatan Tata Tertib:</strong> Seluruh butir peraturan ini merupakan komitmen bersama
              yang diselaraskan dengan tata tertib resmi sekolah dan telah disepakati di bawah
              bimbingan Wali Kelas <strong>BUK BIBA</strong> demi kebaikan seluruh siswa 8F.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule, idx) => (
              <div
                key={rule.id || idx}
                className="glass-card rounded-2xl p-5 border border-purple-500/25 space-y-2 hover:border-purple-400/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono">
                    {rule.category}
                  </span>
                  <span className="text-xs font-galaxy font-bold text-purple-400">
                    Pasal #{rule.order || idx + 1}
                  </span>
                </div>

                <h3 className="font-galaxy font-bold text-base text-white">{rule.title}</h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Achievements tab */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="glass-card rounded-2xl p-6 border border-yellow-500/30 space-y-3 bg-gradient-to-b from-yellow-950/15 to-slate-950/70 hover:scale-105 transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300">
                <Trophy className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-yellow-300/80 tracking-wider">
                  {ach.category} • {ach.date}
                </span>
                <h3 className="font-galaxy font-bold text-base text-white mt-1">{ach.title}</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{ach.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
