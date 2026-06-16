import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 🎯 ENVIRONMENT AXIOS PATH CONFIGURATION MATRIX
// Resolves 404 bridges by switching natively between dev localhost and production cloud servers
const API_BASE = import.meta.env.VITE_API_URL || '';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/certificates`);
      setCertificates(response.data || []);
    } catch (error) {
      console.error('🚨 Error fetching cryptographic verification indexes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (cert) => {
    if (!cert.stellar_tx_hash) {
      alert('No transactional tracking hash available for validation loop.');
      return;
    }

    setVerifying((prev) => ({ ...prev, [cert.id]: true }));
    
    try {
      const response = await axios.get(`${API_BASE}/api/certificates/verify/${cert.stellar_tx_hash}`);
      
      if (response.data.verified) {
        alert(`✅ Certificate Verified!\n\nLedger Block Index: ${response.data.ledger_block || response.data.stellar_ledger_index}\n\nThis entry is authentically anchored to the Stellar blockchain consensus matrix.`);
      } else {
        alert('⚠️ Validation Alert: Record signature mismatch detected on external block layers.');
      }
    } catch (error) {
      alert('⚠️ Verification Timeout: Network node gateway unreachable or hash query does not exist.');
      console.error('🚨 Verification layer failure:', error);
    } finally {
      setVerifying((prev) => ({ ...prev, [cert.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Compiling Certificate Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans antialiased text-slate-800">
      
      {/* HEADER HERO MODULE */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-white relative overflow-hidden shadow-xl mb-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">📄 Escrow Certificates</h1>
            <p className="text-slate-400 text-xs max-w-2xl">
              Cryptographically audited carbon compensation and sustainable hardware acquisition proofs anchored to the public Stellar Network to defeat fraudulent corporate greenwashing.
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 shadow-inner border border-slate-700 min-w-36 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Ledger Rows</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{certificates.length}</p>
          </div>
        </div>
      </div>

      {/* CERTIFICATES CATALOG MATRIX GRID */}
      {certificates.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">No Verification Blocks Indexed</h3>
          <p className="text-slate-400 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
            Certificates initialize dynamically the moment an active asset item undergoes a minting sequence on the marketplace module dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              {/* Card Geometric Top Bar */}
              <div className="bg-slate-900 p-4 border-b border-slate-800 text-white flex items-center justify-between">
                <span className="text-[10px] font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded-md text-emerald-400 font-bold tracking-wider">
                  UUID: {cert.certificate_id || `CERT-${cert.id}`}
                </span>
                <span className="text-xs">🌳</span>
              </div>

              {/* Data Properties Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight mb-4">
                    Environmental Compliance Certification
                  </h3>

                  <div className="space-y-2.5 border-b border-slate-100 pb-4 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Beneficiary Origin:</span>
                      <strong className="text-slate-700">{cert.issued_to || 'Verified Global Entity'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Carbon Mass Offset:</span>
                      <strong className="text-emerald-700">{cert.carbon_tons || '0.0'} Metric Tons</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Validation Status:</span>
                      <span className={`font-bold uppercase text-[10px] tracking-wide ${
                        String(cert.verification_status).includes('Verified') || String(cert.verification_status).includes('Settled')
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}>
                        ● {cert.verification_status || 'Pending Sync'}
                      </span>
                    </div>
                  </div>

                  {/* Blockchain Signature Box */}
                  {cert.stellar_tx_hash && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] mb-6">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Stellar Network Ledger Anchor</span>
                      <code className="font-mono text-slate-700 block break-all select-all bg-white p-1.5 border border-slate-200 rounded">
                        {cert.stellar_tx_hash}
                      </code>
                      
                      {cert.stellar_ledger_index && (
                        <div className="text-[10px] text-slate-400 font-medium pt-1">
                          Consensus Ledger Block Index: <span className="font-bold text-slate-700">{cert.stellar_ledger_index}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Interaction Handlers */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleVerify(cert)}
                    disabled={verifying[cert.id] || !cert.stellar_tx_hash}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all tracking-wide shadow-xs cursor-pointer ${
                      cert.stellar_tx_hash
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {verifying[cert.id] ? '⏳ Verification in Sync...' : '🔍 Verify On-Chain Signature'}
                  </button>
                  
                  {cert.stellar_tx_hash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${cert.stellar_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex justify-center items-center p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-xl transition-all shadow-xs text-xs font-bold"
                      title="Open Block Explorer"
                    >
                      🌐
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEGAL AUDIT METADATA EXPLANATION BAR */}
      <div className="mt-10 bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl text-white">
        <h3 className="font-bold text-base tracking-tight mb-4 flex items-center gap-2">
          <span>🔐</span> Immutable Ledger Verification Framework
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-400 text-xs leading-relaxed">
          <div className="space-y-1">
            <span className="font-semibold text-slate-200 block text-sm">01 / Hash Anchorages</span>
            <p>Every transaction mint generates an alphanumeric transaction fingerprint mapped permanently across distributed testnet node sets.</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-200 block text-sm">02 / Zero Double-Counting</span>
            <p>Cryptographic balances ensure that single offset carbon asset lines cannot undergo duplicate sales or split equity distributions.</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-200 block text-sm">03 / Direct Node Audits</span>
            <p>Clicking the verification pipeline commands fires low-latency lookups querying independent cryptographic blocks for truth states instantly.</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-200 block text-sm">04 / Absolute Open Source</span>
            <p>Public block explorers act as external consensus judges, making systemic metrics available to inspectors and venture teams alike.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Certificates;