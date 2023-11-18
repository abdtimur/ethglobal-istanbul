import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Mentor } from "../types";

import anonimousAvatar from "../assets/anonymous.jpg";
import { getMentorsTimeForMentor } from "../web3/contracts";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";

const MentorDetails: React.FC = () => {
  const publicClient = usePublicClient();
  const addRecentTransaction = useAddRecentTransaction();
  const { data: walletClient } = useWalletClient();
  const modal = useRef<HTMLDialogElement>(null);
  const { mentorId } = useParams<{ mentorId: `0x${string}` }>();
  const { address } = useAccount();

  const [success, setSuccess] = useState(false);

  const [details, setDetails] = useState<Mentor>();

  useEffect(() => {
    if (modal.current) {
      modal.current.showModal();
    }
  }, [modal]);

  const handleBookClick = async (id: string, price: string) => {
    if (!mentorId || !walletClient) return;
    const contract = await getMentorsTimeForMentor({
      publicClient,
      mentor: mentorId,
      walletClient,
    });
    try {
      const txHash = await contract.write.bookSlot([id, "json"], {
        value: price,
      });
      addRecentTransaction({ hash: txHash, description: "Book slot" });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      fetch(`https://ethg-ist.fly.dev/api/timeslots/${id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txHash, txValue: price, account: address }),
      });
      console.log(receipt);
      setSuccess(true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!mentorId) return;
    const getDetails = async () => {
      const response = await fetch(
        `https://ethg-ist.fly.dev/api/mentors/${mentorId}`
      );
      const responseJson = await response.json();
      setDetails(responseJson);
    };

    getDetails();
  }, [mentorId]);

  return (
    <dialog ref={modal} className="modal">
      <div className="modal-box border">
        {details ? (
          <>
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="avatar">
                  <div className="w-12 rounded-full mr-2">
                    <img
                      src={details.profilePhotoUrl || anonimousAvatar}
                      alt="avatar"
                    />
                  </div>
                </div>
                <h2 className="font-bold text-xl">
                  {details.displayName || "Anonymous"}
                </h2>
              </div>
              <Link to="/mentors">
                <button className="btn btn-circle btn-outline btn-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </Link>
            </div>
            {!success ? (
              <>
                <h3 className="font-bold text-md mt-4">
                  {details.timeslots?.length
                    ? "Timeslots"
                    : "No available timeslots"}
                </h3>
                <div className="flex flex-wrap mt-8 ">
                  {details.timeslots &&
                    details.timeslots.map(
                      ({ id, time, date, status, currency, price }) => (
                        <button
                          key={id}
                          className={`card bg-base-100 shadow-md m-2 hover:shadow-xl border w-fit ${
                            status === "Booked"
                              ? "opacity-50"
                              : "cursor-pointer hover:bg-base-200"
                          }`}
                          disabled={status === "Booked"}
                          onClick={() => handleBookClick(id, price)}
                        >
                          <div className="card-body items-start ">
                            <div className="card-title">{`${formatEther(
                              BigInt(price)
                            )} ${currency}`}</div>
                            <div className="card-text">{`${date} at ${time}`}</div>
                            <div className="card-actions justify-center">
                              <span className="btn btn-secondary btn-sm mt-4">
                                Book
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mt-4 mb-2">
                  Congradulations!
                </h2>
                <div>You've booked a slot!</div>
                <Link to="/booked">
                  <button className="btn btn-primary mt-4">
                    Go you booked section
                  </button>
                </Link>
              </>
            )}
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </dialog>
  );
};

export { MentorDetails };
