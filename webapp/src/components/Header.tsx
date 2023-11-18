import { ConnectButton } from "@rainbow-me/rainbowkit";
import Logo from "../assets/logo.jpg";

const Header: React.FC = () => (
  <>
    <header className="navbar fixed z-10 bg-base-100 border-bottom px-4 py-2">
      <div className="avatar">
        <div className="w-8 rounded-full mr-2">
          <img src={Logo} />
        </div>
      </div>
      <h2 className="text-2xl font-bold flex-1 text-white">MindShare</h2>
      <ConnectButton />
    </header>
  </>
);

export { Header };
