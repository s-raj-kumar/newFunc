import React, { useEffect, useState, useRef } from 'react';
import { Input, Table, Select, Button, Space, Modal, Popconfirm } from "antd";
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { SearchOutlined, HomeOutlined, MinusCircleTwoTone } from '@ant-design/icons';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import * as yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
// import $ from 'jquery';
const { Option } = Select;

const Tshirt = () => {
    // message.success('dsfa')

    const navigate = useNavigate();
    const [masterData, setMasterData] = useState([]);
    const [tempData, setTempData] = useState([]);
    const [tempmasterData, setTempMasterData] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [load, setLoad] = useState(false);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState();
    const [inscopeData, setInscopeData] = useState([]);
    const [outscopeData, setOutscopeData] = useState([]);
    const { tableName } = useParams();
    const [searchText, setSearchText] = useState('');
    const [searchData, setSearchData] = useState([]);
    const tableRef = useRef(null);
    const [createf, setcreatef] = useState(false);
    const [showPop, setShowPop] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);

    useEffect(()=>{
        setTempData(masterData);
    },[masterData]);

    const handelInscopeData = () => {
        if (inscopeData.length > 0) {
            setInscopeData([]);
            return;
        }
        setInscopeData([]);
        setOutscopeData([]);
        console.log(masterData)
        const temp = masterData.filter((obj) => {
            console.log(obj.scope);
            return obj.scope && obj.scope.toLowerCase() === 'inscope';
        });
        console.log(temp);
        setInscopeData([]);
        setOutscopeData([]);
        setInscopeData(temp);
    }
    const handelOutscopeData = () => {
        if (outscopeData.length > 0) {
            setOutscopeData([]);
            return;
        }
        setInscopeData([]);
        setOutscopeData([]);
        console.log(masterData)
        const temp = masterData.filter((obj) => {
            console.log(obj.scope);
            return obj.scope && obj.scope.toLowerCase() === 'outscope';
        });
        console.log(temp);
        setInscopeData([]);
        setOutscopeData([]);
        setOutscopeData(temp);
    }

    const handleDelete = (project, skill) => {
        console.log(project, skill);
        const newData = masterData.filter((item) => item.Project !== project || item.Skill !== skill);
        setMasterData(newData);
        // setMasterData([]);
        // setTimeout(() => {
        //     setMasterData(newData);
        // }, 10);
    };

    const columns = [
        {
            title: '',
            dataIndex: 'Delete',
            render: (_, record) =>
                masterData.length >= 1 ? (
                    <Popconfirm title="Sure to delete?"
                        onConfirm={() => handleDelete(record.Project, record.Skill)}
                    >
                        <MinusCircleTwoTone />
                    </Popconfirm>
                ) : null,
        },
        {
            title: 'Project',
            dataIndex: 'Project',
            key: 'Project',
            align: 'center',
            render: (text, record, index) => (
                <Input
                    defaultValue={text || ''}
                    onChange={(e) => handleInputChange(index, 'Project', e.target.value)}
                />
            ),
        },
        {
            title: 'Account Manager',
            dataIndex: 'AccountManager',
            key: 'AccountManager',
            align: 'center',
            render: (text, record, index) => (
                <Input
                    defaultValue={text || ''}
                    onChange={(e) => handleInputChange(index, 'AccountManager', e.target.value)}
                />
            ),
        },
        {
            title: 'Skill',
            dataIndex: 'Skill',
            key: 'Skill',
            align: 'center',
            render: (text, record, index) => (
                <Input
                    defaultValue={text || ''}
                    onChange={(e) => handleInputChange(index, 'Skill', e.target.value)}
                />
            ),
        },
        {
            title: 'Count',
            dataIndex: 'Count',
            key: 'Count',
            align: 'center',
            render: (text, record, index) => (
                <Input
                    defaultValue={text || ''}
                    onChange={(e) => handleInputChange(index, 'Count', e.target.value)}
                />
            ),
        },
        {
            title: 'Date',
            dataIndex: 'Date',
            key: 'Date',
            align: 'center',
            render: (text, record, index) => (
                <Input
                    defaultValue={text || ''}
                    onChange={(e) => handleInputChange(index, 'Date', e.target.value)}
                />
            ),
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            align: 'center',
            render: (text, record, index) => (
                <Input
                    defaultValue={text || ''}
                    onChange={(e) => handleInputChange(index, 'Status', e.target.value)}
                />
            ),
        },
        {
            title: 'Comments',
            dataIndex: 'Comments',
            key: 'Comments',
            align: 'center',
            render: (text, record, index) => (
                <Input
                    defaultValue={text || ''}
                    onChange={(e) => handleInputChange(index, 'Comments', e.target.value)}
                />
            ),
        },

        {
            title: 'Pending Action',
            dataIndex: 'PendingAction',
            key: 'PendingAction',
            align: 'center',
            render: (text, record, index) => (
                <Input
                    defaultValue={text || ''}
                    onChange={(e) => handleInputChange(index, 'PendingAction', e.target.value)}
                />
            ),
        },
    ];

    const handleSaveDuplicate = async () => {
        await handleSave();
        setShowPop(false);
    };

    const handleCancel = () => {
        setShowPop(false);
    };

    const handleSave = async () => {
        try {
            const res = await axios.post(`http://127.0.0.1:8000/table_data_save/${selectedTable}/`, masterData);
            console.log(res)
            messageApi.success('Saved');
            console.log(selectedTable)
            axios.get(`http://127.0.0.1:8000/table_data_get/${selectedTable}/`)
                .then((res) => {
                    let temp = res.data;
                    console.log(temp);
                    let finalTemp = [];
                    temp.forEach(element => {
                        finalTemp.push(element);
                    });
                    console.log(finalTemp);
                    setMasterData([]);
                    // setTimeout(() => {
                    //     setMasterData(finalTemp);
                    // }, 10);
                    setMasterData(finalTemp);

                    console.log(res);
                })
                .catch((err) => {
                    console.error('Error fetching data:', err);
                });
        } catch (error) {
            console.log(error)
        }
    }

    const handelSaveTable = async () => {
        console.log(selectedTable);
        console.log(masterData);
        try {
            const response = await axios.post(`http://127.0.0.1:8000/checkDuplicates/`, masterData);
            console.log(response.data)
            if (response.data === 1) {
                setShowPop(true);
            } else {
                handleSave()
            }

        } catch (error) {
            console.log(error)
        }
    };

    const navigateToPlots = () => {
        navigate(`/showgraphs/${selectedTable}`)
    }

    const handleExcel = async () => {
        try {

            const downloadResponse = await axios.post(`http://127.0.0.1:8000/sqllite3_to_excel/`,
                masterData,
                {
                    responseType: 'blob', // C rucial: Get response as a blob
                });

            console.log('Excel downloaded Successfully');
            console.log(downloadResponse);

            const blob = new Blob([downloadResponse.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedTable}__Effort&Estimate.xlsx`; // Set the filename
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url); // Release the blob URL (important!)

        } catch (error) {
            console.error("Error:", error);

            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            } else if (error.request) {
                console.error("Request:", error.request);
            } else {
                console.error("Message:", error.message);
            }
        }
    };



    const handleInputChange = (index, field, value) => {
        const newData = [...masterData];
        newData[index][field] = value;
        // alert();
        setMasterData(newData);
    };

    const handleScopeChange = (index, scope) => {
        console.log(scope);

    };

    const handleSelectChange = async (index, field, value) => {
        setLoading(true);
        const updatedRow = { ...masterData[index], [field]: value };
        const requiredFieldsFilled = checkRequiredFields(updatedRow);

        if (requiredFieldsFilled) {
            try {
                console.log(updatedRow);
                let transComplexcity = updatedRow?.transformation_complexity
                let loadComplexcity = updatedRow?.load_complexity
                let sourceComplexcity = updatedRow?.source_complexity
                let data_object = updatedRow?.data_object_type
                let scope = updatedRow?.scope;
                const updatedMasterData = masterData.map((item, i) => {
                    if (i === index) {
                        return { ...item, scope: scope }; // FSearcha new object with the updated scope
                    } else {
                        return item; // Return the original object if not the one being updated
                    }
                });
                //   alert();
                setMasterData(updatedMasterData);
                console.log(transComplexcity, " ", loadComplexcity, " ", sourceComplexcity)
                console.log('scope', scope);
                if (scope === "InScope") {
                    console.log('true');

                } else {
                    console.log('false');

                }
                console.log(' update row');
                setLoading(false);
                console.log(updatedRow);
                if (scope === "InScope") {
                    const response = await axios.get(`http://127.0.0.1:8000/estimated_time/${transComplexcity}/${loadComplexcity}/${sourceComplexcity}/`, updatedRow);
                    console.log(masterData[index])
                    let finalData = {
                        "object": masterData[index]?.object,
                        "module": masterData[index]?.module,
                        "data_object_type": data_object,
                        "transformation_complexity": response?.data[0]?.transformation_complexity,
                        "load_complexity": response?.data[0]?.load_complexity,
                        "source_complexity": response?.data[0]?.source_complexity,
                        "scope": scope,
                        "object_development": response?.data[0]?.object_development,
                        "iteration_1_data_loading": response?.data[0]?.iteration_1_data_loading,
                        "iteration_1_defects": response?.data[0]?.iteration_1_defects,
                        "iteration_2_data_loading": response?.data[0]?.iteration_2_data_loading,
                        "iteration_2_defects": response?.data[0]?.iteration_2_defects,
                        "iteration_3_data_loading": response?.data[0]?.iteration_3_data_loading,
                        "iteration_3_defects": response?.data[0]?.iteration_3_defects,
                        "production_data_loads": response?.data[0]?.production_data_loads,
                        "total": response?.data[0]?.total
                    };
                    console.log(' final master data');
                    console.log(finalData);
                    const newData = [...masterData];
                    newData[index] = finalData;
                    console.log(newData);
                    // alert();
                    setMasterData(newData);
                } else {
                    console.log(masterData[index])
                    let finalData = {
                        "object": masterData[index]?.object,
                        "module": masterData[index]?.module,
                        "data_object_type": data_object,
                        "transformation_complexity": transComplexcity,
                        "load_complexity": loadComplexcity,
                        "source_complexity": sourceComplexcity,
                        "scope": scope,
                        "object_development": null,
                        "iteration_1_data_loading": null,
                        "iteration_1_defects": null,
                        "iteration_2_data_loading": null,
                        "iteration_2_defects": null,
                        "iteration_3_data_loading": null,
                        "iteration_3_defects": null,
                        "production_data_loads": null,
                        "total": 0
                    };
                    console.log(' final master data');
                    console.log(finalData);
                    const newData = [...masterData];
                    newData[index] = finalData;
                    console.log(newData);
                    // alert();
                    setMasterData(newData);
                }
            } catch (error) {
                console.error("Error updating data:", error);
                // Handle error
            } finally {

            }

        } else {
            const newData = [...masterData];
            newData[index][field] = value;
            // alert();
            setMasterData(newData);
            setLoading(false);
        }
    };

    const checkRequiredFields = (row) => {
        const requiredFields = ['transformation_complexity', 'load_complexity', 'source_complexity', 'scope'];
        for (const field of requiredFields) {
            if (!row[field]) {
                return false;
            }
        }
        return true;
    };

    const smoothScroll = () => {
        const smoothScrollTo = document.querySelector('.review-form');
        smoothScrollTo.scrollIntoView({ behavior: 'smooth' });
    };


    useEffect(() => {
        //
        setSelectedTable(tableName);
        try {
            // alert();
            setMasterData([]);
            axios.get('http://127.0.0.1:8000/table_get/').then(res => {
                console.log('response recieved successfully');
                console.log(res);
                setTables(res.data);
                console.log(tables);

            }).catch(err => {
                console.log(err);

            })
        } catch (err) {
            console.log(err);

        };
        handleTableChange(tableName);

    }, []);
    console.log(tables);
    const addRow = () => {
        // alert('hi');
        setTempMasterData(masterData)

        let updatedData = [{
            "Project": "",
            "AccountManager": "",
            "Skill": '',
            "Count": 0.0,
            "Date": '',
            "Status": '',
            "Comments": '',
            "PendingAction": ''
        }, ...masterData]
        console.log(updatedData)
        // setMasterData([]);
        // setTimeout(() => {
        //     setMasterData(updatedData);
        // }, 100);
        setMasterData(updatedData);
        console.log(masterData);
        // smoothScroll()  

    };

    const handleTableChange = (value) => {
        setSelectedTable(value);
        console.log(value);
        try {
            // fetching project specific data
            axios.get(`http://127.0.0.1:8000/table_data_get/${value}/`)
                .then((res) => {
                    // setSearchData([]);
                    let temp = res.data;
                    console.log(temp);
                    // setMasterData([]);
                    setMasterData([]);
                    setTimeout(() => {
                        setMasterData(temp);
                    }, 2);
                    // setMasterData([]); 
                    // let finalTemp = [];
                    // temp.forEach(element => {
                    //     // if (element?.scope.toLowerCase() === 'inscope') {
                    //     finalTemp.push(element);
                    // });
                    // console.log(finalTemp);

                    // setMasterData(finalTemp);
                    console.log(res);
                })
                .catch((err) => {
                    // fetching initial data
                    console.error('Error fetching data:', err);    //delete error}
                });
        } catch (err) {
            console.error('Error in useEffect:', err);
        }

    };
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        setSearchData([]);
    };
    const handleSearch = (e) => {
        console.log('handel search');
        let temp = []
        temp = masterData.filter((obj) => {
            return obj.Project.toLowerCase().includes(searchText.toLowerCase())
        })
        console.log(temp);
        setSearchData(temp);
    }


    const upload = () => {
        setcreatef(true);
    }

    const handleOk = () => {
        setcreatef(false);
    }


    const homeClick = () => {
        navigate(`/newProject/home/`);
    }
    useEffect(() => {
        if (tableRef.current) {
            tableRef.current.scrollTop = tableRef.current.scrollHeight; // Instant scroll
            //OR
            // tableRef.current.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
        }
    }, [masterData, searchData, inscopeData, outscopeData]); // Correct dependency array


    const schema = yup.object().shape({
        tableName: yup.string()
            .required('Table Name Required')
            .matches(/^(?!_)(?!.*_$)[a-zA-Z0-9_]+$/, 'Invalid Table Name'),
    });

    const formik = useFormik({
        initialValues: {
            tableName: "",
        },
        validationSchema: schema,
    });


    const handleUpload = (event) => {
        if (event?.target?.files) {
            setFile(event?.target?.files[0]);
            formik.values.uploaded_fileName = event?.target?.files[0]?.name
        }
    }

    const handleFileUpload = async () => {
        setLoad(true);
        if (!file) return;
        const formData = new FormData();
        formData.append('tableName', formik.values.tableName);
        formData.append('file', file);
        console.log(file)
        try {
            await axios.post('http://127.0.0.1:8000/postFile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // setTimeout(() => {
            // }, 1000);
            setFile();
            formik.resetForm();
            console.log(file);
            setLoad(false);
            messageApi.success('File Upload')
            handleOk();
        } catch (err) {
            setLoad(false);
            messageApi.error('Error Encountered')
        }
    }

    return (
        <>
            {contextHolder}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}><h1>Opportunity</h1></div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}> {/* Flexbox for alignment */}
                    <Select
                        style={{ width: 200, marginRight: '10px', marginBottom: '10px' }} // Add margin for spacing
                        placeholder="Select Table"
                        onChange={handleTableChange}
                        value={selectedTable}
                    >
                        {tables && tables.length > 0 ? (
                            tables.map((element) => (
                                <Option key={element.tableName} value={element.tableName}>
                                    {element.tableName}
                                </Option>
                            ))
                        ) : (
                            <Option value={null}>No tables available</Option>
                        )}
                    </Select>



                    <div>
                        {/* <HomeOutlined style={{ fontSize: '22px', marginRight: '10px' }} onClick={homeClick} /> */}
                        <Button
                            style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px', marginBottom: '10px' }}
                            onClick={upload}
                        >
                            Upload
                        </Button>
                        <Button
                            style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px', marginBottom: '10px' }}
                            onClick={addRow}
                        >
                            Add Row
                        </Button>

                        <Button
                            style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px', marginBottom: '10px' }}
                            onClick={handelSaveTable}
                        >
                            Save Table
                        </Button>

                        <Button
                            style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px', marginBottom: '10px' }}
                            onClick={handleExcel}
                        >
                            Export to excel
                        </Button>

                        <Button
                            style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px', marginBottom: '10px' }}
                            onClick={navigateToPlots}
                        >
                            Overall Status
                        </Button>

                    </div>

                    <Modal
                        open={createf}
                        footer={null}
                        onCancel={handleOk}
                        hideModal={handleOk}
                    >
                        <Spin spinning={load} tip="Uploading...">
                            <div>
                                {contextHolder}
                                <h3 className="text-center"> File</h3>
                                <form onSubmit={handleFileUpload} style={{ maxWidth: '600px', margin: '0 auto' }}>

                                    <div className="row mb-3">
                                        <label htmlFor="tableName" className="col-4 col-form-label">Table Name</label>
                                        <div className="col-8">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formik.values.tableName}
                                                name="tableName"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <div className="error" style={{ overflowX: "auto" }}>{formik.touched.tableName && formik.errors.tableName}</div>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <label htmlFor="filePath" className="col-4 col-form-label">File Path</label>
                                        <div className="col-8 d-flex align-items-center">
                                            <input
                                                className="form-control me-2"
                                                value={formik.values.uploaded_fileName}
                                                readOnly
                                                style={{ flex: '1 1 auto' }}
                                            />
                                            {<input
                                                type="file"
                                                className="form-control"
                                                hidden id="browse"
                                                onChange={handleUpload}
                                            />}
                                            {<label htmlFor="browse" className="form-control btn btn-outline-secondary" style={{ marginLeft: '5px' }}>
                                                Browse
                                            </label>
                                            }
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-end" style={{ marginTop: "10px" }}>
                                        <button type="submit" className="btn btn-primary">Upload</button>
                                    </div>
                                </form>
                            </div>
                        </Spin>
                    </Modal>

                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '25px', marginBottom: '10px', overflow: 'hidden' }}>
                        <Input
                            type="text"
                            placeholder="Search Projects"
                            value={searchText}
                            onChange={handleSearchChange}
                            onPressEnter={handleSearch}
                            style={{
                                border: 'none',
                                padding: '8px 12px',
                                flexGrow: 1,
                                borderRadius: 0,
                                boxShadow: 'none',
                                outline: 'none', // Optional: Remove focus outline
                            }}
                        />
                        <button
                            onClick={handleSearch}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 0,
                                outline: 'none', // Optional: Remove focus outline
                            }}
                        >
                            <SearchOutlined style={{ fontSize: '18px' }} />
                        </button>
                    </div>

                </div>
                <div style={{ maxHeight: '490px', width: '100%' }} className='tableDiv' ref={tableRef}>
                {/* <Table columns={columns} dataSource={tempData.map(item => ({ ...item}))} pagination={false} loading={loading} style={{ tableLayout: 'fixed', height: "100%" }}
                        scroll={{ y: `calc(100vh - 250px)` }} /> */}
                    {console.log(masterData)}
                    {searchData.length !== 0 && <Table columns={columns} dataSource={searchData.map(item => ({ ...item}))} pagination={false} loading={loading} style={{ tableLayout: 'fixed', height: "100%" }}
                        scroll={{ y: `calc(100vh - 250px)` }} />}
                    {searchData.length === 0 && <Table columns={columns} dataSource={tempData.map(item => ({ ...item}))} pagination={false} loading={loading} style={{ tableLayout: 'fixed', height: "100%" }}
                        scroll={{ y: `calc(100vh - 250px)` }} />}
                    
                    {/* {searchData.length === 0 && inscopeData.length > 0 ? <Table columns={columns} dataSource={inscopeData} pagination={false} loading={loading} style={{ tableLayout: 'fixed', height: "100%" }}
                    scroll={{ y: `calc(100vh - 250px)` }} /> : ''}
                {searchData.length === 0 && outscopeData.length > 0 ? <Table columns={columns} dataSource={outscopeData} pagination={false} loading={loading} style={{ tableLayout: 'fixed', height: "100%" }}
                    scroll={{ y: `calc(100vh - 250px)` }} /> : ''}
                {searchData.length === 0 && inscopeData.length === 0 && <Table className='review-form' columns={columns} dataSource={masterData} pagination={false} loading={loading} style={{ tableLayout: 'fixed', height: "100%", width: "100%", overflowX: "scroll" }}
                    scroll={{ y: `calc(100vh - 250px)` }} /> : ''} */}

                    {/* <Table columns={columns} dataSource={mData} pagination={false} loading={loading} />     */}
                </div>
                <div>
                    <Modal title="Basic Modal" open={showPop} onOk={handleSaveDuplicate} onCancel={handleCancel}>
                        <p>Duplicate Data exists. Do you want to save the recent data?</p>
                    </Modal>
                </div>
            </div>
        </>
    );


};

export default Tshirt;