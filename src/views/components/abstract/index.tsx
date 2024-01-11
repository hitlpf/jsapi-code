import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { AbstractProps } from './types';

const Abstract: React.FC<AbstractProps> = (props: AbstractProps) => {
  const [asyncValue, setAsyncValue] = useState('');

  const clickHandle = async function () {
    const data = await axios.get('/getInfo?key=abstract');
    setAsyncValue(data.data.info);
  };

  useEffect(() => {
    console.log('');
  }, []);

  return (
    <div className='abstract' onClick={clickHandle || props.onClick}>
      {props.summary}
      <p>{asyncValue}</p>
    </div>
  );
};

export default Abstract;
