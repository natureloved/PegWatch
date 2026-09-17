import React, { useState } from 'react';
import { AlertTriangle, ShieldX, X } from 'lucide-react';

interface RevokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  delegatedWallet: string;
}

export const RevokeModal: React.FC<RevokeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  delegatedWallet,
}) => {
  const [confirmInput, setConfirmInput] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmInput.trim() === 'REVOKE') {
      onConfirm();
      setConfirmInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-panel border border-crimson/40 rounded-xl p-6 shadow-[0_0_50px_rgba(244,80,106,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 text-crimson mb-4">
          <div className="p-2 rounded-lg bg-crimson-muted border border-crimson/30">
            <ShieldX size={22} />
          </div>
          <div>
            <h3 className="text-base font-semibold font-sans text-white">
              Revoke Agent Signing Authority
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Dynamic Delegated Access ({delegatedWallet.slice(0, 6)}...{delegatedWallet.slice(-4)})
            </p>
          </div>
        </div>

        {/* Warning Body */}
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed mb-5">
          <div className="p-3 bg-obsidian border border-panel-border rounded-lg text-slate-300 space-y-1.5 font-mono text-[11px]">
            <p className="text-amber-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle size={13} /> Immediate Consequences:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Revokes cryptographic MPC signing key in Dynamic wallet.</li>
              <li>Agent loses authorization to sign Definitive Flash stop-loss orders.</li>
              <li>Peg drift during weekend oracle freezes will NOT be de-risked.</li>
            </ul>
          </div>
          <p className="text-slate-400">
            Type <strong className="text-crimson font-mono font-bold">REVOKE</strong> below to confirm immediate revocation of delegated execution rights.
          </p>
        </div>

        {/* Input Confirmation */}
        <div className="space-y-3">
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
            placeholder="Type REVOKE to confirm"
            className="w-full bg-obsidian border border-panel-border focus:border-crimson rounded-lg px-3.5 py-2 text-sm font-mono text-white placeholder-slate-600 focus:outline-none transition-colors uppercase"
            autoFocus
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-panel-elevated transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmInput !== 'REVOKE'}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-crimson/20 border border-crimson/40 text-crimson hover:bg-crimson hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              Confirm Revocation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
