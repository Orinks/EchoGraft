import { expect, test } from '@playwright/test'

test('playable smoke path reaches the restoration atlas systems', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'EchoGraft' })).toBeVisible()
  await page.getByRole('button', { name: 'Interact to Begin' }).click()
  await page.getByRole('button', { name: 'New game' }).click()

  await expect(page.getByRole('heading', { name: /Training Contract: First Breath/ })).toBeVisible()
  await expect(page.locator('.a-game--status')).toHaveCount(0)
  await expect(page.locator('.a-game--inventory')).toHaveCount(0)

  const eventLog = page.getByLabel('Caption and event log')
  await page.keyboard.press('o')
  await expect(eventLog.getByText(/Objective:/)).toBeVisible()
  await page.keyboard.press('p')
  await expect(eventLog.getByText(/Position:/)).toBeVisible()
  await page.keyboard.press('i')
  await expect(eventLog.getByText(/Inventory:/)).toBeVisible()
  await page.keyboard.press('c')
  await expect(eventLog.getByText(/Codex: no records recovered yet/)).toBeVisible()

  await page.keyboard.press('Space')
  await expect(eventLog.getByText(/Objective scan: heart/)).toBeVisible()
  await page.keyboard.press('z')
  await page.keyboard.press('Space')
  await expect(eventLog.getByText(/Boundary scan:/)).toBeVisible()
  await page.keyboard.press('z')
  await page.keyboard.press('Space')
  await expect(eventLog.getByText(/Seed scan: no planted seed objects/)).toBeVisible()
  await page.keyboard.press('z')
  await page.keyboard.press('Space')
  await expect(eventLog.getByText(/Hazard scan:/)).toBeVisible()

  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await expect(eventLog.getByText(/solved with Resonant rating/)).toBeVisible()
  await expect(eventLog.getByText(/Codex updated: First Breath/)).toBeVisible()

  await page.getByRole('button', { name: 'Choose next contract' }).click()
  await expect(page.getByRole('heading', { name: 'Restoration Atlas' })).toBeVisible()
  await expect(page.getByText(/biomass 1/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enter contract' }).nth(1)).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Enter contract' }).nth(2)).toBeDisabled()

  await page.getByRole('button', { name: 'Codex' }).click()
  await expect(page.getByRole('heading', { name: 'First Breath' })).toBeVisible()
})

test('does not request external audio files', async ({ page }) => {
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/')
  await page.getByRole('button', { name: 'Interact to Begin' }).click()
  await page.getByRole('button', { name: 'New game' }).click()
  expect(requests.filter((url) => /\.(mp3|wav|ogg|flac|m4a)(\?|$)/i.test(url))).toEqual([])
})
