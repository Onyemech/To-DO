import React, { useEffect, useState } from 'react';
import NavBar from "../../components/NavBar.jsx";
import styles from "./Todo.module.css";
import { Button, Divider, Input, message, Modal, Tag, Tooltip } from "antd";
import { getErrorMessage } from "../../util/GetError.js";
import { getFormattedDate } from "../../util/GetFormattedDate.js";
import TodoServices from "../../services/toDoServices.js";
import { useNavigate } from "react-router-dom";
import { CheckCircleFilled, DeleteOutlined, EditOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/authContext.jsx";

export default function ToDoList() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allToDo, setAllToDo] = useState([]);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const { user } = useAuth();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user?.userId) {
                    const response = await TodoServices.getAllTToDo(user.userId);
                    setAllToDo(response.data || []);
                } else {
                    setAllToDo([]);
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();

        const handleAuthChange = () => fetchTasks();
        window.addEventListener('authChange', handleAuthChange);

        return () => window.removeEventListener('authChange', handleAuthChange);
    }, [user?.userId]);

    const handleSubmitTask = async () => {
        setLoading(true);
        try {
            if (!user?.token) {
                messageApi.error("Please login first");
                return navigate("/login");
            }
            if (!title.trim()) {
                throw new Error("Title is required");
            }

            const data = {
                title: title.trim(),
                description: description.trim(),
                isCompleted: false,
                createdBy: user.userId
            };

            const response = await TodoServices.createToDo(data);
            setAllToDo(prev => [...prev, response.data]);
            messageApi.success("Task Added Successfully");
            setIsAdding(false);
            setTitle("");
            setDescription("");
        } catch (err) {
            messageApi.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        console.log("Editing:", item);
    };

    const handleDelete = async (item) => {
        try {
            await TodoServices.deleteToDo(item._id);
            setAllToDo(prev => prev.filter(task => task._id !== item._id));
            messageApi.success("Task Deleted Successfully");
        } catch (err) {
            messageApi.error(getErrorMessage(err));
        }
    };

    const handleUpdateStatus = async (item) => {
        try {
            if (!item?._id) {
                throw new Error("Task ID is missing");
            }
            const response = await TodoServices.updateToDo(item._id, {
                isCompleted: !item.isCompleted
            });
            setAllToDo(prev => prev.map(task =>
                task._id === item._id ? { ...task, isCompleted: !item.isCompleted } : task
            ));
            messageApi.success("Task status updated successfully");
        } catch (err) {
            messageApi.error(getErrorMessage(err));
        }
    };

    return (
        <>
            {contextHolder}
            <NavBar active={"myTask"} />
            <section className={styles.toTaskWrapper}>
                <div className={styles.toDoHeader}>
                    <h2>Your Tasks</h2>
                    <Input
                        className={styles.searchInput}
                        placeholder="Search Your Task Here..."
                    />
                    <Button
                        onClick={() => setIsAdding(true)}
                        type="primary"
                        size="large"
                    >
                        Add Task
                    </Button>
                </div>
                <Divider/>

                <div className={styles.tasksContainer}>
                    {allToDo.length > 0 ? (
                        allToDo.map((item) => (
                            <div key={item._id} className={styles.toDoCard}>
                                <div className={styles.toDoCardHeader}>
                                    <h3>{item.title}</h3>
                                    <Tag color={item.isCompleted ? "green" : "red"}>
                                        {item.isCompleted ? "Completed" : "Pending"}
                                    </Tag>
                                </div>
                                <p>{item.description}</p>
                                <div className={styles.toDoCardFooter}>
                                    <Tag>{getFormattedDate(item.createdAt)}</Tag>
                                    <div className={styles.toDoFooterAction}>
                                        <Tooltip title="Edit Task">
                                            <EditOutlined
                                                onClick={() => handleEdit(item)}
                                                className={styles.actionIcon}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Delete Task">
                                            <DeleteOutlined
                                                onClick={() => handleDelete(item)}
                                                className={styles.actionIcon}
                                                style={{color: 'red'}}
                                            />
                                        </Tooltip>
                                        <Tooltip title={item.isCompleted ? "Mark as Incomplete" : "Mark as Complete"}>
                                            {item.isCompleted ? (
                                                <CheckCircleFilled
                                                    onClick={() => handleUpdateStatus(item)}
                                                    className={styles.actionIcon}
                                                    style={{color: 'green'}}
                                                />
                                            ) : (
                                                <CheckCircleOutlined
                                                    onClick={() => handleUpdateStatus(item)}
                                                    className={styles.actionIcon}
                                                />
                                            )}
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No tasks found. Add your first task!</p>
                            <Button
                                type="primary"
                                onClick={() => setIsAdding(true)}
                                style={{marginTop: '1rem'}}
                            >
                                Create Task
                            </Button>
                        </div>
                    )}
                </div>

                <Modal
                    title="Add New Task"
                    open={isAdding}
                    onOk={handleSubmitTask}
                    onCancel={() => setIsAdding(false)}
                    confirmLoading={loading}
                >
                    <Input
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{marginBottom: '1rem'}}
                    />
                    <Input.TextArea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                </Modal>
            </section>
        </>
    );
}