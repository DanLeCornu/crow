import React from 'react'
import { Keyboard } from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { GOOGLE_API_KEY } from '../lib/api_keys'

export class GooglePlacesInput extends React.Component {
  // required to ensure listView is hidden onPress
  shouldComponentUpdate() {
    return false
  }

  render() {
    return (
      <GooglePlacesAutocomplete
        placeholder='Search'
        minLength={2}
        autoFocus={false}
        returnKeyType={'search'}
        fetchDetails={true}
        renderDescription={row => row.description}
        debounce={200}
        onPress={(data, details = null) => {
          const lat = details.geometry.location.lat
          const lon = details.geometry.location.lng
          this.props.setDestination(lat, lon)
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: 'en',
        }}
        styles={{
          container: {
            zIndex: 1
          },
          textInputContainer: {
            width: '100%'
          },
          description: {
            fontWeight: 'bold'
          },
          poweredContainer: {
            display: "none"
          },
          listView: {
            position: 'absolute',
            zIndex: 1,
            top: 44,
            backgroundColor: 'white'
          }
        }}
      />
    )
  }
}