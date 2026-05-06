import { expect, test } from '@playwright/test'

test('playable smoke path through first chamber systems', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'EchoGraft' })).toBeVisible()
  await page.getByRole('button', { name: 'New game' }).click()
  await expect(page.getByRole('heading', { name: /Tutorial/ })).toBeVisible()

  await page.keyboard.press('Space')
  await expect(page.getByText(/Scan pulse: heart/)).toBeVisible()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await expect(page.getByText(/Moved to 0, 0/)).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.getByText(/Tutorial: First Breath solved/)).toBeVisible()

  await page.keyboard.press('Tab')
  await expect(page.getByText(/Selected Lumen phonoseed/)).toBeVisible()
  await page.keyboard.press('=')
  await expect(page.getByText(/Tuned Lumen phonoseed/)).toBeVisible()

  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to game' }).click()
  await page.keyboard.press('h')
  await expect(page.getByRole('heading', { name: 'Help' })).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: /Tutorial/ })).toBeVisible()
})

test('does not request external audio files', async ({ page }) => {
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/')
  await page.getByRole('button', { name: 'New game' }).click()
  expect(requests.filter((url) => /\.(mp3|wav|ogg|flac|m4a)(\?|$)/i.test(url))).toEqual([])
})
