import React from 'react';
import { Text } from 'react-native';

import styled from 'styled-components';

export class Alert extends React.Component {
  render() {
    return <AlertText {...this.props} />;
  }
}

const AlertText = styled(Text)`
  background: #fdb135;
  position: absolute;
  top: 0;
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  z-index: 1;
`;
