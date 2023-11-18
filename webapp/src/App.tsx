import { NavLink, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { CardsList } from "./components/CardsList";
import { MentorDetails } from "./components/MentorDetails";
import { Profile } from "./components/Profile";
import { useAccount } from "wagmi";
import { useEffect } from "react";

function App() {
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      const createProfile = async () => {
        try {
          await fetch("https://ethg-ist.fly.dev/api/mentors/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ account: address }),
          });
        } catch (e) {
          console.log(e);
        }
      };

      createProfile();
    }
  }, [address]);

  return (
    <>
      <Header />
      <div className="pt-16 px-4">
        <div className="tabs tabs-boxed w-fit">
          <NavLink
            to="/"
            className={({ isActive }) => `tab w-36 ${isActive && "tab-active"}`}
          >
            Profile
          </NavLink>
          <NavLink
            to="/mentors"
            className={({ isActive }) => `tab w-36 ${isActive && "tab-active"}`}
          >
            Mentors
          </NavLink>
          <NavLink
            to="/booked"
            className={({ isActive }) => `tab w-36 ${isActive && "tab-active"}`}
          >
            Booked slots
          </NavLink>
        </div>
        <div className="mt-4">
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/mentors" element={<CardsList />}>
              <Route path=":mentorId" element={<MentorDetails />} />
            </Route>
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
