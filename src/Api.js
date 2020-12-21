import axios from 'axios';

const timeout = ms => {
  return new Promise(r => setTimeout(r, ms));
}

export const fetchFonts = async (sortBy, isAscending, pageNumber) => {
  await timeout(800);
  const response = await axios.get('fonts.json');
  const sortedFonts = response.data.slice().sort((a, b) => {
    const compare = (a, b) => {
      return (isAscending ? ((a > b) ? 1 : -1) : ((a < b) ? 1 : -1));
    }

    switch(sortBy) {
      case 'Price':
        return compare(a.price, b.price);
      case 'Size':
        return compare(a.size, b.size);
      default:
        return compare(a.id, b.id);
    }
  });
  let batchFonts;
  for(let i = 0; i < pageNumber; i++) {
    batchFonts = sortedFonts.splice(0, 19);
  }
  return batchFonts;
}

export const fetchAds = async () => {
  await timeout(500);
  const response = await axios.get('ads.json');
  return response.data;
}