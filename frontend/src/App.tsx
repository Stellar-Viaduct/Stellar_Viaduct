import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { LoadingFallback } from "./components/LoadingFallback";
import { GlobalErrorBoundary } from "./components/ErrorBoundary";
import { NotificationProvider } from "./context/NotificationContext";
import { useNotifications } from "./hooks/useNotifications";
import { ProtectedRoute } from "./lib/auth";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AssetDetail = lazy(() => import("./pages/AssetDetail"));
const Bridges = lazy(() => import("./pages/Bridges"));
const Incidents = lazy(() => import("./pages/Incidents"));
const IncidentReplay = lazy(() => import("./pages/IncidentReplay"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CustomMetricBuilder = lazy(() => import("./pages/CustomMetricBuilder"));
const Reports = lazy(() => import("./pages/Reports"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));
const WatchlistPage = lazy(() => import("./pages/Watchlist"));
const WatchlistsPage = lazy(() => import("./pages/Watchlists"));
const Transactions = lazy(() => import("./pages/Transactions"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const AlertRoutingAdmin = lazy(() => import("./pages/AlertRoutingAdmin"));
const SupplyChain = lazy(() => import("./pages/SupplyChain"));
const BridgeTopologyExplorer = lazy(() => import("./pages/BridgeTopologyExplorer"));
const Reconciliation = lazy(() => import("./pages/Reconciliation"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const Help = lazy(() => import("./pages/Help"));
const ReleaseNotes = lazy(() => import("./pages/ReleaseNotes"));
const NotificationPreferencesPage = lazy(() => import("./pages/NotificationPreferencesPage"));
const RelationshipExplorer = lazy(() => import("./pages/RelationshipExplorer"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const Alerts = lazy(() => import("./pages/Alerts"));
const AlertPlaybookViewer = lazy(() => import("./pages/AlertPlaybookViewer"));
const DataProvenanceGraph = lazy(() => import("./pages/DataProvenanceGraph"));
const AlertSimulationSandbox = lazy(() => import("./pages/AlertSimulationSandbox"));
const LiquidityFragmentation = lazy(() => import("./pages/LiquidityFragmentation"));
const LiquidityDashboard = lazy(() => import("./pages/LiquidityDashboard"));
const SchemaDriftMonitor = lazy(() => import("./pages/SchemaDriftMonitor"));
const OperationalAccessAudit = lazy(() => import("./pages/OperationalAccessAudit"));
const BridgeHealthTimeline = lazy(() => import("./pages/BridgeHealthTimeline"));
const ExportScheduler = lazy(() => import("./pages/ExportScheduler"));
const AssetComparison = lazy(() => import("./pages/AssetComparison"));
const MetricsSidebarPage = lazy(() => import("./pages/MetricsSidebar"));
const CrossChainVerification = lazy(() => import("./pages/CrossChainVerification"));
const FreshnessMonitoring = lazy(() => import("./pages/FreshnessMonitoring"));
const ServiceAnnotations = lazy(() => import("./pages/ServiceAnnotations"));

function NotificationInitializer() {
  useNotifications();
  return null;
}

function App() {
  return (
    <GlobalErrorBoundary>
      <NotificationProvider>
        <NotificationInitializer />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            <Route element={<Layout />}>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/assets/:symbol" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
              <Route path="/bridges" element={<ProtectedRoute><Bridges /></ProtectedRoute>} />
              <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
              <Route path="/incidents/replay/:id" element={<ProtectedRoute><IncidentReplay /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
              <Route path="/alert-playbooks" element={<ProtectedRoute><AlertPlaybookViewer /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/analytics/metric-builder" element={<ProtectedRoute><CustomMetricBuilder /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
              <Route path="/watchlists" element={<ProtectedRoute><WatchlistsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/admin/api-keys" element={<ProtectedRoute requiredRoles={["Admin", "SuperAdmin"]}><ApiKeys /></ProtectedRoute>} />
              <Route path="/admin/alert-routing" element={<ProtectedRoute requiredRoles={["Admin", "SuperAdmin"]}><AlertRoutingAdmin /></ProtectedRoute>} />
              <Route path="/admin/access-audit" element={<ProtectedRoute requiredRoles={["Admin", "SuperAdmin", "Lead Auditor"]}><OperationalAccessAudit /></ProtectedRoute>} />
              <Route path="/supply-chain" element={<ProtectedRoute><SupplyChain /></ProtectedRoute>} />
              <Route path="/bridge-topology" element={<ProtectedRoute><BridgeTopologyExplorer /></ProtectedRoute>} />
              <Route path="/reconciliation" element={<ProtectedRoute><Reconciliation /></ProtectedRoute>} />
              <Route path="/api-docs" element={<ProtectedRoute><ApiDocs /></ProtectedRoute>} />
              <Route path="/help" element={<Help />} />
              <Route path="/release-notes" element={<ProtectedRoute><ReleaseNotes /></ProtectedRoute>} />
              <Route path="/notification-preferences" element={<ProtectedRoute><NotificationPreferencesPage /></ProtectedRoute>} />
              <Route path="/relationship-explorer" element={<ProtectedRoute><RelationshipExplorer /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />
              <Route path="/data-provenance" element={<ProtectedRoute><DataProvenanceGraph /></ProtectedRoute>} />
              <Route path="/alert-sandbox" element={<ProtectedRoute><AlertSimulationSandbox /></ProtectedRoute>} />
              <Route path="/liquidity-fragmentation" element={<ProtectedRoute><LiquidityFragmentation /></ProtectedRoute>} />
              <Route path="/liquidity-dashboard" element={<ProtectedRoute><LiquidityDashboard /></ProtectedRoute>} />
              <Route path="/schema-drift" element={<ProtectedRoute><SchemaDriftMonitor /></ProtectedRoute>} />
              <Route path="/bridge-health-timeline" element={<ProtectedRoute><BridgeHealthTimeline /></ProtectedRoute>} />
              <Route path="/export-scheduler" element={<ProtectedRoute><ExportScheduler /></ProtectedRoute>} />
              <Route path="/asset-comparison" element={<ProtectedRoute><AssetComparison /></ProtectedRoute>} />
              <Route path="/metrics-sidebar" element={<ProtectedRoute><MetricsSidebarPage /></ProtectedRoute>} />
              <Route path="/cross-chain-verification" element={<ProtectedRoute><CrossChainVerification /></ProtectedRoute>} />
              <Route path="/freshness" element={<ProtectedRoute><FreshnessMonitoring /></ProtectedRoute>} />
              <Route path="/service-annotations" element={<ProtectedRoute><ServiceAnnotations /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </NotificationProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
