import { NavLink, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { CardsList } from "./components/CardsList";
import { MentorDetails } from "./components/MentorDetails";
import { Profile } from "./components/Profile";
import { useAccount, useWalletClient } from "wagmi";
import { useEffect } from "react";
import { BookedList } from "./components/BookedList";
import { WC_PROJECT_ID } from "./web3configs";
import { NotifyClient } from "@walletconnect/notify-client";

function App() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
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

  useEffect(() => {
    if (address && walletClient) {
      const register = async () => {
        const notifyClient = await NotifyClient.init({
          projectId: WC_PROJECT_ID,
        });

        await notifyClient.register({
          account: `eip155:1:${address}`,
          onSign: (message) => walletClient.signMessage({ message }),
          domain: "ethg-ist.fly.dev",
          isLimited: true,
        });

        console.log(notifyClient);

        const a = await notifyClient.subscribe({
          account: `eip155:1:${address}`,
          appDomain: "ethg-ist.fly.dev",
        });

        console.log("hey");

        console.log("hoy");
        console.log(a);
        notifyClient.on("notify_message", (message) => {
          console.log(message);
        });
      };
      register();
      // const initNotifyClient = async () => {
      //   await notifyClient.register({
      //     account: `eip155:1:${address}`,
      //     onSign: (message) => walletClient.signMessage({ message }),
      //     domain: "ethg-ist.fly.dev",
      //     isLimited: true,
      //   });
      // notifyClient.on("slot_booked", (message) => {
      //   console.log("Slot booked message received:", message);
      // });
      // };

      // initNotifyClient();
    }
  }, [address, walletClient]);

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
            <Route path="/booked" element={<BookedList />} />
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
