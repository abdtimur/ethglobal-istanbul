import { useEffect, useState } from "react";
import { Timeslot } from "../types";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import DoneIcon from "../assets/Done.png";

const BookedList: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const [bookedList, setBookedList] = useState<Timeslot[]>([]);

  useEffect(() => {
    const getBookedList = async () => {
      const response = await fetch(
        `https://ethg-ist.fly.dev/api/timeslots/my-booked?account=${address}&chainId=${chainId}`
      );
      const responseJson = await response.json();
      setBookedList(responseJson);
    };
    getBookedList();
  }, [address, chainId]);

  return address ? (
    <div
      className="flex flex-wrap h-96 items-start"
      style={{
        backgroundImage: `url(${DoneIcon})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right",
      }}
    >
      {bookedList?.length ? (
        bookedList.map(
          ({ id, date, status, time, currency, price, callInfo }) => (
            <div
              key={id}
              className={`card bg-base-100 shadow-md m-2 hover:shadow-xl border w-fit cursor-pointer hover:bg-base-200`}
            >
              <div className="card-body items-start">
                <div className="card-title">{`${formatEther(
                  BigInt(price)
                )} ${currency}`}</div>
                <div className="card-text">{`${date} at ${time}`}</div>
                <div className="card-actions justify-center">
                  {status !== "Completed" ? (
                    <a
                      href={callInfo || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2"
                    >
                      <span className="btn btn-primary btn-sm ">
                        Start meeting
                      </span>
                    </a>
                  ) : (
                    <div className="text-success font-bold mt-4">
                      Meeting completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )
      ) : (
        <h3 className="font-bold text-md mt-4">You have no booked slots</h3>
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

export { BookedList };
