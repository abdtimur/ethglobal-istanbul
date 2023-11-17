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

const CardsList: React.FC = () =>
  list.map(({ id, name, title }) => (
    <div key={id} className="card bg-base-100 shadow-md m-2 hover:shadow-xl">
      <div className="card-body">
        <div className="card-title">{name}</div>
        <div>{title}</div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-sm">Buy Now</button>
        </div>
      </div>
    </div>
  ));

export { CardsList };
