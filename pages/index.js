import Layout from "../components/layout";
import Damp from "../components/damp";
import Windfinder from "../components/windfinder";
import Geomar from "../components/geomar";

function IndexPage() {
  return (
    <Layout>
      <h2>Damp</h2>
      <Damp />
      <hr className="m-2 border-black" />
      <Geomar />
      <hr className="m-2 border-black" />
      <Windfinder url='https://www.windfinder.com/report/kiel_leuchtturm' />
    </Layout>
  );
}

export default IndexPage;
