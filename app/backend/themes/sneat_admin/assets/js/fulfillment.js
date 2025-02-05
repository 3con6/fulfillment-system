
$('.form-select-color').select2({
    width: 'resolve' // need to override the changed default
});


// Function to handle the 'Fulfill' button click event
function handleFulfillButtonClick() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let order_id = urlParams.get('order_id');
    let print_provider_mongo_id = $('.print_provider-select').val();
    let line_items = [];

    $('.item').each(function (i) {
        var loop_index = (i + 1).toString();
        var quantity = $('#item-' + loop_index + ' .quantity').val();
        var product_ = $('#item-' + loop_index + ' .color-selects option:selected').val();
        var size = $('#item-' + loop_index + ' .size-selects option:selected').val();
        let link_des = $('#' + 'front' + '_canvas-' + loop_index + ' .des input').value;
        let thumbnail = $('#' + 'front' + '_canvas-' + loop_index + ' .thumbnail').value;
        const now = new Date();

        // Extract year, month, date, hour, and second components
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const date = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');

        // Create a formatted string
        const formattedTime = `${year}-${month}-${date} - ${hour}:${minute}:${second}`;

        var line_item = {
            "name": "Create Product At " + formattedTime,
            'quantity': quantity,
            'image': thumbnail,
            "attributes": [{
                "name": 'product',
                "option": product_
            }, {
                "name": 'size',
                "option": size
            }],
            "design_front": link_des
        };
        line_items.push(line_item);
    });

    var data = {
        'order_id': order_id,
        'line_items': line_items
    };

    // Send the fulfillment request
    $.ajax({
        type: "POST",
        url: "api/fulfill_merchize",
        data: JSON.stringify(data),
        success: function (response) {
            window.location.href = '/orders';
        },
        error: function (data) {
            alert(data.message);
        }
    });
}

// Event handler for 'Fulfill' button click
$('.btn-fulfill').on('click', handleFulfillButtonClick);


