import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const timeSlots = [
  { id: 1, time: "10:00 AM", booked: false },
  { id: 2, time: "11:00 AM", booked: true },
  { id: 3, time: "12:00 AM", booked: false },
];

const MentorDetails: React.FC = () => {
  const modal = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (modal.current) {
      modal.current.showModal();
    }
  }, [modal]);

  const handleBookClick = (id: number) => {
    console.log(id);
  };

  return (
    <dialog ref={modal} className="modal">
      <div className="modal-box border">
        <div className="flex justify-between align-center">
          <h2 className="font-bold text-xl">John Wick</h2>
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
        <p>Coolest guy ever</p>

        <div className="flex flex-wrap mt-8 ">
          {timeSlots.map(({ id, time, booked }) => (
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
                  <button className="btn btn-primary btn-sm ">Book</button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
};

export { MentorDetails };
