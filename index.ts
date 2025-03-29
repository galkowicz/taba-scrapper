import * as fs from 'fs';
import { chromium } from 'playwright';

async function scrapeAndCheck(url: string, elementSelector: string, stateFilePath: string): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.waitForSelector(elementSelector);
    const element = page.locator(elementSelector).first();

    if (await element.count() > 0) {
      const elementText = (await element.textContent())?.trim() || '';

      let previousState: string | null = null;
      if (fs.existsSync(stateFilePath)) {
        previousState = fs.readFileSync(stateFilePath, 'utf-8').trim();
      }

      if (elementText !== previousState) {
        console.log(`Element changed! New text: ${elementText}`);
        fs.writeFileSync(stateFilePath, elementText);
        // sendNotification(`The element at ${url} has changed to: ${elementText}`);
      } else {
        console.log(`No change detected. Current text: ${elementText}`);
      }
    } else {
      console.log('Element not found. Check your selector.');
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close();
  }
}

function sendNotification(message: string): void {
    console.log("Notification: " + message);
    // Add SNS integration or other notification logic here.
}

async function main(): Promise<void> {
  const url = 'https://mavat.iplan.gov.il/SV4/1/6005269762/310';
  const elementSelector = '.uk-background-primary .uk-text-lead'; // Updated selector to directly target the date
  const stateFilePath = 'state_file.txt';

  await scrapeAndCheck(url, elementSelector, stateFilePath);
}

main();