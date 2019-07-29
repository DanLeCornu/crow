export const calcBearing = (startLat, startLng, destLat, destLng) => {
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = Math.atan2(y, x);
  brng = toDegrees(brng);
  return Math.ceil((brng + 360) % 360);
};

const toRadians = degrees => {
  return (degrees * Math.PI) / 180;
};

const toDegrees = radians => {
  return (radians * 180) / Math.PI;
};