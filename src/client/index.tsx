import React from 'react';
import ReactDOM from 'react-dom';

import App from '../views';

const { data } = window;

// 数据注水
ReactDOM.hydrate(<App name={data.name}/>, document.getElementById('root'));
