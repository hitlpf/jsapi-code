import React from 'react';

import { TitleProps } from './types';

const Title: React.FC<TitleProps> = (props: TitleProps) => (
  <div className='title' onClick={() => {
    alert(props?.text);
  }}>{props.text}</div>
);

export default Title;
