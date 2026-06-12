import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/api/certificates');
      setCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (cert) => {
    if (!cert.stellar_tx_hash) {
      alert('No transaction hash available for verification');
      return;
    }

    setVerifying({ ...verifying, [cert.id]: true });
    
    try {
      const response = await axios.get(`/api/certificates/verify/${cert.stellar_tx_hash}`);
      
      if (response.data.verified) {
        alert(`✅ Certificate Verified!\n\nLedger Block: ${response.data.ledger_block}\n\nThis certificate is authentically recorded on the Stellar blockchain.`);
      } else {
        alert('⚠️ Verification failed. Certificate not found on blockchain.');
      }
    } catch (error) {
      alert('⚠️ Could not verify certificate. The transaction may not exist or the network is unavailable.');
      console.error('Verification error:', error);
    } finally {
      setVerifying({ ...verifying, [cert.id]: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-linear-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-8 border border-green-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">📄 Escrow Certificates</h1>
            <p className="text-slate-600">
              Cryptographically verified carbon offset and eco-asset certificates recorded on the Stellar blockchain
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="text-center">
              <p className="text-sm text-slate-500 font-semibold">Total Certificates</p>
              <p className="text-3xl font-bold text-green-600">{certificates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Certificates Found</h3>
          <p className="text-slate-500">
            Certificates will appear here once products are minted on the blockchain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Certificate Header */}
              <div className="bg-linear-to-r from-green-500 to-blue-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded">
                    {cert.certificate_id}
                  </span>
                  <span className="text-xl">🏆</span>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-800 mb-3">
                  Carbon Certificate
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Issued To:</span>
                    <span className="font-semibold text-slate-700">{cert.issued_to}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Carbon Tons:</span>
                    <span className="font-semibold text-green-600">{cert.carbon_tons} tons</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status:</span>
                    <span className={`font-semibold ${
                      cert.verification_status.includes('Verified') || cert.verification_status.includes('Settled')
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}>
                      {cert.verification_status}
                    </span>
                  </div>
                </div>

                {/* Blockchain Info */}
                {cert.stellar_tx_hash && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Blockchain Transaction</p>
                    <p className="text-xs font-mono text-slate-700 break-all mb-2">
                      {cert.stellar_tx_hash}
                    </p>
                    
                    {cert.stellar_ledger_index && (
                      <p className="text-xs text-slate-500">
                        Ledger: <span className="font-semibold text-slate-700">{cert.stellar_ledger_index}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleVerify(cert)}
                    disabled={verifying[cert.id] || !cert.stellar_tx_hash}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                      cert.stellar_tx_hash
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {verifying[cert.id] ? '⏳ Verifying...' : '🔍 Verify On-Chain'}
                  </button>
                  
                  {cert.stellar_tx_hash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${cert.stellar_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm"
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

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
          <span>🔐</span>
          <span>Certificate Verification System</span>
        </h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>All certificates are cryptographically anchored to the Stellar blockchain</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Click "Verify On-Chain" to confirm authenticity directly from the blockchain</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Transaction hashes provide immutable proof of carbon offset contributions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Public ledger ensures transparency and prevents double-counting</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Certificates;
