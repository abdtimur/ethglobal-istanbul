import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { Mentor } from "../types";

import anonimousAvatar from "../assets/anonymous.jpg";

const Profile: React.FC = () => {
  const { address } = useAccount();
  const [profile, setProfile] = useState<Mentor>();

  const updateProfile = (field: string, value: string | boolean) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleSaveButtonClick = async () => {
    const { displayName, profilePhotoUrl } = profile || {};
    const response = await fetch(
      `https://ethg-ist.fly.dev/api/mentors/${address}/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName, profilePhotoUrl }),
      }
    );
    if (response.ok) {
      console.log("success");
    }
  };

  useEffect(() => {
    const getProfile = async () => {
      const response = await fetch(
        `https://ethg-ist.fly.dev/api/mentors/${address}`
      );

      const responseJson = await response.json();
      setProfile(responseJson);
    };

    getProfile();
  }, [address]);

  return address ? (
    <div className="">
      {profile ? (
        <>
          <div className="flex flex-col mt-4">
            <h3 className="font-bold text-md">Main information</h3>
            <div className="avatar">
              <div className="w-32 rounded-xl mt-2">
                <img src={profile.profilePhotoUrl || anonimousAvatar} />
              </div>
            </div>
            <input
              type="text"
              placeholder="Avatar URL"
              className="input input-bordered input-primary w-full max-w-xs mt-4"
              value={profile.profilePhotoUrl || ""}
              onChange={(e) => updateProfile("profilePhotoUrl", e.target.value)}
            />
            <input
              type="text"
              placeholder="Name"
              className="input input-bordered input-primary w-full max-w-xs mt-4"
              value={profile.displayName || ""}
              onChange={(e) => updateProfile("displayName", e.target.value)}
            />
            <button
              onClick={handleSaveButtonClick}
              className="btn btn-primary mt-4 btn-md max-w-xs"
            >
              Save
            </button>
          </div>
          <div className="flex flex-col mt-8">
            <h3 className="font-bold text-md">Proofs</h3>
            {profile.tlsnVerified ? (
              <p className="text-success mt-4">
                🎉 Twitter followers verified 🎉
              </p>
            ) : (
              <a
                href="https://twitter.com/"
                className="btn btn-secondary max-w-xs mt-4"
              >
                Verify Twitter followers
              </a>
            )}

            <button className="btn btn-secondary max-w-xs mt-4">
              WorldID!
            </button>
          </div>
        </>
      ) : (
        "Loading..."
      )}
    </div>
  ) : (
    <div className="flex justify-center align-center h-screen">
      <ConnectButton />
    </div>
  );
};

export { Profile };
