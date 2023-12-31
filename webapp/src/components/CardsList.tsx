import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import anonimousAvatar from "../assets/anon3.png";
import SuccessIcon from "../assets/Success.png";
import { useChainId } from "wagmi";

const CardsList: React.FC = () => {
  const [mentors, setMentors] = useState([]);
  const chainId = useChainId();

  useEffect(() => {
    const chainIdQuery = chainId ? `?chainId=${chainId}` : "";
    const getMentors = async () => {
      const response = await fetch(`https://ethg-ist.fly.dev/api/mentors${chainIdQuery}`);
      const responseJson = await response.json();
      setMentors(responseJson);
    };

    getMentors();
  }, [chainId]);
  return (
    <>
      <div
        className="flex flex-wrap h-96"
        style={{
          backgroundImage: `url(${SuccessIcon})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right",
        }}
      >
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
