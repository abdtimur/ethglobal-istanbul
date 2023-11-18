import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Mentor } from "../types";

import anonimousAvatar from "../assets/anonymous.jpg";

const MentorDetails: React.FC = () => {
  const modal = useRef<HTMLDialogElement>(null);
  const { mentorId } = useParams<{ mentorId: string }>();

  const [details, setDetails] = useState<Mentor>();

  useEffect(() => {
    if (modal.current) {
      modal.current.showModal();
    }
  }, [modal]);

  const handleBookClick = (id: string) => {
    console.log(id);
  };

  useEffect(() => {
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
            <h3 className="font-bold text-md mt-4">
              {details.timeslots?.length
                ? "Timeslots"
                : "No available timeslots"}
            </h3>
            <div className="flex flex-wrap mt-8 ">
              {details.timeslots &&
                details.timeslots.map(({ id, time, booked }) => (
                  <button
                    key={id}
                    className={`card bg-base-100 shadow-md m-2 hover:shadow-xl border w-fit ${
                      booked ? "opacity-50" : "cursor-pointer hover:bg-base-200"
                    }`}
                    disabled={booked}
                    onClick={() => handleBookClick(id)}
                  >
                    <div className="card-body ">
                      <div className="card-title">{time}</div>
                      <div className="card-actions justify-center">
                        <button className="btn btn-primary btn-sm ">
                          Book
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </dialog>
  );
};

export { MentorDetails };
