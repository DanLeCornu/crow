import React from 'react';
import { View, Text, Button } from 'react-native';

import Compass from '../components/Compass';

import styled from 'styled-components';

export default class CompassScreen extends React.Component {
  static navigationOptions = {
    title: 'Compass',
  };

  render() {
    const { params } = this.props.navigation.state;

    return (
      <>
        {params ? (
          <>
            <Compass destination={params.destination} />
            <ChangeButtonContainer>
              <DestinationButton>
                <Button
                  title="Change destination"
                  color="white"
                  onPress={() => this.props.navigation.navigate('Map')}
                />
              </DestinationButton>
            </ChangeButtonContainer>
          </>
        ) : (
          <>
            <SetButtonContainer>
              <DestinationButton>
                <Button
                  title="Set destination"
                  color="white"
                  onPress={() => this.props.navigation.navigate('Map')}
                />
              </DestinationButton>
            </SetButtonContainer>
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

const SetButtonContainer = styled(View)`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ChangeButtonContainer = styled(View)`
  position: absolute;
  bottom: 20px;
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
