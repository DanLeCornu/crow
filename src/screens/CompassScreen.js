import React from 'react';
import { View, Button } from 'react-native';

import Compass from '../components/Compass';

import styled from 'styled-components';

export default class CompassScreen extends React.Component {
  static navigationOptions = {
    title: 'Compass',
    header: null,
  };

  render() {
    const { params } = this.props.navigation.state;

    return (
      <>
        {params ? (
          <>
            <Compass destination={params.destination} />
            <DestinationButtonContainer>
              <DestinationButton>
                <Button
                  title="Change destination"
                  color="white"
                  onPress={() => this.props.navigation.navigate('Map')}
                />
              </DestinationButton>
            </DestinationButtonContainer>
          </>
        ) : (
          <>
            <Compass />
            <DestinationButtonContainer>
              <DestinationButton>
                <Button
                  title="Set destination"
                  color="white"
                  onPress={() => this.props.navigation.navigate('Map')}
                />
              </DestinationButton>
            </DestinationButtonContainer>
          </>
        )}
      </>
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
