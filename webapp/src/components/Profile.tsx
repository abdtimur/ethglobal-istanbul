import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount } from "wagmi";

const Profile: React.FC = () => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const { address } = useAccount();

  return address ? (
    <div className="">
      <div className="flex flex-col mt-4">
        <h3 className="font-bold text-md">Main information</h3>
        <input
          type="text"
          placeholder="Name"
          className="input input-bordered input-primary w-full max-w-xs mt-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Job title"
          className="input input-bordered input-primary w-full max-w-xs mt-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="btn btn-primary mt-4 btn-md max-w-xs">Save</button>
      </div>
      <div className="flex flex-col mt-8">
        <h3 className="font-bold text-md">Proofs</h3>
        <button className="btn btn-secondary max-w-xs mt-4">
          Verify Twitter followers
        </button>
        <button className="btn btn-secondary max-w-xs mt-4">WorldID!</button>
      </div>
    </div>
  ) : (
    <div className="flex justify-center align-center h-screen">
      <ConnectButton />
    </div>
  );
};

export { Profile };
