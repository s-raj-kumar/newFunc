import React, { useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import { useFormik } from "formik";
import * as yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const FormFile = ({ handleOk }) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [fileType, setFileType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [sheets, setSheets] = useState([]);

    const fileTypes = ['Excel', 'Text', 'CSV'];

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
        onSubmit: () => {
            handleFileUpload()
        }
    });


    const handleUpload = (event) => {
        if (event?.target?.files) {
            setFile(event?.target?.files[0]);
            formik.values.uploaded_fileName = event?.target?.files[0]?.name
        }
    }

    const handleFileUpload = async () => {
        setLoading(true);
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
            
            setTimeout(() => {
            }, 1000);
            setFile();
            formik.resetForm();
            console.log(file);
            setLoading(false);
            messageApi.success('File Upload')
            handleOk();
        } catch (err) {
            setLoading(false);
            messageApi.error('Error Encountered')
        }
    }

    return (
        <Spin spinning={loading} tip="Uploading...">
            <div>
                {contextHolder}
                <h3 className="text-center"> File</h3>
                <form onSubmit={formik.handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>

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
    )
}

export default FormFile