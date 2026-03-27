# Sử dụng image Nginx siêu nhẹ
FROM nginx:alpine

# Xóa file config mặc định của Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy file cấu hình Nginx của mình vào
COPY nginx.conf /etc/nginx/conf.d

# Copy toàn bộ code đã build (từ thư mục dist) vào thư mục chạy web của Nginx
# Lưu ý: Nếu dùng Create React App, đổi chữ 'dist' thành 'build'
COPY dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]