import React, { useEffect, useState } from 'react';  
import { Input, Popover, Select, Button } from 'antd';
 
const { Option } = Select;
 
export const EditableField = ({ value, onUpdate,disabled,source }) => {  
    const [inputValueSource, setInputValueSource] = useState(value);
 
    useEffect(() => {  
        setInputValueSource(value);
    }, [value]);  
 
    const changeValue = (e) => {  
        setInputValueSource(e?.target?.value);  
    };  
 
    const handleBlur = () => {  
        onUpdate(inputValueSource);
    };  
 
    return (  
        <div>        
        <Input
            value={inputValueSource}
            onChange={(e) => changeValue(e)}
            onBlur={handleBlur}
        />  
        </div>
    );  
};
 
 
 
export const EditableSelect = ({ value, onUpdate, options }) => {
  const [selectedValue, setSelectedValue] = useState(value);
 
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);
 
  const handleChange = (newValue) => {
    setSelectedValue(newValue);
    onUpdate(newValue); // Update immediately on change
  };
 
  return (
    <Select value={selectedValue} style={{ width: 120 }} onChange={handleChange}>
      {options.map((option) => (
        <Option key={option} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  );
};
 