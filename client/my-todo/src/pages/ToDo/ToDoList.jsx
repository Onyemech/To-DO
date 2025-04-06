import React, { useEffect, useState } from 'react';
import NavBar from "../../components/NavBar.jsx";
import styles from "./Todo.module.css";
import {Button, Divider, Input, message, Modal, Select, Tag, Tooltip} from "antd";
import { getErrorMessage } from "../../util/GetError.js";
import { getFormattedDate } from "../../util/GetFormattedDate.js";
import TodoServices from "../../services/toDoServices.js";
import { useNavigate } from "react-router-dom";
import { CheckCircleFilled, DeleteOutlined, EditOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/authContext.jsx";
import oops from "../../assets/opps.gif"

export default function ToDoList() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allToDo, setAllToDo] = useState([]);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("pending");
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [filteredTodo, setFilteredTodo] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user?.userId) {
                setAllToDo([]);
                return;
            }
            try {
                setLoading(true);
                const response = await TodoServices.getAllToDo(user.userId);
                const tasks = response.data?.data || response.data || [];
                setAllToDo(tasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
                setAllToDo([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [user?.userId]);

    useEffect(() => {
        const pending = allToDo.filter(task => !task.isCompleted);
        const completed = allToDo.filter(task => task.isCompleted);
        setFilteredTasks(selectedFilter === "pending" ? pending : completed);
        setFilteredTodo([]);
    }, [selectedFilter, allToDo]);

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
        setEditingTask(item);
        setEditTitle(item.title);
        setEditDescription(item.description);
    };

    const handleEditSubmit = async () => {
        setEditLoading(true);
        try {
            if (!editingTask?._id) throw new Error("No task selected");

            const updatedData = {
                title: editTitle.trim(),
                description: editDescription.trim()
            };

            const response = await TodoServices.updateToDo(
                editingTask._id,
                updatedData,
                'content'
            );

            setAllToDo(prev => prev.map(task =>
                task._id === editingTask._id ? response.data : task
            ));

            messageApi.success("Task updated successfully");
            setEditingTask(null);
        } catch (err) {
            messageApi.error(getErrorMessage(err));
        } finally {
            setEditLoading(false);
        }
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
            const response = await TodoServices.updateToDo(
                item._id,
                { isCompleted: !item.isCompleted },
                'status'
            );
            setAllToDo(prev => prev.map(task =>
                task._id === item._id ? { ...task, isCompleted: !item.isCompleted } : task
            ));
            messageApi.success("Task status updated successfully");
        } catch (err) {
            messageApi.error(getErrorMessage(err));
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            setFilteredTodo([]);
            return;
        }
        const filteredList = allToDo.filter(task =>
            task.title.toLowerCase().includes(query)
        );
        setFilteredTodo(filteredList);
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
                        onChange={handleSearch}
                        placeholder="Search for Your Existing Task Here..."
                    />
                    <Button
                        onClick={() => setIsAdding(true)}
                        type="primary"
                        size="large"
                    >
                        Add Task
                    </Button>
                    <Select
                        value={selectedFilter}
                        style={{width:180, marginRight: 10}}
                        onChange={(value) => setSelectedFilter(value)}
                        size={"large"}
                        options={[
                            {value:"pending",label:'Pending'},
                            {value:"completed",label:'Completed'}
                        ]}
                    />
                </div>
                <Divider/>

                <div className={styles.tasksContainer}>
                    {(filteredTodo.length > 0 || filteredTasks.length > 0) ? (
                        filteredTodo.length > 0 ? filteredTodo : filteredTasks).map((item) => (
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
                        )
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No data</p>
                            <img src={oops}/>
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
            <Modal
                title="Edit Task"
                open={!!editingTask}
                onOk={handleEditSubmit}
                onCancel={() => setEditingTask(null)}
                confirmLoading={editLoading}
            >
                <Input
                    placeholder="Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ marginBottom: '1rem' }}
                />
                <Input.TextArea
                    placeholder="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                />
            </Modal>
        </>
    );
}