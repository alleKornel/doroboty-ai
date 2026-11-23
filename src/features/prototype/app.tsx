import { lazy } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router";
import { PrototypeProvider } from "./store";
import { Shell, NotFound } from "./shell";
import HomePage from "./home";
import MethodologyPage from "./methodology";
import { PersonPicker, RequireRole } from "./workspace-access";
import { AnalyticsPageviews } from "@/features/analytics/pageviews";

const JobsPage = lazy(() =>
  import("./marketplace").then((screen) => ({ default: screen.JobsPage })),
);
const JobPage = lazy(() => import("./marketplace").then((screen) => ({ default: screen.JobPage })));
const CompanyPage = lazy(() =>
  import("./marketplace").then((screen) => ({ default: screen.CompanyPage })),
);
const WorkspaceHome = lazy(() =>
  import("./workspace").then((screen) => ({ default: screen.WorkspaceHome })),
);
const ProfilePage = lazy(() =>
  import("./workspace").then((screen) => ({ default: screen.ProfilePage })),
);
const SavedPage = lazy(() =>
  import("./workspace").then((screen) => ({ default: screen.SavedPage })),
);
const ApplyPage = lazy(() =>
  import("./workspace").then((screen) => ({ default: screen.ApplyPage })),
);
const ApplicationsPage = lazy(() =>
  import("./workspace").then((screen) => ({ default: screen.ApplicationsPage })),
);
const ApplicationDetail = lazy(() =>
  import("./workspace").then((screen) => ({ default: screen.ApplicationDetail })),
);
const EmployerJobs = lazy(() =>
  import("./employer").then((screen) => ({ default: screen.EmployerJobs })),
);
const EmployerJobEditor = lazy(() =>
  import("./employer").then((screen) => ({ default: screen.EmployerJobEditor })),
);
const CompanyEditor = lazy(() =>
  import("./employer").then((screen) => ({ default: screen.CompanyEditor })),
);
const SettingsPage = lazy(() =>
  import("./settings").then((screen) => ({ default: screen.SettingsPage })),
);
const PrivacyPage = lazy(() =>
  import("./settings").then((screen) => ({ default: screen.PrivacyPage })),
);
const CasePage = lazy(() => import("./case").then((screen) => ({ default: screen.CasePage })));
const ContributionEditor = lazy(() =>
  import("./study").then((screen) => ({ default: screen.ContributionEditor })),
);
const ShortlistStudy = lazy(() =>
  import("./study").then((screen) => ({ default: screen.ShortlistStudy })),
);

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<HomePage />} />
        <Route path="oferty" element={<JobsPage />} />
        <Route path="oferty/:slug" element={<JobPage />} />
        <Route path="firmy/:slug" element={<CompanyPage />} />
        <Route path="metodologia" element={<MethodologyPage />} />
        <Route path="polityka-prywatnosci" element={<PrivacyPage />} />
        <Route path="auth/:mode" element={<PersonPicker />} />
        <Route
          path="aplikuj/:slug"
          element={
            <RequireRole role="candidate">
              <ApplyPage />
            </RequireRole>
          }
        />
        <Route
          path="app"
          element={
            <RequireRole>
              <WorkspaceHome />
            </RequireRole>
          }
        />
        <Route path="app/onboarding" element={<Navigate to="/app/profil" replace />} />
        <Route
          path="app/profil"
          element={
            <RequireRole role="candidate">
              <ProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="app/profil/podglad"
          element={
            <RequireRole role="candidate">
              <ProfilePage preview />
            </RequireRole>
          }
        />
        <Route
          path="app/karta-projektu"
          element={
            <RequireRole role="candidate">
              <ContributionEditor />
            </RequireRole>
          }
        />
        <Route
          path="app/zapisane"
          element={
            <RequireRole role="candidate">
              <SavedPage />
            </RequireRole>
          }
        />
        <Route
          path="app/aplikacje"
          element={
            <RequireRole role="candidate">
              <ApplicationsPage />
            </RequireRole>
          }
        />
        <Route
          path="app/aplikacje/:id"
          element={
            <RequireRole role="candidate">
              <ApplicationDetail />
            </RequireRole>
          }
        />
        <Route
          path="app/aplikacje/:id/wyslano"
          element={
            <RequireRole role="candidate">
              <ApplicationDetail />
            </RequireRole>
          }
        />
        <Route
          path="app/oferty"
          element={
            <RequireRole role="employer">
              <EmployerJobs />
            </RequireRole>
          }
        />
        <Route
          path="app/oferty/:id"
          element={
            <RequireRole role="employer">
              <EmployerJobEditor />
            </RequireRole>
          }
        />
        <Route
          path="app/organizacja"
          element={
            <RequireRole role="employer">
              <CompanyEditor />
            </RequireRole>
          }
        />
        <Route
          path="app/kandydaci"
          element={
            <RequireRole role="employer">
              <ApplicationsPage employer />
            </RequireRole>
          }
        />
        <Route
          path="app/shortlista"
          element={
            <RequireRole role="employer">
              <ShortlistStudy />
            </RequireRole>
          }
        />
        <Route
          path="app/kandydaci/:id"
          element={
            <RequireRole role="employer">
              <ApplicationDetail employer />
            </RequireRole>
          }
        />
        <Route
          path="app/case"
          element={
            <RequireRole role="operator">
              <CasePage />
            </RequireRole>
          }
        />
        <Route path="app/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
export function App() {
  return (
    <PrototypeProvider>
      <HashRouter>
        <AnalyticsPageviews />
        <AppRoutes />
      </HashRouter>
    </PrototypeProvider>
  );
}
