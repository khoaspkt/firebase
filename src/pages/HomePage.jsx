import React, { useState } from 'react';
import { Box, Drawer, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import Map from '../components/Map';
import ProjectList from '../components/ProjectList';
import { db } from '../firebaseConfig'; // <-- Thêm import db
import { collection, query, where, getDocs, limit } from "firebase/firestore"; // <-- Thêm các import cần thiết

const drawerWidth = 300;

const HomePage = () => {
    // State để lưu ID của dự án đang được chọn
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    // STATE MỚI: Để lưu tọa độ trung tâm của dự án được chọn
    const [projectCenter, setProjectCenter] = useState(null);

    // HÀM ĐƯỢC NÂNG CẤP: Giờ sẽ là hàm async để lấy dữ liệu
    const handleProjectSelect = async (projectId) => {
        // Nếu người dùng click lại vào dự án đã chọn thì không làm gì cả
        if (projectId === selectedProjectId) return;

        setSelectedProjectId(projectId);

        // --- BẮT ĐẦU LOGIC MỚI ---
        // 1. Tạo truy vấn để tìm đường line đầu tiên của dự án
        const linesQuery = query(
            collection(db, "lines"), 
            where("projectId", "==", projectId),
            limit(1) // Chỉ cần lấy 1 đường là đủ
        );
        
        // 2. Thực thi truy vấn
        const linesSnapshot = await getDocs(linesQuery);

        // 3. Lấy tọa độ điểm đầu tiên và cập nhật state
        if (!linesSnapshot.empty) {
            const firstLineData = linesSnapshot.docs[0].data();
            // Ưu tiên lấy từ mảng chi tiết nhất (waypoints_full)
            const points = firstLineData.waypoints_full; 
            if (points && points.length > 0) {
                const firstPoint = points[0];
                // Cập nhật state projectCenter, Map sẽ tự động zoom theo
                setProjectCenter([firstPoint.lat, firstPoint.lng]);
            }
        }
        // --- KẾT THÚC LOGIC MỚI ---
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Bản đồ lưới điện
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <ProjectList 
                    onProjectSelect={handleProjectSelect}
                    selectedProjectId={selectedProjectId}
                />
            </Drawer>
            <Box
                component="main"
                sx={{ flexGrow: 1, height: '100vh', p: 0 }}
            >
                <Toolbar />
                {/* TRUYỀN PROP MỚI: Truyền tọa độ trung tâm xuống cho Map */}
                <Map projectId={selectedProjectId} projectCenter={projectCenter} />
            </Box>
        </Box>
    );
};

export default HomePage;
