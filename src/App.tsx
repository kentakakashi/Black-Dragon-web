import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import { HomePage } from "./pages/HomePage";
import { ClanPage } from "./pages/ClanPage";
import { RanksPage } from "./pages/RanksPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { JoinPage } from "./pages/JoinPage";

function App() {
  return <Routes>
    <Route element={<SiteLayout />}>
      <Route index element={<HomePage />} />
      <Route path="clan" element={<ClanPage />} />
      <Route path="ranks" element={<RanksPage />} />
      <Route path="leaderboard" element={<LeaderboardPage />} />
      <Route path="join" element={<JoinPage />} />
      <Route path="*" element={<HomePage />} />
    </Route>
  </Routes>;
}
export default App;
