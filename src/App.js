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
  const [initial, setInitial] = useState(true);
  const [nextBatch, setNextBatch] = useState([]);
  const [fontsDisplayed, setFontsDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("Size");
  const [order, setOrder] = useState("Descending");

  const handleScroll = event => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if((scrollHeight - scrollTop === clientHeight) && !loading) {
      setPage(prev => prev + 1);
    }
  }

  const handleSortDropdown = event => {
    setSortBy(event.target.value);
  }

  const handleOrderDropdown = event => {
    setOrder(event.target.value);
  }

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true)
      const firstFonts = await fetchFonts('Date', false, page);
      setNextBatch(prev => [...prev, ...firstFonts]);
      setPage(prev => prev + 1);
    }

    loadInitial();
  }, [])

  useEffect(() => {
    const loadFonts = async () => {
      if(!initial && hasMore) {
        setLoading(true);
        const nextFonts = await fetchFonts('Date', false, page);
        if(nextBatch === undefined || nextBatch.length === 0) {
          setHasMore(false);
        } else {
          setFontsDisplayed(prev => [...prev, ...nextBatch]);
        }
        setNextBatch(nextFonts);
        setLoading(false);
      } else {
        setInitial(false);
      }
    }

    loadFonts();
  },[page])

  const productClassList = `Product Grow`;
  const loadingClassList = `Loading Ender`;

  return (
      <div className='ScrollGrid' onScroll={handleScroll}>
        <div className='TopBar'>Text Face 2000</div>
        <div className='SortBar'>
          <p>Sort By: </p>
          <div className='DropdownContainer'>
            <select value={sortBy} onChange={handleSortDropdown}>
              <option value="Size">Size</option>
              <option value="Price">Price</option>
              <option value="Id">Id</option>
            </select>
            <select value={order} onChange={handleOrderDropdown}>
              <option value="Ascending">Ascending</option>
              <option value="Descending">Descending</option>
            </select>
          </div>
        </div>
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
