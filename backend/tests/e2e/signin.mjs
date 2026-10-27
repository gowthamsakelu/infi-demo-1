// Shared by the browser tests: the app needs a signed-in user, so each test page presses "Press to log in" first (DEMO_LOGIN=true).
export async function signIn(page, base) {
  await page.goto(base, { waitUntil: 'networkidle' });
  const press = page.getByRole('button', { name: 'Press to log in' });
  if (await press.count()) {
    await press.click();
    await page.waitForURL(`${base}**`, { waitUntil: 'networkidle' });
  }
}
