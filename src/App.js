import './App.css';
import {fetchFonts, fetchAds} from './Api';
import { createRef, useEffect, useState } from 'react';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const [page, setPage] = useState(1);
  const [initial, setInitial] = useState(true);
  const [nextBatch, setNextBatch] = useState([]);
  const [ads, setAds] = useState([]);
  const [offset, setOffset] = useState(0);
  const [lastAd, setLastAd] = useState(undefined);
  const [itemsDisplayed, setItemsDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("Id");
  const [order, setOrder] = useState("Ascending");
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
    setOffset(0);
    setItemsDisplayed([]);
    setLoading(true);
    setHasMore(true);
    setSortBy(sortByRef.current.value);
    setOrder(orderRef.current.value);
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

  const addType = (type) => {
    const modItem = item => {
      let newItem = item;
      newItem.type = type;
      return newItem;
    }
    return modItem;
  }

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true)
      const firstFonts = await fetchFonts(sortBy, ((order === 'Ascending' ? true : false)), page);
      const firstItems = [...firstFonts].map(addType('Font'));
      if(ads === undefined || ads.length === 0) {
        const fetchedAds = await fetchAds();
        setAds(fetchedAds.map(addType('Ad')));
      }
      setNextBatch(prev => [...prev, ...firstItems]);
      setPage(prev => prev + 1);
    }

    if(initial) loadInitial();
  }, [initial])

  useEffect(() => {
    const getRandom = (fetchedAds) => {
      return fetchedAds[Math.floor(Math.random() * fetchedAds.length)];
    }

    const loadFonts = async () => {
      if(!initial && hasMore) {
        setLoading(true);
        const nextFonts = await fetchFonts(sortBy, ((order === 'Ascending' ? true : false)), page);
        if(nextBatch === undefined || nextBatch.length === 0) {
          setHasMore(false);
        } else {
          let prodsToShow = Math.floor((offset + nextBatch.length)/20);
          let nextBatchCopy = [...nextBatch];
          let newNextBatch = []
          let adsToAdd = [];
          let lastAdAdded = lastAd;
          for(let j = 0; j < prodsToShow; j++) {
            let ad = getRandom(ads);
            if(lastAdAdded !== undefined) {
              while(ad.id === lastAdAdded.id) {
                ad = getRandom(ads);
              }
            }
            adsToAdd.push(ad);
            lastAdAdded = ad;
          }
          const newAdsToAdd = adsToAdd.map(ad => {
            let newAd = Object.assign({}, ad);
            newAd.id = uuidv4();
            return newAd;
          })
          for(let i = 0; i < prodsToShow; i++) {
            if(i === 0) {
              newNextBatch = [...newNextBatch, ...nextBatchCopy.splice(0, (20 - offset))];
            } else {
              newNextBatch = [...newNextBatch, ...nextBatchCopy.splice(0, 20)];
            }
            if(newAdsToAdd.length > 0) {
              newNextBatch.push(newAdsToAdd[i]);
            }
          }
          newNextBatch = [...newNextBatch, ...nextBatchCopy];
          setItemsDisplayed(prev => [...prev, ...newNextBatch]);
          if(adsToAdd.length > 0) {
            setLastAd(adsToAdd[adsToAdd.length - 1]);
          }
          setOffset((nextBatch.length + offset) % 20);
        }
        const nextItems = [...nextFonts].map(addType('Font'));
        setNextBatch(nextItems);
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
          {itemsDisplayed.map(item => {
            let productItem;
            if(item.type === 'Font') {
              const dateAdded = formatDate(item.date);
              productItem = (
                <div key={item.id}>
                  <div className={productClassList}>
                    <div className='Container'>
                      <div className='Header'><p className='DateAdded'>{dateAdded}</p></div>
                      <div className='Content'>
                        <div style={{fontSize: `${item.size}px`}}>{item.value}</div>
                      </div>
                      <div className='Footer'>
                        <p className='FontSize'>{item.size}px</p>
                        <p className='FontPrice'><b>${item.price}</b></p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              productItem = (
                <div key={item.id}>
                  <div className='Grow'>
                    <div style={
                      {
                        fontSize: `${item.size}px`, 
                        color: `${item.color}`,
                        backgroundColor: `${item.backgroundColor}`,
                        height: `175px`,
                        borderRadius: `10px`,
                        padding: `0px 40px`,
                        display: `flex`,
                        justifyContent: `center`,
                        alignItems: `center`
                      }
                    }>
                      <b>{item.value}</b>
                    </div>
                  </div>
                </div>
              );
            }
            return productItem;
          })}
        </div>
        {loading && <div className={loadingClassList}>loading</div>}
        {!loading && !hasMore && <div className="Ender">~ end of catalogue ~</div>}
      </div>
  );
}

export default App;