import React from 'react';

import classNames from 'classnames';

import { AppProps } from './types';

import Title from './components/title';
import SearchBox from './components/search-box';

// css module的样式
import styles from './index.module.scss';

// .css文件纯css，没有用到css module
import './style.css';

const App: React.FC<AppProps> = (props: AppProps) => (
  <div className={classNames(styles.reactSSRContainer, 'main-body')}>
    <Title text={`hello, ${props?.name}`}/>
    <SearchBox/>
  </div>
);

export default App;
