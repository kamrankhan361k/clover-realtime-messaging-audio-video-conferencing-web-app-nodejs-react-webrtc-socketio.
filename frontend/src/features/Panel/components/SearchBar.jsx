import { useRef } from 'react';
import './SearchBar.sass';
import { FiSearch } from 'react-icons/fi';
import { useGlobal } from 'reactn';
import search from '../../../actions/search';

function SearchBar() {
  const searchInput = useRef();
  const setSearchResults = useGlobal('searchResults')[1];
  const [nav, setNav] = useGlobal('nav');
  const setSearch = useGlobal('search')[1];

  const onChange = (e) => {
    if (nav !== 'search') setNav('search');
    setSearch(e.target.value);
    search(e.target.value)
      .then((res) => setSearchResults(res.data.users))
      .catch((err) => console.log(err));
  };

  return (
    <div className="search-bar uk-flex uk-flex-center uk-flex-middle">
      <div className="icon" onClick={() => searchInput.current.focus()}>
        <FiSearch />
      </div>
      <div className="uk-inline search">
        <input className="uk-input uk-border-pill" placeholder="Search" ref={searchInput} onChange={onChange} />
      </div>
    </div>
  );
}

export default SearchBar;
