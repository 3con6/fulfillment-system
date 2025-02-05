// Gắn sự kiện click cho nút "Download"
$("#export").click(function(e) {
    e.preventDefault(); // Ngăn chặn hành động mặc định của nút submit

    // Lấy giá trị của các trường select
    const dateValue = $("#date-range-picker-3").val();
    const teamValue = $("#team").val();
    const typeValue = $("#type").val();

    // Kiểm tra giá trị
    if (teamValue === '' || typeValue === '') {
        // Nếu một trong các trường select không có giá trị
        alert("Vui lòng chọn giá trị cho tất cả các trường.");
    } else {
        // Nếu tất cả các trường select đều có giá trị
        const filename = "export_data_" + teamValue + "_" + dateValue + ".xlsx";
        // show loading
        $(".loading_spinner").show();

        // Gửi dữ liệu lên /api/export_data
        $.ajax({
            url: "/api/export_data",
            method: "POST", // Hoặc "GET" nếu phù hợp
            data: JSON.stringify({
                date: dateValue,
                team: teamValue,
                type: typeValue
            }),
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response) {
                // Tâi file
                const blobURL = URL.createObjectURL(response);

                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobURL;
                a.download = filename;
                document.body.appendChild(a);

                a.click();

                document.body.removeChild(a);

                // Ẩn loading
                $(".loading_spinner").hide();
            },
            error: function(xhr, status, error) {
                // Xử lý lỗi nếu cần
                alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
                // Ẩn loading
                $(".loading_spinner").hide();
            }
        });
    }
});