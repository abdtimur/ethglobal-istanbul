import { Link, Outlet } from "react-router-dom";

const list = [
  {
    id: 1,
    name: "John Doe",
    title: "Most hidden guy ever",
  },
  {
    id: 2,
    name: "John Wick",
    title: "Coolest guy ever",
  },
  {
    id: 3,
    name: "John Cena",
    title: "Strongest guy ever",
  },
  {
    id: 4,
    name: "John Legend",
    title: "Most talented guy ever",
  },
  {
    id: 5,
    name: "John Travolta",
    title: "Most famous guy ever",
  },
  {
    id: 6,
    name: "John Oliver",
    title: "Funniest guy ever",
  },
  {
    id: 7,
    name: "John Mayer",
    title: "Most romantic guy ever",
  },
];

const CardsList: React.FC = () => (
  <>
    <div className="flex flex-wrap ">
      {list.map(({ id, name, title }) => (
        <Link to={`${id}`} key={id}>
          <div
            key={id}
            className="card bg-base-100 shadow-md m-2 hover:shadow-xl border w-96 cursor-pointer hover:bg-base-200"
          >
            <div className="card-body">
              <div className="flex">
                <div className="avatar">
                  <div className="w-8 rounded-full mr-2">
                    <img src="https://i.pravatar.cc/500?img=32" alt="avatar" />
                  </div>
                </div>
                <div className="card-title">{name}</div>
              </div>
              <div className="mt-4">{title}</div>
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

export { CardsList };
