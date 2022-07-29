import type { NextPage } from "next";
import Head from "next/head";
import ImageClip from "../components/ImageClip";

const Home: NextPage = () => {
  const vianalocalsSrcWith = 1284;
  const chartDataWdith = 300;

  return (
    <div>
      <Head>
        <title>Viana do Castelo Wind</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full text-center">
        <h1 className="text-6xl font-bold">
          Viando do Castelo
          <br />
          Wind
        </h1>
        <h3 className="mt-4">Wind</h3>
        <ImageClip x={2} y={70} width={315} height={200} />
        <h3 className="mt-4">Chart</h3>
        <div className="flex flex-row">
          <ImageClip x={2} y={500} width={60} height={250} />
          <ImageClip
            x={vianalocalsSrcWith - chartDataWdith}
            y={500}
            width={chartDataWdith}
            height={250}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
