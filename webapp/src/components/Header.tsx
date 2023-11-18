import { ConnectButton } from "@rainbow-me/rainbowkit";
import Logo from "../assets/MindShare.png";

const Header: React.FC = () => (
  <>
    <header className="navbar fixed z-10 bg-base-100 border-bottom px-4 py-0">
      <img className="w-36 rounded-2xl mr-2" src={Logo} />
      <h2 className="text-2xl font-bold flex-1 text-white">MindShare</h2>
      <ConnectButton />
    </header>
  </>
);

export { Header };
