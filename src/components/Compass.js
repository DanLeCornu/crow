import React from 'react';
import { Animated } from 'react-native';
import { Location } from 'expo';
import throttle from 'lodash.throttle'
import AppContext from '../AppContext';

import styled from 'styled-components';

class Compass extends React.Component {
  state = {
    headingSubscription: null,
    heading: null,
    bearing: null,
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

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.heading != this.state.heading) {
      this.setBearing();
      this.setArrowRotation();
    }
  };

  subscribeToHeading = async () => {
    let headingSubscription = await Location.watchHeadingAsync(
      throttle(data => {
        let heading = Math.ceil(data.trueHeading);
        this.setState({ heading })
      },25)
    );
    this.setState({ headingSubscription });
  };

  setArrowRotation = () => {
    const target = this.state.bearing - this.state.heading;
    this.setState({arrowRotation: target})
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
    const { arrowRotation } = this.state
    return (
      <Container>
        <CompassImage
          source={require('../../assets/images/compass_ring.png')}
        />
        <Arrow
          style={{ transform: [{ rotate: arrowRotation + 'deg' }] }}
          source={require('../../assets/images/compass_arrow.png')}
        />
      </Container>
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
const Container = styled.View`
  align-items: center;
  justify-content: center;
`
const CompassImage = styled(Animated.Image)`
  resize-mode: contain;
  box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.25);
`
const Arrow = styled(Animated.Image)`
  position: absolute;
`