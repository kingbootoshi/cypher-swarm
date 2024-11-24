// Twitter client connectivity and authentication

import { Scraper } from 'goat-x';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Scraper instance for interacting with Twitter
export const scraper = new Scraper();

// Function to log in and save cookies
export async function loginAndSaveCookies() {
  console.log("attempting to login and save cookies");
  try {
    // Log in using credentials from environment variables
    await scraper.login(
      process.env.TWITTER_USERNAME!,
      process.env.TWITTER_PASSWORD!,
      process.env.TWITTER_EMAIL
    );

    // Retrieve the current session cookies
    const cookies = await scraper.getCookies();

    // Save the cookies to a JSON file for future sessions
    fs.writeFileSync(
      path.resolve(__dirname, 'cookies.json'),
      JSON.stringify(cookies)
    );

    console.log('Logged in and cookies saved.');
  } catch (error) {
    console.error('Error during login:', error);
  }
}

// Function to load cookies from the JSON file
export async function loadCookies() {
  try {
    // Read cookies from the file system
    const cookiesData = fs.readFileSync(
      path.resolve(__dirname, 'cookies.json'),
      'utf8'
    );
    const cookiesArray = JSON.parse(cookiesData);

    // Map cookies to the correct format (strings)
    const cookieStrings = cookiesArray.map((cookie: any) => {
      return `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${
        cookie.secure ? 'Secure' : ''
      }; ${cookie.httpOnly ? 'HttpOnly' : ''}; SameSite=${
        cookie.sameSite || 'Lax'
      }`;
    });

    // Set the cookies for the current session
    await scraper.setCookies(cookieStrings);

    console.log('Cookies loaded from file.');
  } catch (error) {
    console.error('Error loading cookies:', error);
  }
}

// Function to ensure the scraper is authenticated
export async function ensureAuthenticated() {
  try {
    // Attempt to load cookies from cookies.json
    await loadCookies();

    // Check if the scraper is logged in
    const loggedIn = await scraper.isLoggedIn();
    if (loggedIn) {
      console.log('Successfully authenticated with loaded cookies.');
    } else {
      console.log('Not logged in, attempting to log in and save cookies.');
      // If not logged in, log in and save cookies
      await loginAndSaveCookies();
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    // On error, attempt to log in and save cookies
    await loginAndSaveCookies();
  }
}