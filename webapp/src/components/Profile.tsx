import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { Mentor } from "../types";
import { IDKitWidget, ISuccessResult } from "@worldcoin/idkit";

import anonimousAvatar from "../assets/anonymous.jpg";
import { useSearchParams } from "react-router-dom";
import {
  getMentorsTimeAddr,
  getMindShare,
  getWorldIdVerificator,
} from "../web3/contracts";
import { ethers } from "ethers";
import { zeroAddress } from "viem";

const Profile: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();
  const [profile, setProfile] = useState<Mentor>();
  const [searchParams] = useSearchParams();
  const [worldIdVerification, setWorldIdVerification] = useState(false);

  const tlsnModal = useRef<HTMLDialogElement>(null);

  const tlsnVerified = searchParams.get("proof");

  const updateProfile = useCallback(
    (field: string, value: string | boolean) => {
      if (profile) {
        setProfile({ ...profile, [field]: value });
      }
    },
    [profile]
  );

  const onSuccessWorldID = (result: ISuccessResult) => {
    console.log(result);
    onVerifyWorldId(result);
  };

  const onVerifyWorldId = useCallback(
    async (result: ISuccessResult) => {
      console.log(result);

      if (!result || !result.merkle_root || !result.proof) {
        return console.error("Proof generation failed! Please try again.");
      }
      if (!walletClient) {
        return console.error("Connect the wallet first");
      }

      setWorldIdVerification(true);
      try {
        const unpackedProof = ethers.AbiCoder.defaultAbiCoder().decode(
          ["uint256[8]"],
          result.proof
        )[0];

        const verificator = await getWorldIdVerificator({
          publicClient,
          walletClient,
        });
        const txHash = await verificator.write.verifyProof([
          false, // isSupporting
          address, // mentor address
          result.merkle_root,
          result.nullifier_hash,
          unpackedProof,
        ]);
        addRecentTransaction({
          hash: txHash,
          description: "Verify proof",
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 10,
        });
        console.log(receipt);

        const response = await fetch(
          `https://ethg-ist.fly.dev/api/mentors/${address}/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ humanVerified: true }),
          }
        );

        if (response.ok) {
          updateProfile("human", true);
        }
        console.log("World ID Verified!");
      } catch (err: any) {
        console.error(err.reason ?? err.message);
      } finally {
        setWorldIdVerification(false);
      }
    },
    [walletClient, publicClient, address, addRecentTransaction, updateProfile]
  );

  const handleSaveButtonClick = async () => {
    const { displayName, profilePhotoUrl } = profile || {};

    if (address) {
      // check if I see address
      // if not - register.
      const mentorsTimeAddress = await getMentorsTimeAddr({
        publicClient,
        mentor: address,
      });
      if (mentorsTimeAddress === zeroAddress && walletClient) {
        const mindShare = await getMindShare({ publicClient, walletClient });
        const txHash = await mindShare.write.registerMentor([displayName]);
        addRecentTransaction({
          hash: txHash,
          description: "Register mentor",
        });
        await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 10,
        });
        console.log("Register on-chain, tx: ", txHash);
      }
    }

    console.log("Updating backend...");
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
    if (address) {
      const getProfile = async () => {
        const response = await fetch(
          `https://ethg-ist.fly.dev/api/mentors/${address}`
        );

        const responseJson = await response.json();
        setProfile(responseJson);
      };

      getProfile();
    }
  }, [address]);

  useEffect(() => {
    if (tlsnVerified) {
      tlsnModal.current?.showModal();
      try {
        const parsedTlsn = JSON.parse(tlsnVerified);
        parsedTlsn.signed_content.fact = JSON.parse(
          parsedTlsn.signed_content.fact
        );
        console.log(parsedTlsn);
        const verifyTlsn = async () => {
          const response = await fetch(
            `https://ethg-ist.fly.dev/api/mentors/${address}/verify-tlsn`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ tlsnVerified }),
            }
          );
          const responseJson = await response.json();
          setProfile(responseJson);
          tlsnModal.current?.close();
        };

        verifyTlsn();
      } catch (e) {
        console.log(e);
      }
    }
  }, [address, tlsnVerified]);

  return address ? (
    <div className="">
      <dialog className="modal" ref={tlsnModal}>
        <div className="modal-box border skeleton">
          <div className="flex flex-col">
            <p>Verifying twitter followers...</p>
          </div>
        </div>
      </dialog>
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
            {profile.humanVerified ? (
              <p className="text-success mt-4">🎉 World ID verified 🎉</p>
            ) : (
              <IDKitWidget
                app_id="app_staging_28ac83510c968999a3c12326b8d4bfa1" // Replace with your Action ID
                signal={address} // Unique signal for the user, e.g., user ID
                action="proof_humanity"
                onSuccess={onSuccessWorldID}
              >
                {({ open }) => (
                  <button
                    className="btn btn-secondary max-w-xs mt-4"
                    onClick={open}
                    disabled={worldIdVerification}
                  >
                    {!worldIdVerification
                      ? "Verify with WorldID"
                      : "Verification in progress..."}
                  </button>
                )}
              </IDKitWidget>
            )}
          </div>
        </>
      ) : (
        "Loading..."
      )}
    </div>
  ) : (
    <div className="mt-4">
      <h3 className="font-bold text-md mb-4">
        Connect your wallet to view your profile
      </h3>
      <ConnectButton />
    </div>
  );
};

export { Profile };
