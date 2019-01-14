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
            <Button
              title="Change destination"
              onPress={() => this.props.navigation.navigate('Map')}
            />
          </>
        ) : (
          <>
            <Button
              title="You must first set a destination"
              onPress={() => this.props.navigation.navigate('Map')}
            />
          </>
        )}
      </>
    );
  }
}