function process_Canvas(canvas, canvasId, link, canvas_scale, loop_index, querry) {
    let context = canvas.getContext("2d");

    let canvasOffset = $(querry).offset();
    if (!link) {
        return;
    }
    let offsetX = canvasOffset.left;
    let offsetY = canvasOffset.top;

    let startX;
    let startY;
    let isMouseDown = false;

    let pi2 = Math.PI * 2;
    let resizerRadius = 8;
    let rr = resizerRadius * resizerRadius;
    let draggingResizer = {
        x: 0,
        y: 0
    };
    let imgX = 0;
    let imgY = 0;
    let imgWidth, imgHeight, imgRight, imgBottom;
    let draggingImg = false;
    let ratio;

    let img = new Image();
    img.onload = function () {
        console.log('loaded img')
        ratio = img.width / img.height;
        imgWidth = canvas.width;
        imgHeight = imgWidth / ratio;
        imgRight = imgX + imgWidth;
        imgBottom = imgY + imgHeight;

        drawCanvas(true, false, true);
    };
    img.src = link;

    function drawCanvas(withAnchors, withBorders, withInput) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, img.width, img.height, imgX, imgY, imgWidth, imgHeight);
        if (withInput) {
            $("#" + canvasId + '-' + loop_index + '-img-x').val(imgX * canvas_scale);
            $("#" + canvasId + '-' + loop_index + '-img-y').val(imgY * canvas_scale);
            $("#" + canvasId + '-' + loop_index + '-img-w').val(imgWidth * canvas_scale);
            $("#" + canvasId + '-' + loop_index + '-img-h').val(imgHeight * canvas_scale);
        }

        if (withAnchors) {
            drawDragAnchor(imgX, imgY);
            drawDragAnchor(imgRight, imgY);
            drawDragAnchor(imgRight, imgBottom);
            drawDragAnchor(imgX, imgBottom);
        }

        if (withBorders) {
            context.beginPath();
            context.moveTo(imgX, imgY);
            context.lineTo(imgRight, imgY);
            context.lineTo(imgRight, imgBottom);
            context.lineTo(imgX, imgBottom);
            context.closePath();
            context.stroke();
        }
    }

    function drawDragAnchor(x, y) {
        context.beginPath();
        context.arc(x, y, resizerRadius, 0, pi2, false);
        context.closePath();
        context.fill();
    }

    function anchorHitTest(x, y) {
        let dx, dy;

        dx = x - imgX;
        dy = y - imgY;
        if (dx * dx + dy * dy <= rr) {
            return 0;
        }

        dx = x - imgRight;
        dy = y - imgY;
        if (dx * dx + dy * dy <= rr) {
            return 1;
        }

        dx = x - imgRight;
        dy = y - imgBottom;
        if (dx * dx + dy * dy <= rr) {
            return 2;
        }

        dx = x - imgX;
        dy = y - imgBottom;
        if (dx * dx + dy * dy <= rr) {
            return 3;
        }

        return -1;
    }

    function hitImage(x, y) {
        return x > imgX && x < imgX + imgWidth && y > imgY && y < imgY + imgHeight;
    }

    function handleMouseDown(e) {
        startX = parseInt(e.clientX - offsetX);
        startY = parseInt(e.clientY - offsetY);
        draggingResizer = anchorHitTest(startX, startY);
        draggingImg = draggingResizer < 0 && hitImage(startX, startY);

        // Set cursor styles for draggable elements
        if (draggingResizer >= 0 || draggingImg) {
            $('body').css('cursor', 'move');
            canvas.style.cursor = 'move';
        }
    }

    function handleMouseUp(e) {
        draggingResizer = -1;
        draggingImg = false;
        drawCanvas(true, false, true);

        // Reset cursor styles
        $('body').css('cursor', 'auto');
        canvas.style.cursor = 'auto';
    }

    function handleMouseOut(e) {
        handleMouseUp(e);
    }

    function handleMouseMove(e) {
        if (draggingResizer > -1) {
            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);

            switch (draggingResizer) {
                case 0:
                    imgX = mouseX;
                    imgWidth = imgRight - mouseX;
                    imgY = mouseY;
                    imgHeight = imgWidth / ratio;
                    break;
                case 1:
                    imgY = mouseY;
                    imgWidth = mouseX - imgX;
                    imgHeight = imgWidth / ratio;
                    break;
                case 2:
                    imgWidth = mouseX - imgX;
                    imgHeight = imgWidth / ratio;
                    break;
                case 3:
                    imgX = mouseX;
                    imgWidth = imgRight - mouseX;
                    imgHeight = imgWidth / ratio;
                    break;
            }

            if (imgWidth < 25) {
                imgWidth = 25;
            }
            if (imgHeight < 25) {
                imgHeight = 25;
            }

            imgRight = imgX + imgWidth;
            imgBottom = imgY + imgHeight;

            drawCanvas(true, true, true);
        } else if (draggingImg) {
            imageClick = false;

            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);

            let dx = mouseX - startX;
            let dy = mouseY - startY;
            imgX += dx;
            imgY += dy;
            imgRight += dx;
            imgBottom += dy;

            startX = mouseX;
            startY = mouseY;

            drawCanvas(false, true, true);
        }
    }

    $("#" + canvasId + '-' + loop_index + '-img-x').on('change', function () {
        imgX = $(this).val() / canvas_scale;
        imgRight = imgX + imgWidth;
        drawCanvas(true, true, false);
    });
    $("#" + canvasId + '-' + loop_index + '-img-y').on('change', function () {
        imgY = $(this).val() / canvas_scale;
        imgBottom = imgY + imgHeight;
        drawCanvas(true, true, false);
    });
    $("#" + canvasId + '-' + loop_index + '-img-w').on('change', function () {
        imgWidth = $(this).val() / canvas_scale;
        imgHeight = imgWidth / ratio;
        imgRight = imgX + imgWidth;
        imgBottom = imgY + imgHeight;
        drawCanvas(true, true, true);
    });
    $("#" + canvasId + '-' + loop_index + '-img-h').on('change', function () {
        imgHeight = $(this).val() / canvas_scale;
        imgWidth = imgHeight * ratio;
        imgRight = imgX + imgWidth;
        imgBottom = imgY + imgHeight;
        drawCanvas(true, true, true);
    });
    $("#" + canvasId + '_canvas-' + loop_index + ' .horizontal-left').on('click', function () {
        imgX = 0;
        imgRight = imgX + imgWidth;
        drawCanvas(true, false, true);
    });
    $("#" + canvasId + '_canvas-' + loop_index + ' .horizontal-center').on('click', function () {
        imgX = (canvas.width - imgWidth) / 2;
        imgRight = imgX + imgWidth;
        drawCanvas(true, false, true);
    });
    $("#" + canvasId + '_canvas-' + loop_index + ' .horizontal-right').on('click', function () {
        imgX = canvas.width - imgWidth;
        imgRight = imgX + imgWidth;
        drawCanvas(true, false, true);
    });
    $("#" + canvasId + '_canvas-' + loop_index + ' .vertical-top').on('click', function () {
        imgY = 0;
        imgBottom = imgY + imgHeight;
        drawCanvas(true, false, true);
    });
    $("#" + canvasId + '_canvas-' + loop_index + ' .vertical-center').on('click', function () {
        imgY = (canvas.height - imgHeight) / 2;
        imgBottom = imgY + imgHeight;
        drawCanvas(true, false, true);
    });
    $("#" + canvasId + '_canvas-' + loop_index + ' .vertical-bottom').on('click', function () {
        imgY = canvas.height - imgHeight;
        imgBottom = imgY + imgHeight;
        drawCanvas(true, false, true);
    });

    $(querry).mousedown(function (e) {
        handleMouseDown(e);
    });

    $(querry).mousemove(function (e) {
        handleMouseMove(e);
    });

    $(querry).mouseup(function (e) {
        handleMouseUp(e);
    });

    $(querry).mouseout(function (e) {
        handleMouseOut(e);
    });
}


// Event handler for "Add" button
$('.add').on('click', function () {
    let loop_index = $(this).index('.add');
    updateQuantity(loop_index, 1); // Increment quantity by 1
});

