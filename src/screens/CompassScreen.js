import React from 'react';
import { View, Button, Text } from 'react-native';
import Compass from '../components/Compass';
import styled from 'styled-components';
import AppContext from '../AppContext';
import Geolib from 'geolib';

class CompassScreen extends React.Component {
  state = {
    distance: null,
  };

  componentDidMount() {
    this.setDistance();
  }

  componentDidUpdate = prevProps => {
    if (prevProps.location != this.props.location) {
      this.setDistance();
    }
  };

  setDistance = async () => {
    let distanceM = await Geolib.getDistance(
      {
        latitude: this.props.location[0],
        longitude: this.props.location[1],
      },
      {
        latitude: this.props.destination[0],
        longitude: this.props.destination[1],
      },
    );
    let distanceKm = (distanceM / 1000).toFixed(2);
    this.setState({ distance: distanceKm });
  };

  render() {
    const { distance } = this.state;

    let buttonTitle;
    if (this.props.destination) {
      buttonTitle = 'Change destination';
    } else {
      buttonTitle = 'Set destination';
    }

    return (
      <>
        {distance && <Distance>{distance} km</Distance>}
        <Compass />
        <DestinationButtonContainer>
          <DestinationButton>
            <Button
              title={buttonTitle}
              color="white"
              onPress={() => this.props.setScreen('Map')}
            />
          </DestinationButton>
        </DestinationButtonContainer>
      </>
    );
  }
}

export default class CompassScreenContainer extends React.Component {
  render() {
    return (
      <AppContext.Consumer>
        {context => <CompassScreen {...context} />}
      </AppContext.Consumer>
    );
  }
}

const DestinationButton = styled(View)`
  width: 45%;
  border-radius: 10px;
  background: #01b3fd;
`;

const DestinationButtonContainer = styled(View)`
  position: absolute;
  bottom: 20px;
  width: 100%;
  height: 10%;
  justify-content: center;
  align-items: center;
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
