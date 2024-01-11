import React, { useState } from 'react';
import axios from 'axios';

import styles from './index.module.scss';

const SearchBox: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [newValue, setNewValue] = useState('');

  const changeHandle = async function (event: React.ChangeEvent) {
    setInputValue((event?.target as HTMLInputElement)?.value);
  };

  const clickHandle = async function () {
    const data = await axios.get(`/getInfo?key=${inputValue}`);
    console.log(data.data.info);
    setNewValue(data.data.info);
  };

  return (
    <div className={styles.searchBox}>
      <input
        className={styles.input}
        type="text"
        value={inputValue} // 将 inputValue 状态绑定到输入框的 value 属性
        onChange={changeHandle} // 设置 onChange 事件处理函数
        placeholder="请输入jsapi(多个用,分隔, 比如: search.openGifBrowser,search.startNBALiveActivity)"
      />
      <p>返回信息: {newValue}</p>
      <span className={styles.button} onClick={clickHandle}>提交</span>
    </div>
  );
};

export default SearchBox;
