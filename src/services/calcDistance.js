import Geolib from 'geolib'

export const calcDistance = (start, finish) => {
  let distanceM = Geolib.getDistance(
    {
      latitude: start[0],
      longitude: start[1],
    },
    {
      latitude: finish[0],
      longitude: finish[1],
    },
  )
  return (distanceM / 1000).toFixed(2);
}