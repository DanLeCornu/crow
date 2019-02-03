import React from 'react';
import { Animated, Text } from 'react-native';
import { Location } from 'expo';
import { throttle } from '../lib/helpers'
import AppContext from '../AppContext';

import styled from 'styled-components';

class Compass extends React.Component {
  state = {
    headingSubscription: null,
    heading: null,
    bearing: null,
    compassRotation: new Animated.Value(0),
    arrowRotation: new Animated.Value(0),
  };

  componentWillMount() {
    this.subscribeToHeading();
    if (this.props.destination) {
      this.setBearing();
      this.setCompassRotation();
      this.setArrowRotation();
    }
  }

  componentWillUnmount() {
    this.state.headingSubscription.remove();
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.heading != this.state.heading) {
      console.log('update!');
      this.setBearing();
      this.setCompassRotation();
      this.setArrowRotation();
    }
  };

  subscribeToHeading = async () => {
    let headingSubscription = await Location.watchHeadingAsync(data => {
      let heading = Math.ceil(data.trueHeading);
      throttle(this.setState({ heading }), 1000);
    });
    this.setState({ headingSubscription });
  };

  setArrowRotation = () => {
    let arrowRotation = this.state.bearing - this.state.heading;
    if (arrowRotation > 360) arrowRotation -= 360;
    if (arrowRotation < 0) arrowRotation += 360;
    Animated.spring(this.state.arrowRotation, {
      toValue: arrowRotation,
      duration: 500,
    }).start()
  };

  setCompassRotation = () => {
    let compassRotation = 360 - this.state.heading;
    Animated.spring(this.state.compassRotation, {
      toValue: compassRotation,
      duration: 500,
    }).start()
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
    const compassRotation = JSON.stringify(this.state.compassRotation) + 'deg'
    const arrowRotation = JSON.stringify(this.state.arrowRotation) + 'deg'

    return (
      <>
        <CompassImage
          style={{ transform: [{ rotate: compassRotation }] }}
          source={require('../../assets/images/compass.png')}
        />
        <Arrow
          style={{ transform: [{ rotate: arrowRotation }] }}
          source={require('../../assets/images/arrow.png')}
        />
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

const CompassImage = styled(Animated.Image)`
  width: 300px;
  height: 300px;
  resize-mode: contain;
`;
const Arrow = styled(Animated.Image)`
  width: 270px;
  height: 270px;
  position: absolute;
  resize-mode: contain;
`;