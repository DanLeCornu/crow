import React from 'react';
import { Animated } from 'react-native';
import * as Location from 'expo-location';
import throttle from 'lodash.throttle'
import AppContext from '../AppContext';
import { calcBearing } from '../services/calcBearing'

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
    const bearing = calcBearing(
      this.props.location[0],
      this.props.location[1],
      this.props.destination[0],
      this.props.destination[1],
    );
    this.setState({ bearing });
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