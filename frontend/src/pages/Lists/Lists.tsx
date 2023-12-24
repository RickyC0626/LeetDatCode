import React, { CSSProperties, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { axiosPrivate } from 'src/api/axios';
import PaginationButtons from 'src/components/pagination/PaginationButtons';
import SearchBar from 'src/components/search/SearchBar';
import Dropdown from 'src/components/ui/Dropdown';
import VirtualList from 'src/components/ui/VirtualList';
import useOverflow from 'src/hooks/useOverflow';
import usePagination from 'src/hooks/usePagination';
import { IList } from 'src/pages/List/List';
import { LISTS_SORT_ORDER } from 'src/pages/Lists/ListsEnum';
import { formatDate } from 'src/utils/utils';
import styles from 'styles/pages/Lists/Lists.module.css';
import { useDebounce } from 'use-debounce';

const List = (props: any) => {
  const { item, style }: { item: IList; style: CSSProperties } = props;
  const { ref } = props.props;

  const [overflow, textElementRef] = useOverflow();

  return (
    <div className={styles.list} data-testid='list' ref={ref} style={style}>
      <div className={styles['list__name']} data-testid='list__name'>
        <Link
          to={`../list/${item.id}`}
          className='truncate'
          ref={textElementRef}
          title={overflow ? item.name : undefined}
        >
          {item.name}
        </Link>
      </div>
      <div className={styles['list__footer']}>
        <span data-testid='user'>{item.username}</span>
        <span data-testid='date'>{formatDate(item.createdAt)}</span>
      </div>
    </div>
  );
};

const Lists = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const getSearchUrlParam = (): string => {
    const searchParam = searchParams.get('search');
    return searchParam ? searchParam : '';
  };

  const limit = 20;
  const [page, setPage, totalPages, setTotalPages] = usePagination();
  const [search, setSearch] = useState<string>(getSearchUrlParam());
  const [debouncedSearch] = useDebounce(search, 250);
  const [sortOrder, setSortOrder] = useState<{ text: string; value: string }>({
    text: LISTS_SORT_ORDER.NEW,
    value: LISTS_SORT_ORDER.NEW,
  });
  const [lists, setLists] = useState<IList[]>([]);

  const queryParams = `/?page=${page - 1}&limit=${limit}&search=${debouncedSearch}&sort=${
    sortOrder.value
  }`;

  useEffect(() => {
    fetchLists();
    updateUrlParams();
  }, [location.pathname, page, debouncedSearch, sortOrder]);

  const fetchLists = async () => {
    try {
      const res = await axiosPrivate.get(`/api${location.pathname}${queryParams}`);
      setLists(res.data.results);

      const pages = Math.ceil(res.data.total / limit);
      setTotalPages(Math.max(pages, 1));
    } catch (err) {
      setLists([]);
      setTotalPages(1);
    }
  };

  const updateUrlParams = () => {
    searchParams.set('page', page.toString());

    if (debouncedSearch.length === 0) {
      searchParams.delete('search');
    } else {
      searchParams.set('search', debouncedSearch);
    }

    searchParams.set('sort', sortOrder.value);

    setSearchParams(searchParams);
  };

  const switchTabs = (path: string) => {
    navigate(path);
    setPage(1);
    setSearch('');
  };

  const getTabSelectedStyle = (tab: string) => {
    return location.pathname === tab ? ` ${styles['lists__tab--selected']}` : '';
  };

  return (
    <div className={styles.lists}>
      <div className={styles['lists__wrapper']}>
        <div className={styles['lists__tabs']} data-testid='lists__tabs'>
          <div
            className={`${styles['lists__tab']}${getTabSelectedStyle('/lists')}`}
            onClick={() => switchTabs('/lists')}
          >
            All
          </div>
          <div
            className={`${styles['lists__tab']}${getTabSelectedStyle('/my-lists')}`}
            onClick={() => switchTabs('/my-lists')}
          >
            My lists
          </div>
        </div>
        <div
          className={`${styles['lists__body']}${
            location.pathname !== '/lists' ? ` ${styles['rounded-border']}` : ''
          }`}
        >
          <div className={styles['lists__search-wrapper']}>
            <SearchBar input={search} setInput={setSearch} placeholder='Search Lists' />
            <Dropdown
              selected={sortOrder}
              setSelected={setSortOrder}
              optionsEnum={LISTS_SORT_ORDER}
              width={165}
            />
          </div>
          <div className={styles['lists__container']}>
            <VirtualList items={lists} component={List} />
          </div>
          <div className={styles['pagination-buttons']}>
            <PaginationButtons
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              numberOfButtons={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lists;