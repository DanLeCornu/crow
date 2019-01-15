import React from 'react';
import { View, Text, Image } from 'react-native';
import { Location } from 'expo';

import Geolib from 'geolib';

import styled from 'styled-components';

export default class Compass extends React.Component {
  state = {
    heading: null,
    accuracy: null,
    bearing: null,
    arrowHeading: null,
    location: [0, 0],
    distance: null,
  };

  componentDidMount() {
    this.getLocation();
    this.getHeading();
  }

  componentDidUpdate = async prevprops => {
    if (prevprops.destination != this.props.destination) {
      await this.setBearing();
      this.setArrowHeading();
      this.setDistance();
    }
  };

  getLocation = () => {
    Location.watchPositionAsync(
      {
        enableHighAccuracy: true,
        distanceInterval: 5,
      },
      data => {
        let location = [data.coords.latitude, data.coords.longitude];
        this.setState({ location });
        this.setBearing();
        this.setDistance();
      },
    );
  };

  getHeading = async () => {
    Location.watchHeadingAsync(data => {
      let heading = Math.ceil(data.trueHeading);
      let accuracy = Math.ceil(data.accuracy);
      this.setState({ heading, accuracy });
      this.setArrowHeading();
      this.setCompassHeading();
    });
  };

  setArrowHeading = () => {
    let arrowHeading = this.state.bearing - this.state.heading;
    if (arrowHeading > 360) arrowHeading -= 360;
    if (arrowHeading < 0) arrowHeading += 360;
    this.setState({ arrowHeading });
  };

  setCompassHeading = () => {
    let compassHeading = 360 - this.state.heading;
    this.setState({ compassHeading });
  };

  setBearing = () => {
    let bearing = this.bearing(
      this.state.location[0],
      this.state.location[1],
      this.props.destination[0],
      this.props.destination[1],
    );
    this.setState({ bearing });
  };

  setDistance = () => {
    let distance = Geolib.getDistance(
      { latitude: this.state.location[0], longitude: this.state.location[1] },
      {
        latitude: this.props.destination[0],
        longitude: this.props.destination[1],
      },
    );
    this.setState({ distance });
  };

  // calculates bearing between two coords
  bearing = (startLat, startLng, destLat, destLng) => {
    startLat = this.toRadians(startLat);
    startLng = this.toRadians(startLng);
    destLat = this.toRadians(destLat);
    destLng = this.toRadians(destLng);

    y = Math.sin(destLng - startLng) * Math.cos(destLat);
    x =
      Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    brng = Math.atan2(y, x);
    brng = this.toDegrees(brng);
    return Math.ceil((brng + 360) % 360);
  };

  // Converts from degrees to radians.
  toRadians = degrees => {
    return (degrees * Math.PI) / 180;
  };

  // Converts from radians to degrees.
  toDegrees = radians => {
    return (radians * 180) / Math.PI;
  };

  render() {
    const { destination } = this.props;
    const {
      heading,
      accuracy,
      bearing,
      location,
      arrowHeading,
      compassHeading,
      distance,
    } = this.state;

    const spinArrow = this.state.arrowHeading + 'deg';
    const spinCompass = this.state.compassHeading + 'deg';

    return (
      <>
        {accuracy <= 1 && (
          <LowAccuracyWarning>
            ⚠️ Your phone's compass accuracy is low!
          </LowAccuracyWarning>
        )}
        <MetaData>
          <Text>heading: {heading}</Text>
          <Text>accuracy: {accuracy}</Text>
          <Text>target bearing: {bearing}</Text>
          <Text>arrow heading: {arrowHeading}</Text>
          <Text>compass heading: {compassHeading}</Text>
          <Text>distance (m): {distance}</Text>
        </MetaData>
        <CompassContainer>
          <CompassImage
            style={{ transform: [{ rotate: spinCompass }] }}
            source={require('../assets/images/compass.png')}
          />
          <Arrow
            style={{ transform: [{ rotate: spinArrow }] }}
            source={require('../assets/images/arrow.png')}
          />
        </CompassContainer>
      </>
    );
  }
}

const CompassContainer = styled(View)`
  position: absolute;
  top: 64px;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CompassImage = styled(Image)`
  width: 300px;
  height: 300px;
`;

const Arrow = styled(Image)`
  width: 50px;
  height: 50px;
  position: absolute;
`;

const MetaData = styled(View)`
  position: absolute;
  top: 70px;
  left: 10px;
`;

const LowAccuracyWarning = styled(Text)`
  background: #fdb135;
  position: absolute;
  top: 64px;
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  z-index: 1;
`;
