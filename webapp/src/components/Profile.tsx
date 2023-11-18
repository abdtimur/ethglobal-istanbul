import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { Mentor, TlsnModel } from "../types";
import { IDKitWidget, ISuccessResult } from "@worldcoin/idkit";
import HelloIcon from "../assets/Hello.png";

import anonimousAvatar from "../assets/anon3.png";
import { useSearchParams } from "react-router-dom";
import {
  getMentorsTimeAddr,
  getMentorsTimeForMentor,
  getMindShare,
  getTlsnVerificator,
  getWorldIdVerificator,
} from "../web3/contracts";
import { ethers } from "ethers";
import {
  bytesToHex,
  keccak256,
  stringToBytes,
  toBytes,
  zeroAddress,
} from "viem";

const Profile: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();
  const [profile, setProfile] = useState<Mentor>();
  const [searchParams] = useSearchParams();
  const [worldIdVerification, setWorldIdVerification] = useState(false);
  const [tlsnVerification, setTlsnVerification] = useState(false);
  const [attestationUID, setAttestationUID] = useState<string | null>(null);

  const verificationModal = useRef<HTMLDialogElement>(null);

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
      verificationModal.current?.showModal();
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
          description: "Verify proof World ID",
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 10,
        });
        console.log(receipt);

        console.log("Finished worldID verificatin, Updating backend...");
        const response = await fetch(
          `https://ethg-ist.fly.dev/api/mentors/${address}/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tlsn: profile?.tlsnVerified,
              polygonId: true,
              human: true,
            }),
          }
        );

        if (response.ok) {
          updateProfile("humanVerified", true);
        }
        console.log("World ID Verified!");
      } catch (err: any) {
        console.error(err.reason ?? err.message);
      } finally {
        setWorldIdVerification(false);
        verificationModal.current?.close();
      }
    },
    [
      walletClient,
      publicClient,
      address,
      addRecentTransaction,
      profile?.tlsnVerified,
      updateProfile,
    ]
  );

  const onVerifyTlsn = useCallback(
    async (proof: TlsnModel) => {
      if (!walletClient) {
        return console.error("Connect the wallet first");
      }

      setTlsnVerification(true);
      verificationModal.current?.showModal();

      console.log("Received TLSN proof, pushing to blockchain...");
      try {
        // prepare hash & sign
        const hash = keccak256(
          stringToBytes(JSON.stringify(proof.signed_content))
        );
        const signature = toBytes(`0x${proof.signature}`);

        console.log(`Prepared hash: ${hash} ${signature}`);

        const verificator = await getTlsnVerificator({
          publicClient,
          walletClient,
        });

        console.log(`Prepated verificator: ${verificator.address}`);
        const txHash = await verificator.write.verifyProof([
          true, // isSupporting
          address, // mentor address
          hash,
          bytesToHex(signature),
        ]);
        addRecentTransaction({
          hash: txHash,
          description: "Verify proof TLSN",
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 10,
        });
        console.log(receipt);

        console.log("Finished TLSN verification, Updating backend...");
        const response = await fetch(
          `https://ethg-ist.fly.dev/api/mentors/${address}/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tlsn: true,
              polygonId: true,
              human: profile?.humanVerified,
            }),
          }
        );

        if (response.ok) {
          updateProfile("tlsnVerified", true);
        }
        console.log("TLSN Verified!");
      } catch (err: any) {
        console.error(err.reason ?? err.message);
      } finally {
        setTlsnVerification(false);
        verificationModal.current?.close();
      }
    },
    [
      walletClient,
      publicClient,
      address,
      addRecentTransaction,
      profile?.tlsnVerified,
      updateProfile,
    ]
  );

  const handleSaveButtonClick = async () => {
    const { displayName, profilePhotoUrl } = profile || {};
    console.log("address", address);
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
        body: JSON.stringify({
          displayName,
          profilePhotoUrl,
          human: true,
          polygonId: true,
          tlsn: true,
        }),
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
    if (tlsnVerified && profile && !profile.tlsnVerified) {
      verificationModal.current?.showModal();
      try {
        const parsedTlsn: TlsnModel = JSON.parse(tlsnVerified);

        onVerifyTlsn(parsedTlsn);
      } catch (e) {
        console.log(e);
      }
    }
  }, [walletClient, address, tlsnVerified]);

  useEffect(() => {
    console.log("profile", profile);
    if (
      profile?.humanVerified &&
      profile?.tlsnVerified &&
      address &&
      walletClient &&
      !attestationUID
    ) {
      // TODO: call getAttestationUID on collection to get actual UID
      // if not zero, display as congrats verified mentor
      const checkAttestation = async () => {
        const contract = await getMentorsTimeForMentor({
          publicClient,
          mentor: address,
          walletClient,
        });
        const attestation = await contract.read.getAttestationUID();
        if (attestation !== "0x0") {
          setAttestationUID(String(attestation));
        }
      };

      checkAttestation();
    }
  }, [
    address,
    attestationUID,
    profile,
    profile?.humanVerified,
    profile?.tlsnVerified,
    publicClient,
    walletClient,
  ]);

  return address ? (
    <div className="">
      <dialog className="modal" ref={verificationModal}>
        <div className="modal-box border skeleton">
          <div className="flex flex-col">
            <p>Verification in progress...</p>
          </div>
        </div>
      </dialog>
      {profile ? (
        <>
          <div
            className="flex flex-col mt-4"
            style={{
              backgroundImage: `url(${HelloIcon})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right",
            }}
          >
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
            <h3 className="font-bold text-md">
              Proofs{" "}
              {attestationUID && (
                <>
                  <span className="text-success text-xl">
                    Boom! You are verified mentor!{" "}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      href={`https://sepolia.easscan.org/attestation/view/${attestationUID}`}
                    >
                      Check it out!
                    </a>
                  </span>
                </>
              )}
            </h3>
            {profile.tlsnVerified ? (
              <p className="text-success mt-4">
                🎉 Twitter followers verified 🎉
              </p>
            ) : (
              <a
                href="https://twitter.com/"
                className="btn btn-secondary max-w-xs mt-4"
              >
                Verify Twitter followers{" "}
                {tlsnVerification && "- In progress..."}
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
    <div
      className="mt-4 h-96"
      style={{
        backgroundImage: `url(${HelloIcon})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right",
      }}
    >
      <h3 className="font-bold text-md mb-4">
        Connect your wallet to view your profile
      </h3>
      <ConnectButton />
    </div>
  );
};

export { Profile };
