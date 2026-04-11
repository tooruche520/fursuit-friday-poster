import { driver } from 'driver.js'
import type { Config, DriveStep } from 'driver.js'
import tourData from '@/data/contactsTour.json'

type ContactsTourStep = DriveStep & { requiresContacts?: boolean }

export function useContactsTour() {
  const hasSeenTour = useLocalStorage('fursuit-friday-contacts-tour-seen', false)

  const startContactsTour = (hasContacts: boolean) => {
    const steps = (tourData.steps as ContactsTourStep[])
      .filter(step => !step.requiresContacts || hasContacts)

    const driverObj = driver({
      ...(tourData.config as Omit<Config, 'steps'>),
      steps,
      onDestroyStarted: () => {
        hasSeenTour.value = true
        driverObj.destroy()
      },
    })

    driverObj.drive()
  }

  const autoStartIfNew = (hasContacts: boolean) => {
    if (!hasSeenTour.value) {
      setTimeout(() => startContactsTour(hasContacts), 600)
    }
  }

  return { startContactsTour, autoStartIfNew }
}
