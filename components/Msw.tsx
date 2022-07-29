import { useState, useRef, useEffect } from "react";

export default function Msw() {
  const [show, setShow] = useState(false);
  const msw = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const msw = document.getElementById("msw");
    if (msw) {
      msw.addEventListener("load", () => {
        console.log("loaded iframe");
        setLoading(false);
        // setShow(!show);
      });
    }
  }, [show]);

  const handleLoad = () => {
    setShow(true);
    setLoading(true);
  };

  return (
    <div className="w-full">
      <h3 className="mt-4">Tide</h3>
      {loading && <div className="p-4 text-center">Loading...</div>}
      {!show && (
        <button
          className="inline-flex items-center px-3 py-2 mt-4 text-sm font-medium leading-4 text-white border border-transparent rounded-md shadow-sm bg-slate-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleLoad}
        >
          Load magic seaweed
        </button>
      )}
      {show && (
        <iframe
          ref={msw}
          style={{ height: "500px" }}
          className="w-full"
          id="msw"
          src="https://magicseaweed.com/Viana-do-Castelo-Surf-Report/188/"
        />
      )}
    </div>
  );
}
