import { expect, Page, test } from '@playwright/test';
test.describe.configure({ mode: 'serial' });

const baseUrl = `http://localhost:${process.env.FRONTEND_PORT}`;

let page: Page;

test.beforeAll(async ({ browser }) => {
	page = await browser.newPage();
	await page.goto(baseUrl);
});

test('page title is correct', async () => {
	await expect(page).toHaveTitle('Astro + Nest.js example');
});

test('page dynamic content is correct', async () => {
	const dynamicPageContent = await page
		.locator('#dynamic-content')
		.innerText();
	expect(dynamicPageContent).toBe(
		'"[{"title":"12345"}]" and "{"filter":{"keyword":"example"}}" was fetched as example response from underlying nest.js service',
	);
});
