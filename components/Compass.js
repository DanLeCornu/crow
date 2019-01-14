import React from 'react';
import { View, Text, Image } from 'react-native';
import { Location } from 'expo';

import styled from 'styled-components';

export default class Compass extends React.Component {
  state = {
    heading: null,
    bearing: null,
    arrowHeading: null,
    location: [0, 0],
  };

  componentDidMount() {
    this.getLocation();
    this.getHeading();
  }

  componentDidUpdate = async prevprops => {
    if (prevprops.destination != this.props.destination) {
      await this.setBearing();
      this.setArrowHeading();
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
      },
    );
  };

  getHeading = async () => {
    Location.watchHeadingAsync(data => {
      let heading = Math.ceil(data.trueHeading);
      this.setState({ heading });
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
      bearing,
      location,
      arrowHeading,
      compassHeading,
    } = this.state;

    const spinArrow = this.state.arrowHeading + 'deg';
    const spinCompass = this.state.compassHeading + 'deg';

    return (
      <>
        {/* <Text>heading: {heading}</Text>
        <Text>target bearing: {bearing}</Text>
        <Text>arrow heading: {arrowHeading}</Text>
        <Text>compass heading: {compassHeading}</Text> */}
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
  height: 90%;
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
