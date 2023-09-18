import { useParams } from "@remix-run/react";

export default function Club() {
  const params = useParams();
  const id = params.id;

  return (
    <>
      <h1 className="">Placeholder</h1>
      <h3>Information about club {id}</h3>
        <div className="w-max grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 m-auto">
          <div className="bg-blue-600 w-96 h-48 rounded">01</div>
          <div className="bg-blue-600 w-96 h-48 rounded">02</div>
          <div className="bg-blue-600 w-96 h-48 rounded">03</div>
          <div className="bg-blue-600 w-96 h-48 rounded">04</div>
          <div className="bg-blue-600 w-96 h-48 rounded">05</div>
          <div className="bg-blue-600 w-96 h-48 rounded">06</div>
          <div className="bg-blue-600 w-96 h-48 rounded">07</div>
          <div className="bg-blue-600 w-96 h-48 rounded">08</div>
          <div className="bg-blue-600 w-96 h-48 rounded">09</div>
          <div className="bg-blue-600 w-96 h-48 rounded">10</div>
        </div>
    </>
  );
}
