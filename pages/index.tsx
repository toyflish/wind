import type { NextPage } from "next";
import Head from "next/head";
import Damp from "../components/damp";
import Windfinder from "../components/windfinder";
import Geomar from "../components/geomar";

interface Props {
  generatedAt: string;
}
const Home: NextPage<Props> = ({ generatedAt }) => {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h2>Damp</h2>
      <div className="text-sm italic">{generatedAt}</div>
      <Damp />
      <hr className="m-2 border-black" />
      <Geomar />
      <hr className="m-2 border-black" />
      <Windfinder url="https://www.windfinder.com/report/kiel_leuchtturm" />
    </>
  );
};

export async function getStaticProps() {
  const now = new Date();
  const generatedAt = `${now.toLocaleDateString()}  ${now.toLocaleTimeString()}`;
  return {
    props: { generatedAt },
    revalidate: 5,
  };
}

export default Home;
