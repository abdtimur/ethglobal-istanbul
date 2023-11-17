import { NavLink, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { CardsList } from "./components/CardsList";
import { MentorDetails } from "./components/MentorDetails";
import { Profile } from "./components/Profile";

function App() {
  return (
    <>
      <Header />
      <div className="pt-16 px-4">
        <div className="tabs tabs-boxed w-fit">
          <NavLink
            to="/"
            className={({ isActive }) => `tab ${isActive && "tab-active"}`}
          >
            Profile
          </NavLink>
          <NavLink
            to="/mentors"
            className={({ isActive }) => `tab ${isActive && "tab-active"}`}
          >
            Mentors
          </NavLink>
          <NavLink
            to="/booked"
            className={({ isActive }) => `tab ${isActive && "tab-active"}`}
          >
            Booked slots
          </NavLink>
        </div>
        <div className="mt-4">
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/mentors" element={<CardsList />}>
              <Route path=":id" element={<MentorDetails />} />
            </Route>
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
