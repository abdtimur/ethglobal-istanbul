import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import anonimousAvatar from "../assets/anonymous.jpg";

const CardsList: React.FC = () => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const getMentors = async () => {
      const response = await fetch("https://ethg-ist.fly.dev/api/mentors");
      const responseJson = await response.json();
      setMentors(responseJson);
    };

    getMentors();
  }, []);
  return (
    <>
      <div className="flex flex-wrap ">
        {mentors.map(({ account, displayName, profilePhotoUrl }) => (
          <Link to={`${account}`} key={account}>
            <div
              key={account}
              className="card bg-base-100 shadow-md m-2 hover:shadow-xl border w-96 cursor-pointer hover:bg-base-200"
            >
              <div className="card-body">
                <div className="flex">
                  <div className="avatar">
                    <div className="w-12 rounded-full mr-2">
                      <img
                        src={profilePhotoUrl || anonimousAvatar}
                        alt="avatar"
                      />
                    </div>
                  </div>
                  <div className="card-title">{displayName || "Anonymous"}</div>
                </div>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">View slots</button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Outlet />
    </>
  );
};

export { CardsList };
