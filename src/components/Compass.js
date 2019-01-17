import React from 'react';
import { View, Text, Image } from 'react-native';
import { Location } from 'expo';
import Geolib from 'geolib';

import { Alert } from './Alert';

import styled from 'styled-components';

export default class Compass extends React.Component {
  state = {
    heading: null,
    accuracy: null,
    bearing: null,
    arrowHeading: null,
    location: null,
    distance: null,
  };

  componentDidMount() {
    this.getLocation();
    this.getHeading();
  }

  componentDidUpdate = async prevprops => {
    if (this.props.destination) {
      if (prevprops.destination != this.props.destination) {
        await this.setBearing();
        this.setArrowHeading();
        this.setDistance();
      }
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
        if (this.props.destination) {
          this.setBearing();
          this.setDistance();
        }
      },
    );
  };

  getHeading = async () => {
    Location.watchHeadingAsync(data => {
      let heading = Math.ceil(data.trueHeading);
      let accuracy = data.accuracy;
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

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x =
      Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
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
    const { accuracy } = this.state;
    const spinArrow = this.state.arrowHeading + 'deg';
    const spinCompass = this.state.compassHeading + 'deg';
    const distance = (this.state.distance / 1000).toFixed(2);

    return (
      <>
        {accuracy <= 1 && (
          <Alert>⚠️ Your phone's compass accuracy is low!</Alert>
        )}
        {distance > 0 && <Distance>{distance} km</Distance>}
        <CompassContainer>
          <CompassImage
            style={{ transform: [{ rotate: spinCompass }] }}
            source={require('../../assets/images/compass.png')}
          />
          {distance > 0 && (
            <Arrow
              style={{ transform: [{ rotate: spinArrow }] }}
              source={require('../../assets/images/arrow.png')}
            />
          )}
        </CompassContainer>
      </>
    );
  }
}

const CompassContainer = styled(View)`
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const CompassImage = styled(Image)`
  width: 300px;
  height: 300px;
  resize-mode: contain;
`;

const Arrow = styled(Image)`
  width: 270px;
  height: 270px;
  position: absolute;
  resize-mode: contain;
`;

const Distance = styled(Text)`
  position: absolute;
  top: 0;
  height: 150px;
  width: 100%;
  line-height: 150px;
  font-size: 32px;
  text-align: center;
`;
