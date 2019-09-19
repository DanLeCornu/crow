import * as TaskManager from 'expo-task-manager';
import { BACKGROUND_LOCATION_TASK, } from '../lib/constants'
import { retrieveData, storeData } from '../services/localStorage'
import { calcDistance } from '../services/calcDistance'

export const defineBackgroundTask = () => {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
      console.log(error.message);
    }
    if (data) {
      const { locations } = data
      const location = [locations[0].coords.latitude, locations[0].coords.longitude]
      const destinationLat = await retrieveData('destinationLat')
      const destinationLon = await retrieveData('destinationLon')
      const destination = [parseFloat(destinationLat), parseFloat(destinationLon)]
      const distance = await calcDistance(location, destination)

      storeData('locationLat', location[0].toFixed(4))
      storeData('locationLon', location[1].toFixed(4))
      storeData('distance', distance)
    }
  })
}