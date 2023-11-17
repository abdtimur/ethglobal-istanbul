import { ConnectButton } from "@rainbow-me/rainbowkit";
import Logo from "../assets/logo.jpg";

const Header: React.FC = () => (
  <header className="navbar border-bottom px-4 py-2">
    <div className="avatar">
      <div className="w-8 rounded-full mr-2">
        <img src={Logo} />
      </div>
    </div>
    <h2 className="text-2xl font-bold flex-1">Header</h2>
    <ConnectButton />
  </header>
);

export { Header };
