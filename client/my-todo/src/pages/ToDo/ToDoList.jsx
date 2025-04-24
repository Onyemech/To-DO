import React, { useEffect, useState } from 'react';
import NavBar from "../../components/NavBar.jsx";
import styles from "./Todo.module.css";
import { Button, DatePicker, Divider, Input, message, Modal, Select, Tag, Tooltip } from "antd";
import { getErrorMessage } from "../../util/GetError.js";
import TodoServices from "../../services/toDoServices.js";
import { useNavigate } from "react-router-dom";
import { CheckCircleFilled, DeleteOutlined, EditOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/authContext.jsx";
import oops from "../../assets/opps.gif";
import moment from 'moment';

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
    const [reminderTime, setReminderTime] = useState(null);
    const [editReminderTime, setEditReminderTime] = useState(null);
    const { user } = useAuth();
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            if (!user?.token) {
                if (!hasRedirected) {
                    messageApi.error("Please login first");
                    setHasRedirected(true);
                    setTimeout(() => navigate("/login"), 3000);
                }
                return false;
            }

            if (user?.expiresIn && user.expiresIn < Date.now()) {
                if (!hasRedirected) {
                    messageApi.error("Session expired. Please login again");
                    setHasRedirected(true);
                    setTimeout(() => {
                        localStorage.removeItem('user');
                        navigate("/login");
                    }, 1500);
                }
                return false;
            }
            return true;
        };

        const fetchTasks = async () => {
            if (!(await checkSession())) {
                setAllToDo([]);
                return;
            }
            try {
                setLoading(true);
                const response = await TodoServices.getAllToDo(user.userId);
                const tasks = response.data?.data || response.data || [];
                setAllToDo(tasks);
            } catch (error) {
                if (error.message === "Invalid/Expired token") {
                    if (!hasRedirected) {
                        messageApi.error("Session expired. Please login again");
                        setHasRedirected(true);
                        setTimeout(() => {
                            localStorage.removeItem('user');
                            navigate("/login");
                        }, 2000);
                    }
                } else {
                    console.error("Error fetching tasks:", error);
                    messageApi.error(getErrorMessage(error));
                    setAllToDo([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [user?.userId, user?.token, user?.expiresIn, messageApi, navigate, hasRedirected]);

    useEffect(() => {
        const initializeOneSignal = async () => {
            const waitForOneSignal = () => new Promise((resolve, reject) => {
                const check = () => {
                    if (window.OneSignal) {
                        resolve();
                    } else if (Date.now() - startTime > 30000) {
                        reject(new Error('OneSignal SDK failed to load within 30 seconds'));
                    } else {
                        setTimeout(check, 100);
                    }
                };
                const startTime = Date.now();
                check();
            });

            try {
                await waitForOneSignal();
                console.log('OneSignal loaded');

                await window.OneSignal.init({
                    appId: '1d1f6414-0e0a-4031-aa80-3ed678c28a3b',
                    allowLocalhostAsSecureOrigin: true,
                });

                const permission = await window.OneSignal.Notifications.permission;
                if (permission === 'default') {
                    await window.OneSignal.showSlidedownPrompt();
                }

                const playerId = await window.OneSignal.getUserId();
                if (playerId) {
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (user?.userId) {
                        await fetch('http://localhost:5000/api/update-player-id', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${user.token}`,
                            },
                            body: JSON.stringify({ playerId }),
                        });
                    }
                }

                window.OneSignal.on('subscriptionChange', async (isSubscribed) => {
                    if (isSubscribed) {
                        const newPlayerId = await window.OneSignal.getUserId();
                        if (newPlayerId) {
                            const user = JSON.parse(localStorage.getItem('user'));
                            if (user?.userId) {
                                await fetch('http://localhost:5000/api/update-player-id', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${user.token}`,
                                    },
                                    body: JSON.stringify({ playerId: newPlayerId }),
                                });
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('OneSignal init failed:', error);
                message.error("Failed to initialize notifications.");
            }
        };

        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.token) {
            initializeOneSignal();
        }
    }, []);


    const handleExpiredToken = () => {
        if (!user?.token) {
            if (!hasRedirected) {
                messageApi.error("Please login again");
                setHasRedirected(true);
                setTimeout(() => navigate("/login"), 2000);
            }
            return true;
        }
        if (user?.expiresIn && user.expiresIn < Date.now()) {
            if (!hasRedirected) {
                messageApi.error("Session expired. Please login again");
                setHasRedirected(true);
                setTimeout(() => navigate("/login"), 1500);
            }
            return true;
        }
        return false;
    };

    useEffect(() => {
        const pending = allToDo.filter(task => !task.isCompleted);
        const completed = allToDo.filter(task => task.isCompleted);
        setFilteredTasks(selectedFilter === "pending" ? pending : completed);
        setFilteredTodo([]);
    }, [selectedFilter, allToDo]);

    const handleSubmitTask = async () => {
        if (handleExpiredToken()) return;
        setLoading(true);
        try {
            if (!title.trim()) {
                throw new Error("Title is required");
            }

            const data = {
                title: title.trim(),
                description: description.trim(),
                isCompleted: false,
                createdBy: user.userId,
                ...(reminderTime && { reminder: reminderTime.toDate().toISOString() })
            };

            const response = await TodoServices.createToDo(data);
            setAllToDo(prev => [...prev, response.data]);
            messageApi.success("Task Added Successfully");
            setIsAdding(false);
            setTitle("");
            setDescription("");
            setReminderTime(null);
        } catch (err) {
            messageApi.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async () => {
        if (handleExpiredToken()) return;
        setEditLoading(true);
        try {
            if (!editingTask?._id) throw new Error("No task selected");

            const updatedData = {
                title: editTitle.trim(),
                description: editDescription.trim(),
                ...(editReminderTime && { reminder: editReminderTime.toDate().toISOString() })
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
        if (handleExpiredToken()) return;
        try {
            await TodoServices.deleteToDo(item._id);
            setAllToDo(prev => prev.filter(task => task._id !== item._id));
            messageApi.success("Task Deleted Successfully");
        } catch (err) {
            messageApi.error(getErrorMessage(err));
        }
    };

    const handleUpdateStatus = async (item) => {
        if (handleExpiredToken()) return;
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

    const handleEdit = (item) => {
        setEditingTask(item);
        setEditTitle(item.title);
        setEditDescription(item.description);
        setEditReminderTime(item.reminder ? moment(item.reminder) : null);
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
                        style={{ width: 180, marginRight: 10 }}
                        onChange={(value) => setSelectedFilter(value)}
                        size={"large"}
                        options={[
                            { value: "pending", label: 'Pending' },
                            { value: "completed", label: 'Completed' }
                        ]}
                    />
                </div>
                <Divider />

                <div className={styles.tasksContainer}>
                    {(filteredTodo.length > 0 || filteredTasks.length > 0) ? (
                        (filteredTodo.length > 0 ? filteredTodo : filteredTasks).map((item) => (
                            <div key={item._id} className={styles.toDoCard}>
                                <div className={styles.toDoCardHeader}>
                                    <h3>{item.title}</h3>
                                    <Tag color={item.isCompleted ? "green" : "red"}>
                                        {item.isCompleted ? "Completed" : "Pending"}
                                    </Tag>
                                </div>
                                <p>{item.description}</p>
                                <div className={styles.toDoCardFooter}>
                                    <div className={styles.dateTags}>
                                        <Tag className={styles.dateTag}>
                                            Created {moment(item.createdAt).format('YYYY MMM D, h:mm A')}
                                        </Tag>
                                        {item.reminder && (
                                            <Tag className={styles.reminderTag}>
                                                Reminder {moment(item.reminder).format('YYYY MMM D, h:mm A')}
                                            </Tag>
                                        )}
                                    </div>
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
                                                style={{ color: 'red' }}
                                            />
                                        </Tooltip>
                                        <Tooltip title={item.isCompleted ? "Mark as Incomplete" : "Mark as Complete"}>
                                            {item.isCompleted ? (
                                                <CheckCircleFilled
                                                    onClick={() => handleUpdateStatus(item)}
                                                    className={styles.actionIcon}
                                                    style={{ color: 'green' }}
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
                            <p>No data</p>
                            <img src={oops} alt="No tasks" />
                            <Button
                                type="primary"
                                onClick={() => setIsAdding(true)}
                                style={{ marginTop: '1rem' }}
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
                        style={{ marginBottom: '1rem' }}
                    />
                    <Input.TextArea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                    <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        onChange={(date) => setReminderTime(date)}
                        style={{ marginBottom: '1rem', width: '100%' }}
                        placeholder="Set Reminder (optional) HH:MM"
                    />
                </Modal>

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
                        placeholder="Description (Optional)"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={4}
                    />
                    <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        value={editReminderTime ? moment(editReminderTime) : null}
                        onChange={(date) => setEditReminderTime(date)}
                        style={{ marginBottom: '1rem', width: '100%' }}
                        placeholder="Set Reminder (optional)"
                    />
                </Modal>
            </section>
        </>
    );
}