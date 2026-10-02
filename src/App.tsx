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

function App() {
  return <Routes>
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
      <Route path="admin" element={<AdminDashboardPage />} />
      <Route path="admin/events" element={<EventManagementPage />} />
      <Route path="admin/content" element={<ContentManagementPage />} />
      <Route path="admin/applications" element={<ApplicationReviewPage />} />
      <Route path="account" element={<AccountPage />} />
      <Route path="announcements" element={<AnnouncementsPage />} />
      <Route path="news" element={<NewsPage />} />
      <Route path="news/:id" element={<NewsArticlePage />} />
      <Route path="rules" element={<RulesPage />} />
      <Route path="members" element={<MembersPage />} />
      <Route path="members/:discordId" element={<MemberProfilePage />} />
      <Route path="staff" element={<StaffPage />} />
      <Route path="hall-of-fame" element={<HallOfFamePage />} />
      <Route path="*" element={<HomePage />} />
    </Route>
  </Routes>;
}
export default App;
