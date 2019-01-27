import React from 'react';
import { Image } from 'react-native';
import { Location } from 'expo';
import styled from 'styled-components';
import AppContext from '../AppContext';

class Compass extends React.Component {
  state = {
    headingSubscription: null,
    heading: null,
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
    if (prevProps.distanceToNextWaypoint != this.props.distanceToNextWaypoint) {
      this.setBearing();
      if (this.props.waypoints.length > 0 && this.props.distanceToNextWaypoint <= 0.05) {
        // auto skip next waypoint when get within 50m
        this.props.skipNextWaypoint()
      }
    }
  };

  subscribeToHeading = async () => {
    let headingSubscription = await Location.watchHeadingAsync(data => {
      let heading = Math.ceil(data.trueHeading);
      this.setState({ heading });
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
    let nextWaypoint
    if (this.props.waypoints.length > 0) {
      nextWaypoint = this.props.waypoints[0]
    } else {
      nextWaypoint = this.props.destination
    }
    let bearing = this.bearing(
      this.props.location[0],
      this.props.location[1],
      nextWaypoint[0],
      nextWaypoint[1],
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
    const arrowRotation = this.state.arrowRotation + 'deg';
    const compassRotation = this.state.compassRotation + 'deg';

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