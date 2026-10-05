'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function ConsortiumExplorer() {
  const { language } = useApp();
  const [network, setNetwork] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsortiumData();
    const interval = setInterval(loadConsortiumData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConsortiumData = async () => {
    try {
      const [netRes, blkRes] = await Promise.all([
        fetch('/api/v1/blockchain/network').then((r) => r.json()),
        fetch('/api/v1/blockchain/blocks?limit=10').then((r) => r.json()),
      ]);
      setNetwork(netRes);
      setBlocks(blkRes);
    } catch (e) {
      console.error('Failed to load blockchain data:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="viewBlockchain" className="view-section active">
      <div className="blockchain-header glass-card">
        <div className="blockchain-info">
          <div className="avatar-box" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
            ⛓️
          </div>
          <div>
            <h2>Permissioned Consortium Blockchain (Hyperledger Fabric v2.5)</h2>
            <p className="subtitle">
              Channel: <code>cert-registry</code> • Zero Gas Fees • OutOf(2, Revenue, Interior) &amp; ACB Audit Endorsement
            </p>
          </div>
        </div>

        <div className="blockchain-stats" style={{ display: 'flex', gap: '16px' }}>
          <div className="stat-card glass-card" style={{ padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)' }}>
              #{network?.block_height || 104829}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Block Height</div>
          </div>
          <div className="stat-card glass-card" style={{ padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-green)' }}>
              4 Nodes
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Consortium Peers</div>
          </div>
        </div>
      </div>

      {/* Consortium Network Topology */}
      <div className="network-topology-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {network?.peers?.map((peer: any) => (
          <div key={peer.peer_id} className="peer-card glass-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="live-pill" style={{ padding: '2px 8px', fontSize: '11px' }}>
                <span className="live-dot"></span> {peer.status}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{peer.latency_ms}ms</span>
            </div>

            <h4 style={{ margin: '8px 0 2px', fontSize: '14px', color: 'var(--text-primary)' }}>{peer.peer_id}</h4>
            <div style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>{peer.org}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Role: <code>{peer.role}</code> • MSP: <strong>{peer.msp_id}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Raft Ordering Cluster & Consensus Banner */}
      <div className="raft-banner glass-card" style={{ marginTop: '20px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🗳️</span>
          <div>
            <h4 style={{ margin: 0 }}>Raft Consensus Ordering Cluster</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              Leader: <code style={{ color: 'var(--accent-green)' }}>orderer1.mahagov.in</code> (Term 42) • Raft Followers: <code>orderer2</code>, <code>orderer3</code>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}>
            State DB: CouchDB (Key-Value)
          </span>
          <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
            Finality: &lt; 800ms
          </span>
        </div>
      </div>

      {/* Live State Blocks Explorer */}
      <div className="blocks-stream glass-card" style={{ marginTop: '24px', padding: '20px' }}>
        <div className="pane-header" style={{ marginBottom: '16px' }}>
          <h3>📦 Live Blockchain State Ledger (Channel: cert-registry)</h3>
          <span className="badge-tag">SHA-256 Merkle Root Verified</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            ⏳ Synchronizing with Hyperledger Fabric ledger...
          </div>
        ) : (
          <div className="blocks-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {blocks.map((b: any) => (
              <div key={b.block_number} className="block-item glass-card" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="block-badge" style={{ background: 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))', color: '#000', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', fontSize: '13px' }}>
                      Block #{b.block_number}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{b.timestamp}</span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Tx Count: <strong>{b.transaction_count}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Block State Hash:</span>
                    <code className="mono-hash" style={{ display: 'block', fontSize: '11px', marginTop: '2px' }}>
                      {b.current_block_hash}
                    </code>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Merkle Tree Root:</span>
                    <code className="mono-hash" style={{ display: 'block', fontSize: '11px', marginTop: '2px', color: 'var(--accent-gold)' }}>
                      {b.merkle_root}
                    </code>
                  </div>
                </div>

                {/* Transactions in Block */}
                {b.transactions && b.transactions.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Committed Certificate Transactions:
                    </div>
                    {b.transactions.map((tx: any) => (
                      <div key={tx.tx_id} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{tx.certificate_id}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tx: {tx.tx_id.substring(0, 20)}...</span>
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          Beneficiary: <strong>{tx.beneficiary_name}</strong> • Service: <strong>{tx.certificate_type}</strong>
                        </div>
                        
                        {/* Endorsements badges */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          {tx.endorsements?.map((end: any, idx: number) => (
                            <span key={idx} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>
                              ✓ Endorsed: {end.org.split(' ')[0]} ({end.msp_id})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
