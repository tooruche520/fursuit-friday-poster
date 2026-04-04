import { driver } from 'driver.js'
import type { Config, DriveStep } from 'driver.js'
import tourData from '@/data/tour.json'

export const useTour = () => {
  const hasSeenTour = useLocalStorage('fursuit-friday-tour-seen', false)

  const startTour = () => {
    const driverObj = driver({
      ...(tourData.config as Omit<Config, 'steps'>),
      steps: tourData.steps as DriveStep[],
      onDestroyStarted: () => {
        hasSeenTour.value = true
        driverObj.destroy()
      },
    })

    driverObj.drive()
  }

  const autoStartIfNew = () => {
    if (!hasSeenTour.value) {
      setTimeout(startTour, 600)
    }
  }

  return { startTour, autoStartIfNew }
}
