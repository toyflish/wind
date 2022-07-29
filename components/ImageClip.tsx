const IMGWIDTH = 1284;
const IMGHEIGHT = 1064;

interface ImageClipProps {
  width: number;
  height: number;
  x: number;
  y: number;
  originalWidth?: number;
  originalHeight?: number;
  originalSrc?: string;
}

export default function ImageClip({
  x,
  y,
  width,
  height,
  originalWidth = 1284,
  originalHeight = 1064,
  originalSrc = "https://weather.vianalocals.com/ecowitt.png",
}: ImageClipProps) {
  const containerStyle = {
    position: "relative" as "relative",
    overflow: "hidden",
    width,
    height,
  };
  const style = {
    top: -y,
    left: -x,
    width: originalWidth,
    height: originalHeight,
    maxWidth: "inherit",
    position: "absolute" as "absolute",
  };
  return (
    <div style={containerStyle}>
      <img src={originalSrc} style={style} />
    </div>
  );
}
