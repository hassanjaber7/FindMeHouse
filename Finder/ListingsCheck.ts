import fs from 'fs';


//  Function to read existing listings from JSON
export async function loadExistingListings(filename = 'listings.json') {
  try {
    if (fs.existsSync(filename)) {
      const data = fs.readFileSync(filename, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('No existing JSON file found, starting fresh');
  }
  return [];
}

//  Function to check if listing already exists
export function listingExists(existingListings: any[] | null, newListing: { title: any; price: any; }) {
  if (!existingListings) return false;
  return existingListings.some(listing =>
    listing.title === newListing.title &&
    listing.price === newListing.price
  );
}


