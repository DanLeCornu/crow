import React from 'react';
import { View, Image } from 'react-native';
import { Location } from 'expo';
import { Alert } from './Alert';
import styled from 'styled-components';
import AppContext from '../AppContext';

class Compass extends React.Component {
  state = {
    headingSubscription: null,
    heading: null,
    accuracy: null,
    bearing: null,
    compassRotation: null,
    arrowRotation: null,
  };

  componentWillMount() {
    this.subscribeToHeading();
    if (this.props.destination) {
      this.setBearing();
      this.setArrowRotation();
    }
  }

  componentWillUnmount() {
    this.state.headingSubscription.remove();
  }

  componentDidUpdate = prevProps => {
    if (this.props.destination) {
      if (prevProps.location != this.props.location) {
        this.setBearing();
      }
    }
  };

  subscribeToHeading = async () => {
    let headingSubscription = await Location.watchHeadingAsync(data => {
      let heading = Math.ceil(data.trueHeading);
      let accuracy = data.accuracy;
      this.setState({ heading, accuracy });
      this.setCompassRotation();
      if (this.props.destination) {
        this.setArrowRotation();
      }
    });
    this.setState({ headingSubscription });
  };

  setArrowRotation = () => {
    let arrowRotation = this.state.bearing - this.state.heading;
    if (arrowRotation > 360) arrowRotation -= 360;
    if (arrowRotation < 0) arrowRotation += 360;
    this.setState({ arrowRotation });
  };

  setCompassRotation = () => {
    let compassRotation = 360 - this.state.heading;
    this.setState({ compassRotation });
  };

  setBearing = () => {
    let bearing = this.bearing(
      this.props.location[0],
      this.props.location[1],
      this.props.destination[0],
      this.props.destination[1],
    );
    this.setState({ bearing });
  };

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

  toRadians = degrees => {
    return (degrees * Math.PI) / 180;
  };

  toDegrees = radians => {
    return (radians * 180) / Math.PI;
  };

  render() {
    const { accuracy } = this.state;
    const { destination } = this.props;
    const arrowRotation = this.state.arrowRotation + 'deg';
    const compassRotation = this.state.compassRotation + 'deg';

    return (
      <>
        {accuracy && accuracy <= 1 && (
          <Alert>⚠️ Your phone's compass accuracy is low!</Alert>
        )}
        <CompassWrapper>
          <CompassImage
            style={{ transform: [{ rotate: compassRotation }] }}
            source={require('../../assets/images/compass.png')}
          />
          {destination && (
            <Arrow
              style={{ transform: [{ rotate: arrowRotation }] }}
              source={require('../../assets/images/arrow.png')}
            />
          )}
        </CompassWrapper>
      </>
    );
  }
}

export default class CompassContainer extends React.Component {
  render() {
    return (
      <AppContext.Consumer>
        {context => <Compass {...context} />}
      </AppContext.Consumer>
    );
  }
}

const CompassWrapper = styled(View)`
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
