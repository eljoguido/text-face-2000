import './App.css';
import { createRef, useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';

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
            return compare(a.id, b.id);
        }
      });

      let batchFonts;
      for(let i = 0; i < pageNumber; i++) {
        batchFonts = sortedFonts.splice(0, 20);
      }
      return batchFonts;
    });
}

const formatDate = date => {
  const properDate = moment(date)
  const relativeDate = properDate.fromNow();
  const splitRelDate = relativeDate.split(' ');
  const unit = splitRelDate[0]
  const period = splitRelDate[1];
  const correctionFilter = ['month', 'months', 'year', 'years'];
  let formattedDate;
  if(correctionFilter.includes(period) || (period === 'days' && parseInt(unit) > 6)) {
    formattedDate = properDate.format('ll');
  } else {
    formattedDate = relativeDate;
  }
  return formattedDate.toString();
}

const App = () => {
  const [page, setPage] = useState(1);
  const [initial, setInitial] = useState(true);
  const [nextBatch, setNextBatch] = useState([]);
  const [fontsDisplayed, setFontsDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("Price");
  const [order, setOrder] = useState("Descending");
  const sortByRef = createRef();
  const orderRef = createRef();

  const handleScroll = event => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if((scrollHeight - scrollTop === clientHeight) && !loading) {
      setPage(prev => prev + 1);
    }
  }

  const handleClick = () => {
    setPage(1);
    setInitial(true);
    setNextBatch([]);
    setFontsDisplayed([]);
    setLoading(true);
    setHasMore(true);
    setSortBy(sortByRef.current.value);
    setOrder(orderRef.current.value);
  }

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true)
      const firstFonts = await fetchFonts(sortBy, ((order === 'Ascending' ? true : false)), page);
      setNextBatch(prev => [...prev, ...firstFonts]);
      setPage(prev => prev + 1);
      console.log("load");
    }

    if(initial) loadInitial();
  }, [initial])

  useEffect(() => {
    const loadFonts = async () => {
      if(!initial && hasMore) {
        setLoading(true);
        const nextFonts = await fetchFonts(sortBy, ((order === 'Ascending' ? true : false)), page);
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
          <div className='DropdownContainer'>
            <select ref={sortByRef} defaultValue={sortBy}>
              <option value="Size">Size</option>
              <option value="Price">Price</option>
              <option value="Id">Id</option>
            </select>
            <select ref={orderRef} defaultValue={order}>
              <option value="Ascending">Ascending</option>
              <option value="Descending">Descending</option>
            </select>
            <button onClick={handleClick}>Sort</button>
          </div>
        </div>
        <div className='FontContainer'>
          {fontsDisplayed.map(font => {
            const dateAdded = formatDate(font.date);
            return (
              <div key={font.id}>
                <div className={productClassList}>
                  <div className='Container'>
                    <div className='Header'><p className='DateAdded'>{dateAdded}</p></div>
                    <div className='Content'>
                      <div style={{fontSize: `${font.size}px`}}>{font.value}</div>
                    </div>
                    <div className='Footer'>
                      <p className='FontSize'>{font.size}px</p>
                      <p className='FontPrice'><b>${font.price}</b></p>
                    </div>
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
