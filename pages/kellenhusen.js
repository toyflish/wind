
const KellenHusen = ({id})  => {
  return (
    <>
      <h2>Kellenhusen</h2>
      <div className="text-sm italic">with id : {id}</div>
    </>
  );
}
// export async function getServerSideProps(context) {
//   console.log({context});

//   return {
//     props: { id: 77},
//   }
// }

export const getStaticProps = async (ctx) => {
  console.log({ctx});
  const {query} = ctx
  console.log({query})
  const id = query?.[id] || 99

  return {
    props: {
      id
    },
    unstable_revalidate: 2,

  }
}
export default KellenHusen;
