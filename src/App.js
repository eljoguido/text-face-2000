import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

const fetchFonts = (sortBy, isAscending, pageNumber) => {
  return new Promise(r => setTimeout(r, 800))
    .then(() => axios.get('fonts.json'))
    .then(res => {
      const sortedFonts = res.data.slice().sort((a, b) => {
        const compare = (a, b) => {
          return (isAscending ? ((a > b) ? 1 : -1) : ((a < b) ? 1 : -1));
        }

        switch(sortBy) {
          case 'Price':
            return compare(a.price, b.price);
          case 'Size':
            return compare(a.size, b.size);
          default:
            return compare(a.date, b.date);
        }
      });

      let batchFonts;
      for(let i = 0; i < pageNumber; i++) {
        batchFonts = sortedFonts.splice(0, 20);
      }
      return batchFonts;
    });
}

const App = () => {
  const [page, setPage] = useState(1);
  const [fontsDisplayed, setFontsDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const handleScroll = event => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if(scrollHeight - scrollTop === clientHeight) {
      setPage(prev => prev + 1);
    }
  }

  useEffect(() => {
    const loadFonts = async () => {
      setLoading(true);
      const newFonts = await fetchFonts('Date', false, page);
      if(newFonts === undefined || newFonts.length === 0) {
        setHasMore(false)
      } else {
        setFontsDisplayed(prev => [...prev, ...newFonts]);
      }
      setLoading(false);
    }

    loadFonts();
  },[page])

  const productClassList = `Product Grow`;
  const loadingClassList = `Loading Ender`;

  return (
      <div className='ScrollGrid' onScroll={handleScroll}>
        <div className='TopBar'>Text Face 2000</div>
        <div className='FontContainer'>
          {fontsDisplayed.map(font => {
            return (
              <div key={font.id}>
                <div className={productClassList}>
                  <div className='Container'>
                    <div style={{fontSize: `${font.size}px`}}>{font.value}</div>
                    <p><b>${font.price}</b></p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {loading && <div className={loadingClassList}>Loading</div>}
        {!loading && !hasMore && <div className="Ender">~ end of catalogue ~</div>}
      </div>
  );
}

export default App;
