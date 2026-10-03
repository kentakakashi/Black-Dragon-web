import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import { HomePage } from "./pages/HomePage";
import { ClanPage } from "./pages/ClanPage";
import { RanksPage } from "./pages/RanksPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { JoinPage } from "./pages/JoinPage";
import { AnnouncementsPage, NewsPage, RulesPage, MembersPage, StaffPage, HallOfFamePage } from "./pages/PublicPages";
import { AccountPage } from "./pages/AccountPage";
import { MemberProfilePage } from "./pages/MemberProfilePage";
import { ApplicationsPage, ApplicationReviewPage } from "./pages/ApplicationsPage";
import { TryoutsPage } from "./pages/TryoutsPage";
import { EventsPage, EventManagementPage } from "./pages/EventsPage";
import { ContentManagementPage } from "./pages/ContentManagementPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { NewsArticlePage } from "./pages/NewsArticlePage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AnnouncementManagementPage } from "./pages/AnnouncementManagementPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { StaffRolesPage } from "./pages/StaffRolesPage";
import { MemberApplicationsPage } from "./pages/MemberApplicationsPage";
import { AlliedClansPage } from "./pages/AlliedClansPage";
import { StaffRoute } from "./components/StaffRoute";
import { LoginRoute } from "./components/LoginRoute";
import { EntryGate } from "./components/EntryGate";

function App() {
  return <EntryGate><Routes>
    <Route element={<SiteLayout />}>
      <Route index element={<HomePage />} />
      <Route path="clan" element={<ClanPage />} />
      <Route path="ranks" element={<RanksPage />} />
      <Route path="leaderboard" element={<LeaderboardPage />} />
      <Route path="statistics" element={<StatisticsPage />} />
      <Route path="join" element={<JoinPage />} />
      <Route path="applications" element={<ApplicationsPage />} />
      <Route path="tryouts" element={<TryoutsPage />} />
      <Route path="events" element={<EventsPage />} />
      <Route path="admin" element={<StaffRoute><AdminDashboardPage /></StaffRoute>} />
      <Route path="admin/audit" element={<StaffRoute><AuditLogPage /></StaffRoute>} />
      <Route path="admin/roles" element={<StaffRoute><StaffRolesPage /></StaffRoute>} />
      <Route path="admin/announcements" element={<StaffRoute><AnnouncementManagementPage /></StaffRoute>} />
      <Route path="admin/events" element={<StaffRoute><EventManagementPage /></StaffRoute>} />
      <Route path="admin/content" element={<StaffRoute><ContentManagementPage /></StaffRoute>} />
      <Route path="admin/applications" element={<StaffRoute><ApplicationReviewPage /></StaffRoute>} />
      <Route path="admin/member-applications" element={<StaffRoute><MemberApplicationsPage /></StaffRoute>} />
      <Route path="account" element={<AccountPage />} />
      <Route path="announcements" element={<AnnouncementsPage />} />
      <Route path="news" element={<NewsPage />} />
      <Route path="news/:id" element={<NewsArticlePage />} />
      <Route path="rules" element={<RulesPage />} />
      <Route path="members" element={<MembersPage />} />
      <Route path="members/:discordId" element={<LoginRoute><MemberProfilePage /></LoginRoute>} />
      <Route path="staff" element={<StaffPage />} />
      <Route path="allies" element={<AlliedClansPage />} />
      <Route path="hall-of-fame" element={<HallOfFamePage />} />
      <Route path="*" element={<HomePage />} />
    </Route>
  </Routes></EntryGate>;
}
export default App;