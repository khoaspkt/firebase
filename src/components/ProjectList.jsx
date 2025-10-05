import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { List, ListItem, ListItemButton, ListItemText, Typography, Box } from '@mui/material';

// Component này nhận 2 props:
// - onProjectSelect: một hàm callback để báo cho component cha biết dự án nào đã được chọn
// - selectedProjectId: ID của dự án đang được chọn để highlight
const ProjectList = ({ onProjectSelect, selectedProjectId }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Tạo truy vấn để lấy các dự án đã xử lý xong
        const q = query(collection(db, "projects"), where("status", "==", "completed"));

        // Lắng nghe thay đổi dữ liệu thời gian thực
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const projectsData = [];
            querySnapshot.forEach((doc) => {
                projectsData.push({ id: doc.id, ...doc.data() });
            });
            setProjects(projectsData);
            setLoading(false);
        });

        // Dọn dẹp listener khi component bị unmount
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <Typography sx={{ p: 2 }}>Đang tải danh sách dự án...</Typography>;
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ p: 2 }}>
                Danh sách dự án
            </Typography>
            <List>
                {projects.map((project) => (
                    <ListItem key={project.id} disablePadding>
                        <ListItemButton
                            selected={project.id === selectedProjectId}
                            onClick={() => onProjectSelect(project.id)}
                        >
                            <ListItemText primary={project.projectName} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default ProjectList;