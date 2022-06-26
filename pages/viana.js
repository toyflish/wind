// const Clip = ({ top = 0,  left = 200 , bottom = 100 ,  right = 0}) => {
// 	const style = {
// 		clipPath: `inset(${top}px ${left}px ${bottom}px ${right}px)`,
// 		margin: `-${top}px -${left}px -${bottom}px -${right}px`,
// 		position: 'absolute',
// 	}
//   return (
//     <div className="relative clip-container">
//       <img src="https://weather.vianalocals.com/ecowitt.png" style={style} />
//     </div>
//   );
// };
const IMGWIDTH = 1284;
const IMGHEIGHT = 1064;
const Clip = ({ x = 0, y = 200, width = 100, height = 0 }) => {
  const containerStyle = {
    position: "relative",
    overflow: "hidden",
    width,
    height,
  };
  const style = {
    top: -y,
    left: -x,
    width: IMGWIDTH,
    height: IMGHEIGHT,
    maxWidth: "inherit",
    position: "absolute",
  };
  return (
    <div style={containerStyle}>
      <img src="https://weather.vianalocals.com/ecowitt.png" style={style} />
    </div>
  );
};
const Viana = () => {
	const chartDataWdith = 300;
  return (
    <div className="p-2">
      <h1 className="pt-2 text-lg">Viana</h1>
      <h3 className="mt-4">Wind</h3>
      <Clip x={2} y={70} width={320} height={220} />
      <h3 className="mt-4">Chart</h3>
			<div className="flex flex-row">
      <Clip x={2} y={500} width={60} height={250} />
      <Clip x={IMGWIDTH-chartDataWdith} y={500} width={chartDataWdith} height={250} />
			</div>
    </div>
  );
};
export default Viana;
