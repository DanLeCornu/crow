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
      this.setBearing();
      this.setCompassRotation();
      this.setArrowRotation();
    }
  };

  subscribeToHeading = async () => {
    let headingSubscription = await Location.watchHeadingAsync(
      throttle(data => {
        let heading = Math.ceil(data.trueHeading);
        this.setState({ heading })
      },10)
    );
    this.setState({ headingSubscription });
  };

  setArrowRotation = () => {
    let current = parseInt(JSON.stringify(this.state.arrowRotation))
    let target = this.state.bearing - this.state.heading;
    if (target < 0) {
      target += 360
    }
    let dif = current - target

    // console.log('current', current);
    // console.log('target', target);
    // console.log('diff', current - target);
    
    let highDifference = false
    if (dif >= 180 || dif <= -180) {
      highDifference = true
    }
    // if differential is too high between animations, don't animate
    if (highDifference) {
      // console.log('HIGH DIFF');
      
      this.setState({arrowRotation: new Animated.Value(target)})
    } else {
      Animated.spring(this.state.arrowRotation, {
        toValue: target,
        duration: 500,
      }).start()
    }
  };

  setCompassRotation = () => {
    let current = parseInt(JSON.stringify(this.state.compassRotation))
    let target = 360 - this.state.heading;
    if (target < 0) {
      target += 360
    }
    let dif = current - target
    let highDifference = false
    if (dif >= 180 || dif <= -180) {
      highDifference = true
    }
    if (highDifference) {
      this.setState({compassRotation: new Animated.Value(target)})
    } else {
      Animated.spring(this.state.compassRotation, {
        toValue: target,
        duration: 500,
      }).start()
    }
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
    const compassRotation = this.state.compassRotation.interpolate({
      inputRange: [0,360],
      outputRange: ['0deg', '360deg']
    })
    const arrowRotation = this.state.arrowRotation.interpolate({
      inputRange: [0,360],
      outputRange: ['0deg', '360deg']
    })

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