// components/VideoBackground.js
export default function VideoBackground({ src = "/backvid1.mp4" }) {
  return (
    <video
      autoPlay
      loop
      muted
      className="absolute top-0 left-0 w-screen h-screen object-cover"
      src={src}
    />
  );
}
