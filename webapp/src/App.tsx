import { Header } from "./components/Header";
import { CardsList } from "./screens/CardsList";

function App() {
  return (
    <>
      <Header />
      <div className="p-4 flex flex-wrap">
        <CardsList />
      </div>
    </>
  );
}

export default App;
