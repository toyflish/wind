import type { NextPage } from "next";
import Head from "next/head";
import WindLive from "../components/WindLive";
import WindChart from "../components/WindChart";
import TideChart from "../components/TideChart";
import Webcam from "../components/Webcam";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Viana do Castelo Wind</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full text-center pb-8">
        <h1 className="text-6xl font-bold">
          Viana do Castelo
          <br />
          Wind
        </h1>

        <WindLive />

        <h3 className="mt-6 text-lg text-gray-300">Wind &amp; Gusts</h3>
        <WindChart />

        <h3 className="mt-8 text-lg text-gray-300">Tide Table</h3>
        <TideChart />

        <Webcam />
      </main>
    </div>
  );
};

export default Home;
