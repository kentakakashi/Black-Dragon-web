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

function App() {
  return <Routes>
    <Route element={<SiteLayout />}>
      <Route index element={<HomePage />} />
      <Route path="clan" element={<ClanPage />} />
      <Route path="ranks" element={<RanksPage />} />
      <Route path="leaderboard" element={<LeaderboardPage />} />
      <Route path="join" element={<JoinPage />} />
      <Route path="applications" element={<ApplicationsPage />} />
      <Route path="tryouts" element={<TryoutsPage />} />
      <Route path="admin/applications" element={<ApplicationReviewPage />} />
      <Route path="account" element={<AccountPage />} />
      <Route path="announcements" element={<AnnouncementsPage />} />
      <Route path="news" element={<NewsPage />} />
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
