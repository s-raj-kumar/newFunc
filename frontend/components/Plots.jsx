import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Modal, Flex, Spin } from 'antd';
import axios from 'axios';
import { SwapLeftOutlined } from '@ant-design/icons';

 
const { Header, Sider, Content } = Layout;
 
const Plots = () => {
    const navigate = useNavigate();
    const tableName = useParams();
    const [spinner,setSpinner] = useState(false);
    const [tip, setTip] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [urls, setUrls] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [imageData, setImageData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  useEffect(()=>{
    try{
        setSpinner(true);
        setTip('Creating Version...');
        const res = axios.get(`http://127.0.0.1:8000/plots/${tableName.tableName}/`).then((res)=>{
          console.log(res);
          console.log('Hi raj');
          setImageData(res.data.plots);
        
          setSpinner(false);
          setTip('');
        }).catch(err=>{
          setSpinner(false);
          setTip('');
          console.log(err);
        })
        console.log(res);
       
    }catch(err){
      console.log('Hello');
      setSpinner(false);
      setTip('');
      console.log(err);        
    }
  },[])
    // setUrls(data);
   
    const navigateBack = () => {
        navigate('/')
    }

 
  const handelParentChildData = async ()=>{
    // const data = [
    //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg_D7MMTLwsv5tUxaO3fpcHTK636BWEXP8cA&s",
    //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe5somXyS5ysHxnSaZ5ybe1iKFdWMXEN1qQA&s",
    //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsnPF4MD6IZGvTJ42JSu9m0Asx6EbSiY3mUw&s",
    //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcanojLbBk4hNspO6ySbyN_PSZZE7XneyQHA&s",
    //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg_D7MMTLwsv5tUxaO3fpcHTK636BWEXP8cA&s",
    //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe5somXyS5ysHxnSaZ5ybe1iKFdWMXEN1qQA&s",
    //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsnPF4MD6IZGvTJ42JSu9m0Asx6EbSiY3mUw&s",
    //   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcanojLbBk4hNspO6ySbyN_PSZZE7XneyQHA&s"
    // ];
    setImageData([]);
  }

   return (
        
        <Spin spinning={spinner} tip={tip}>
        <div>
            {imageData!==null && <> 
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}> {/* Flexbox for positioning */}
                    <Button style={{ margin: '10px' }} onClick={navigateBack}> {/* Add margin for spacing */}
                        <SwapLeftOutlined /> Back
                    </Button>
                </div> 
                <div style={{display: 'flex', flexWrap:'wrap'}}>
                    {imageData.map((imgUrl, index) => (
                    <div
                        style={{width: '50%',
                            padding: '10px',
                            boxSizing: 'border-box',
                        }}
                        key={index}
                    >
                        <h4>{Object.keys(imgUrl)[0]}</h4>
                        <img src={`data:image/png;base64,${btoa(imgUrl[Object.keys(imgUrl)[0]])}`} alt="Plot"
                        style={{
                            maxWidth: '100%', height: 'auto' 
                        }}/>
                    </div>
                    ))}
            </div>
                </>}
        </div>
        </Spin>
    
    
  );
};
export default Plots;