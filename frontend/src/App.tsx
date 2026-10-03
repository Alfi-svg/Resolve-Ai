import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import {
  Transaction,
  InvestigationResult,
  SupportCase,
  SystemIncident,
  AnalyticsData,
  SplitPayment,
  ComplaintAnalysis
} from './types';
import { Header } from './components/common/Header';
import { TrustSecurityModal } from './components/common/TrustSecurityModal';
import { DemoGuideModal } from './components/common/DemoGuideModal';
import { LandingIntro } from './components/common/LandingIntro';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { TransactionDetective } from './components/investigation/TransactionDetective';
import { SupportCopilot } from './components/admin/SupportCopilot';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [view, setView] = useState<'dashboard' | 'detective'>('dashboard');
  const [selectedTxId, setSelectedTxId] = useState<string>('TXN-8F31A2');
  const [customerTab, setCustomerTab] = useState<string>('home');
  const [adminTab, setAdminTab] = useState<'queue' | 'incident' | 'analytics' | 'roadmap'>('queue');

  // Modals & Banners
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [presetComplaint, setPresetComplaint] = useState('QR payment korechi, 2000 taka kete geche but merchant pay nai.');

  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [splits, setSplits] = useState<SplitPayment[]>([]);
  const [incident, setIncident] = useState<SystemIncident | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [investigation, setInvestigation] = useState<InvestigationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const [txsData, casesData, splitsData, incData, analData] = await Promise.all([
          api.getTransactions(),
          api.getCases(),
          api.getSplitPayments(),
          api.getIncident(),
          api.getAnalytics()
        ]);

        setTransactions(txsData);
        setCases(casesData);
        setSplits(splitsData);
        setIncident(incData);
        setAnalytics(analData);

        // Preload hero investigation
        const inv = await api.investigateTransaction('TXN-8F31A2');
        setInvestigation(inv);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Complaint analysis handler
  const handleAnalyzeComplaint = async (text: string): Promise<ComplaintAnalysis> => {
    const result = await api.analyzeComplaint(text);
    return result;
  };

  // Investigation open handler
  const handleInvestigateTransaction = async (txId: string) => {
    setSelectedTxId(txId);
    try {
      const inv = await api.investigateTransaction(txId);
      setInvestigation(inv);
      setView('detective');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  // Actions on Cases (Approve, Escalate, Request Info)
  const handleApproveCase = async (caseId: string) => {
    const res = await api.approveCase(caseId);
    // Refresh cases
    const updatedCases = await api.getCases();
    setCases(updatedCases);
    // Refresh transactions
    const updatedTxs = await api.getTransactions();
    setTransactions(updatedTxs);
    // Refresh current investigation if matches
    if (investigation) {
      const inv = await api.investigateTransaction(investigation.transaction.transaction_id);
      setInvestigation(inv);
    }
    showNotification('Resolution Approved: Transaction batch reconciled with merchant.');
  };

  const handleEscalateCase = async (caseId: string) => {
    const res = await api.escalateCase(caseId);
    const updatedCases = await api.getCases();
    setCases(updatedCases);
    showNotification('Case Escalated: Sent to Tier-3 Operations team.');
  };

  const handleRequestCaseInfo = async (caseId: string) => {
    const res = await api.requestCaseInfo(caseId);
    const updatedCases = await api.getCases();
    setCases(updatedCases);
    showNotification('Customer SMS Alert: Receipt copy requested.');
  };

  // Split payment actions
  const handleRemindSplit = async (splitId: string, participant: string) => {
    await api.remindParticipant(splitId, participant);
    showNotification(`Payment reminder SMS sent to ${participant}.`);
  };

  const handleMarkSplitPaid = async (splitId: string, participant: string) => {
    await api.markParticipantPaid(splitId, participant);
    const updatedSplits = await api.getSplitPayments();
    setSplits(updatedSplits);
    showNotification(`${participant}'s payment recorded as Settled.`);
  };

  const handleCreateSplit = async (data: any) => {
    await api.createSplitPayment(data);
    const updatedSplits = await api.getSplitPayments();
    setSplits(updatedSplits);
    showNotification('New Split Bill created successfully.');
  };

  // 15-Step Script Navigation Helper
  const handleJumpToStep = async (stepNum: number) => {
    if (stepNum <= 4) {
      setRole('customer');
      setView('dashboard');
      setCustomerTab('home');
      if (stepNum === 2) {
        setPresetComplaint('QR payment korechi, 2000 taka kete geche but merchant pay nai.');
      }
    } else if (stepNum >= 5 && stepNum <= 10) {
      setRole('customer');
      await handleInvestigateTransaction('TXN-8F31A2');
    } else if (stepNum >= 11 && stepNum <= 13) {
      setRole('admin');
      setAdminTab('queue');
    } else if (stepNum === 14) {
      setRole('admin');
      setAdminTab('incident');
    } else if (stepNum === 15) {
      setRole('customer');
      setView('dashboard');
      setCustomerTab('cases');
    }
  };

  const isHeroResolved = cases.some(
    (c) => c.transaction_id === 'TXN-8F31A2' && c.status === 'Resolved'
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-fintech-lg flex items-center gap-2.5 animate-fadeIn border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Main Global Header */}
      <Header
        currentRole={role}
        onRoleChange={(r) => {
          setRole(r);
          setView('dashboard');
        }}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Short Product Intro Banner (Can be explored or dismissed) */}
        {showIntro && (
          <LandingIntro
            onStartDemo={() => handleJumpToStep(1)}
            onExploreCustomer={() => {
              setRole('customer');
              setView('dashboard');
              setCustomerTab('home');
            }}
            onExploreSupport={() => {
              setRole('admin');
              setAdminTab('queue');
            }}
            onClose={() => setShowIntro(false)}
          />
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={28} className="animate-spin text-emerald-700" />
            <span className="text-xs font-bold text-slate-600">
              Initializing Upay ResolveAI Synthetic Environment...
            </span>
          </div>
        ) : (
          <>
            {/* Customer Role View */}
            {role === 'customer' && (
              <>
                {view === 'dashboard' ? (
                  <CustomerDashboard
                    transactions={transactions}
                    splits={splits}
                    cases={cases}
                    onAnalyzeComplaint={handleAnalyzeComplaint}
                    onInvestigateTransaction={handleInvestigateTransaction}
                    onRemindSplit={handleRemindSplit}
                    onMarkSplitPaid={handleMarkSplitPaid}
                    onCreateSplit={handleCreateSplit}
                    presetComplaint={presetComplaint}
                    activeCustomerTab={customerTab}
                    onTabChange={setCustomerTab}
                  />
                ) : (
                  investigation && (
                    <TransactionDetective
                      investigation={investigation}
                      onBack={() => setView('dashboard')}
                      onApprove={() => handleApproveCase('CASE-1024')}
                      onEscalate={() => handleEscalateCase('CASE-1024')}
                      onRequestInfo={() => handleRequestCaseInfo('CASE-1024')}
                      isResolved={isHeroResolved}
                    />
                  )
                )}
              </>
            )}

            {/* Support Agent Role View */}
            {role === 'admin' && (
              <>
                {view === 'detective' && investigation ? (
                  <TransactionDetective
                    investigation={investigation}
                    onBack={() => setView('dashboard')}
                    onApprove={() => handleApproveCase('CASE-1024')}
                    onEscalate={() => handleEscalateCase('CASE-1024')}
                    onRequestInfo={() => handleRequestCaseInfo('CASE-1024')}
                    isResolved={isHeroResolved}
                  />
                ) : (
                  incident &&
                  analytics && (
                    <SupportCopilot
                      cases={cases}
                      incident={incident}
                      analytics={analytics}
                      onOpenInvestigation={handleInvestigateTransaction}
                      onApproveCase={handleApproveCase}
                      onEscalateCase={handleEscalateCase}
                      onRequestCaseInfo={handleRequestCaseInfo}
                      activeSubTab={adminTab}
                      onSubTabChange={setAdminTab}
                    />
                  )
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer with Upay Disclaimer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-800">UPAY RESOLVEAI</span>
            <span>•</span>
            <span className="text-slate-400">Hackathon Prototype & Concept MVP</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Synthetic dataset for demonstration only. Not connected to real Upay banking systems.
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button onClick={() => setIsSecurityOpen(true)} className="hover:text-emerald-700">
              Trust & Security
            </button>
            <button onClick={() => setIsDemoGuideOpen(true)} className="hover:text-emerald-700">
              Demo Script
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TrustSecurityModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onJumpToStep={handleJumpToStep}
      />
    </div>
  );
}

export default App;
