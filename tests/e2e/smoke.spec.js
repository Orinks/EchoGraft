import { expect, test } from '@playwright/test'

test('playable smoke path through first chamber systems', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'EchoGraft' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Interact to Begin' })).toBeVisible()
  await page.getByRole('button', { name: 'Interact to Begin' }).click()
  await expect(page.getByText(/one night of breathable air/i)).toBeVisible()
  await page.getByRole('menuitem', { name: 'New game' }).click()
  await expect(page.getByRole('heading', { name: /Tutorial/ })).toBeVisible()
  const eventLog = page.getByLabel('Caption and event log')

  await expect(page.locator('.a-game--status')).toHaveCount(0)
  await expect(page.locator('.a-game--inventory')).toHaveCount(0)
  await page.keyboard.press('o')
  await expect(eventLog.getByText(/Current system: Intake lung, offline/)).toBeVisible()
  await page.keyboard.press('p')
  await expect(eventLog.getByText(/Ark restored 0 of 4 systems/)).toBeVisible()
  await page.keyboard.press('i')
  await expect(eventLog.getByText(/Selected Lumen phonoseed/)).toBeVisible()

  await page.getByRole('button', { name: 'Restore and advance' }).click()
  await expect(eventLog.getByText(/Intake lung is still offline/)).toBeVisible()
  await page.keyboard.press('Space')
  await expect(eventLog.getByText(/Scan pulse: heart/)).toBeVisible()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await expect(eventLog.getByText(/Moved to 0, 0/)).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(eventLog.getByText(/Intake lung restored/)).toBeVisible()
  await page.keyboard.press('n')
  await expect(page.getByRole('heading', { name: 'Directional Bloom' })).toBeVisible()

  await page.keyboard.press('Tab')
  await expect(eventLog.getByText(/Selected Verdant phonoseed/)).toBeVisible()
  await page.keyboard.press(']')
  await expect(eventLog.getByText(/Tuned Verdant phonoseed/)).toBeVisible()

  await page.keyboard.press('Escape')
  await page.getByRole('menuitem', { name: 'Options' }).click()
  await expect(page.getByRole('heading', { name: 'Options' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('menuitem', { name: 'Help' }).click()
  await expect(page.getByRole('heading', { name: 'Help' })).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: 'Interact to Begin' }).click()
  await page.getByRole('menuitem', { name: 'New game' }).click()
  await expect(page.getByRole('heading', { name: /Tutorial/ })).toBeVisible()
})

test('does not request external audio files', async ({ page }) => {
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/')
  await page.getByRole('button', { name: 'Interact to Begin' }).click()
  await page.getByRole('menuitem', { name: 'New game' }).click()
  expect(requests.filter((url) => /\.(mp3|wav|ogg|flac|m4a)(\?|$)/i.test(url))).toEqual([])
})