// Event handler for "Reduce" button
$('.reduce').on('click', function () {
    let loop_index = $(this).index('.reduce');
    let currentQuantity = parseInt($('.quantity-' + loop_index + ' input').val());

    if (currentQuantity > 1) {
        updateQuantity(loop_index, -1); // Decrement quantity by 1
    }
});

// Function to update quantity
function updateQuantity(loop_index, change) {
    let inputField = $('.quantity-' + loop_index + ' input');
    let currentQuantity = parseInt(inputField.val());
    let newQuantity = currentQuantity + change;

    if (newQuantity >= 1) {
        inputField.val(newQuantity);
    }
}


function handleProductSelection(loop_index, mongo_id, product_id) {
    $('#item-' + loop_index + ' .loading_spinner').show();

    $.ajax({
        url: '/api/get_ff_ngoai_variants',
        type: 'POST',
        data: JSON.stringify({ mongo_id: mongo_id, product_id: product_id }),
        success: function (response) {
            // Handle success for variants
            $.ajax({
                url: '/api/get_ff_ngoai_sizes',
                type: 'POST',
                data: JSON.stringify({ sizes: response.data.sizes, placeholders: response.data.placeholder }),
                success: function (response) {
                    // Handle success for sizes
                    handleSizeSelection(loop_index, response);
                },
                error: function (error) {
                    console.log(error);
                }
            });

            // Handle success for colors
            $.ajax({
                url: '/api/get_ff_ngoai_colors',
                type: 'POST',
                data: JSON.stringify({ colors: response.data.colors }),
                success: function (response) {
                    $('#item-' + loop_index + ' .color-selects').html(response);
                    $('#item-' + loop_index + ' .color-selects select').select2({
                        width: 'resolve'
                    });
                },
                error: function (error) {
                    console.log(error);
                }
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function handleSizeSelection(loop_index, response) {
    $('#item-' + loop_index + ' .size-selects').html(response.data.html);
    $('#item-' + loop_index + ' .size-selects select').select2({
        width: 'resolve'
    });
    $('#item-' + loop_index + ' .loading_spinner').hide();
    $('#item-' + loop_index + ' .color-selects').removeClass('visually-hidden');
    $('#item-' + loop_index + ' .size-selects').removeClass('visually-hidden');

    $('.size-select').on('select2:select', function (e) {
        // Handle size selection event
        var data_ = e.params.data;
        let loop_index_ = $('.size-select').index(this) + 1;
        var size_ = data_.id;
        var placeholder = response.data.placeholders;
        if (placeholder[size_]) {
            for (const [key, value] of Object.entries(placeholder[size_])) {
                if (key == 'all') {
                    key = 'front'
                }
                const classCheck = document.getElementById(key + '_canvas-' + loop_index_);
                if (classCheck) {
                    canvas_scale = value.width / 700;
                    $('#' + key + '_template').html(value.width.toString() + 'x' + value.height.toString());

                    // Select all canvas elements with the given class
                    var canvasElements = document.querySelectorAll('.' + key);

                    canvasElements.forEach(function (canvas) {
                        canvas.height = value.height / canvas_scale;
                        canvas.width = value.width / canvas_scale;
                        var link = document.querySelector('#' + key + '_canvas-' + loop_index_ + ' .des input').value;
                        var querry_canvas = '#' + key + '_canvas-' + loop_index_ + ' .' + key;
                        console.log(querry_canvas)
                        process_Canvas(canvas, key, link, canvas_scale, loop_index_, querry_canvas);
                    });
                }
            }
        }
    });
}

// Event handler for provider selection
$('.print_provider-select').on('select2:select', function (e) {
    var data = e.params.data;
    var mongo_id = data.id;
    $('.loading_spinner').show();

    $.ajax({
        url: '/api/get_products_ff_ngoai',
        type: 'POST',
        data: JSON.stringify({ mongo_id: mongo_id }),
        success: function (response) {
            // Handle success for provider selection
            $('.product-selects').html(response);
            $('.product-selects .form-select-color').select2({
                width: 'resolve'
            });

            // Event handler for product selection
            $('.products-select').on('select2:select', function (e) {
                var loop_index = $('.products-select').index(this) + 1;
                var data_ = e.params.data;
                var product_id = data_.id;
                handleProductSelection(loop_index, mongo_id, product_id);
            });

            $('.loading_spinner').hide();
            $('.product-selects').removeClass('visually-hidden');
        },
        error: function (error) {
            console.log(error);
        }
    });
});


$('.design-image').on('click', function () {
    // Lấy đường dẫn của ảnh được chọn
    var selectedImage = $(this).data('src');

    // Thêm class checked vào ảnh được chọn và bỏ class checked của các ảnh khác
    $('.design-image').removeClass('checked');
    $(this).addClass('checked');

    // Hiển thị ảnh được chọn trong input
    $('#design-image').val(selectedImage);
});

// Bắt sự kiện khi người dùng chọn nút "Chọn" trong modal
$('#chose-design-1').on('click', function () {
    // Đóng modal
    $('#design-modal-1').modal('hide');
});
$('#chose-design-2').on('click', function () {
    // Đóng modal
    $('#design-modal-2').modal('hide');
});
