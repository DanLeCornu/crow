import * as TaskManager from 'expo-task-manager';
import { BACKGROUND_LOCATION_TASK, } from '../lib/constants'
import { storeData } from '../services/localStorage'

export const defineBackgroundTask = () => {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
    if (error) {
      console.log(error.message);
    }
    if (data) {
      const { locations } = data
      storeData('locationLat', locations[0].coords.latitude.toFixed(4))
      storeData('locationLon', locations[0].coords.longitude.toFixed(4))
    }
  })
}