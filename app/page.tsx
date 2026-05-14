import Wrapper from "./components/Wrapper";

export default function Home() {
  return (
    <Wrapper>
      
      <h1 className="text-3xl font-bold ">Hello world!</h1>
      <input type="text" placeholder="Primary" className="input input-primary rounded-2xl" />
      <button className="btn btn-primary rounded-2xl ">Valider </button>
      <button
        className="inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900">
        Annuler 
      </button>
    </Wrapper>
  );
}
