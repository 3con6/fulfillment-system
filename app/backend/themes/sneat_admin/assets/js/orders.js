$(document).ready(function () {
    $('.js-example-basic-multiple').select2({
        width: 'resolve' // need to override the changed default
    });

    $('.custom-option-group').each(function () {
        var $group = $(this);

        $group.find('.custom-option-icon').on('click', function () {
            $('.custom-option-icon').removeClass('checked');
            $(this).addClass('checked');
        });
    });
    var barcodeSlider = document.getElementById("totalBarcode");
    var barcodeOutput = document.getElementById("barcodeValue");
    if (barcodeSlider) {
        barcodeSlider.oninput = function () {
            barcodeOutput.innerHTML = this.value;
        }
    }

    function truncateText(element) {
        var text = element.data('bs-original-title')
        console.log(text)
        copyToClipboardAndShowMessage(text, element);

    }

    // function truncateAndCopyText(element) {
    //     truncateText(element);
    // }
    $('[data-toggle="tooltip"]').tooltip();
    // truncateAndCopyText();
    $('.personalization').on('click', function () {
        truncateText($(this));
    });
    $('.bx-note').on('click', function () {
        truncateText($(this));
    });


    function copyToClipboardAndShowMessage(text, element) {
        // var $temp = $('<input>');
        // $('body').append($temp);
        // $temp.val(text).select();
        // document.execCommand('copy');
        // $temp.remove();
        navigator.clipboard.writeText(text);
        // Hiển thị thông báo "Copied!" bên cạnh phần tử
        $(element).after('<span class="text-danger" style="margin-left: 5px; font-size: 10px;">Copied!</span>');
        setTimeout(function () {
            $(element).next('span').remove();
        }, 1500);
    };

    // Function to extract data from the checkboxes and call the printBarcodes function
    function handleBarcodePrinting(totalBarcode) {
        let selectedCheckboxes = $('#table_products').find('td:first-child input[type="checkbox"]:checked');
        let selectedValues = [];

        selectedCheckboxes.each(function () {
            const orderId = $(this).data('order-id');
            const name = $(this).data('customer');
            const seller_id = $(this).data('seller-id');

            selectedValues.push({ orderId: orderId, name: name, seller_id: seller_id, totalBarcode: totalBarcode });

        });

        if (selectedCheckboxes.length < 1) {
            alert('Please select at least 1 order');
            return false;
        }

        // ajax call to get the barcode data
        $.ajax({
            url: '/api/get_barcode_data',
            type: 'POST',
            data: JSON.stringify({
                selectedValues: selectedValues,
            }),
            success: function (response) {
                // Call the function to display the barcode popup
                showBarcodePopup(response);
            },
            error: function (error) {
                console.log('error', error)
            }
        });
    };

    // Function to display the barcode popup
    function showBarcodePopup(response) {
        // Create a new window as a popup
        var popupWindow = window.open('', '', 'width=600,height=400');

        // Loop through each barcodeData in the response
        response.barcodeData.forEach(function (item, index) {
            // Create a div for the barcode container
            var barcodeContainer = document.createElement('div');
            barcodeContainer.className = 'barcode-container';

            // Create a div for the barcode image
            var div = document.createElement('div');
            div.innerHTML = item.barcodeSvg;

            // Append the barcode image to the barcode container
            barcodeContainer.appendChild(div);

            // Append the barcode container to the popup window
            popupWindow.document.body.appendChild(barcodeContainer);

            // Use html2canvas to convert the barcode container to an image
            html2canvas(barcodeContainer).then(function (canvas) {
                // Clear the barcode container
                barcodeContainer.innerHTML = '';

                // Append the canvas (image) to the barcode container
                barcodeContainer.appendChild(canvas);

                // Add a page break after each barcode (except the last one)
                if (index < response.barcodeData.length - 1) {
                    var pageBreak = document.createElement('div');
                    pageBreak.style.pageBreakAfter = 'always';
                    barcodeContainer.appendChild(pageBreak);
                }

                // Add a print class to the barcode container for printing
                barcodeContainer.classList.add('print');
            });
        });

        // Use html2canvas to convert the HTML content to an image
        html2canvas(popupWindow.document.body).then(function (canvas) {
            // Clear the popup window
            popupWindow.document.body.innerHTML = '';

            // Append the canvas (image) to the popup window
            popupWindow.document.body.appendChild(canvas);

            // Print the popup window
            popupWindow.print();
        });
    }


    // Call the handleBarcodePrinting function when the "Print barcode" button is clicked
    $('#printBarcodeButton').on('click', function (e) {
        e.preventDefault();

        // get value from id totalBarcode
        let totalBarcode = $('#totalBarcode').val();
        handleBarcodePrinting(totalBarcode);
    });


    function substringMatcher(strs) {
        return function findMatches(q, cb) {
            var matches, substrRegex;
            matches = [];
            substrRegex = new RegExp(q, 'i');
            $.each(strs, function (i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    function showModalWithImages(images, template, orderId, productId, lineItemId, includeApproveButton, order_id) {
        const modalBody = $('#linkDesModal .modal-body');
        modalBody.empty();
        modalBody.addClass('row').addClass('text-center');

        const h4 = $('<h4></h4>').text(order_id).addClass('text-center text-danger');
        const h5 = $('<h5></h5>').text(template.product_template_width + 'x' + template.product_template_height).addClass('text-center');
        modalBody.append(h4);
        modalBody.append(h5);

        let colClass;

        if (images.length === 1) {
            colClass = 'col-12 mb-3';
        } else if (images.length % 3 === 0) {
            colClass = 'col-md-4 mb-3';
        } else if (images.length % 4 === 0) {
            colClass = 'col-md-3 mb-3';
        } else {
            colClass = 'col-md-3 mb-3';
        }


        if (orderId) {
            images.forEach(function (image) {
                let div;
                if (image.link.toLowerCase().endsWith('.pdf')) {

                    div = $('<div></div>')
                    const embedContainer = $('<div></div>').addClass('pdf-embed-container');
                    const embed = $('<embed>').attr('src', image.link).attr('type', 'application/pdf').addClass('pdf-embed');
                    embedContainer.append(embed);
                    div.append(embedContainer);
                } else {
                    div = $('<div></div>').addClass(colClass);
                    const img = $('<img>').attr('src', image.link).addClass('img-fluid modal-image').css('box-shadow', '0 2px 20px 0 rgba(67,89,113,.45)');
                    const small1 = $('<small></small>').text(image.width + 'x' + image.height + ' px').addClass('text-muted');
                    const small2 = $('<small></small>').text(image.width_mm + 'x' + image.height_mm + ' mm').addClass('text-muted');
                    const small3 = $('<small></small>').text(image.width_inch + 'x' + image.height_inch + ' inch').addClass('text-muted');
                    const fileName = image.link.split('/').pop();
                    const small4 = $('<small></small>').text(fileName).addClass('text-muted');


                    const downloadLink = $('<a target="_blank"></a>')
                        .attr({
                            'href': image.link,
                            'download': fileName
                        })
                        .addClass('download-link')
                        .append(img);

                    div.append(downloadLink).append('<hr>').append(small1);
                    div.append(downloadLink).append(small2).append('<br>').append(small3).append(small4).append('<hr>');
                }

                modalBody.append(div);
            });
        } else {
            images.forEach(function (image) {
                let div;
                if (image.link.toLowerCase().endsWith('.pdf')) {
                    div = $('<div></div>')
                    const embedContainer = $('<div></div>').addClass('pdf-embed-container');
                    const embed = $('<embed>').attr('src', image.link).attr('type', 'application/pdf').addClass('pdf-embed');
                    embedContainer.append(embed);
                    div.append(embedContainer);
                } else {
                    div = $('<div></div>').addClass(colClass);
                    const img = $('<img>').attr('src', image.link).addClass('img-fluid modal-image').css('box-shadow', '0 2px 20px 0 rgba(67,89,113,.45)');
                    const fileName = image.link.split('/').pop();
                    const small1 = $('<small></small>').text(image.width_mm + 'x' + image.height_mm + ' mm').addClass('text-muted');
                    const small2 = $('<small></small>').text(fileName).addClass('text-muted');

                    const downloadLink = $('<a target="_blank"></a>')
                        .attr({
                            'href': image.link,
                            'download': fileName
                        })
                        .addClass('download-link')
                        .append(img);

                    div.append(downloadLink).append('<hr>').append(small1);
                    div.append(downloadLink).append(small2).append('<br>').append('<hr>');
                }

                modalBody.append(div);
            });
        }

        if (includeApproveButton) {
            const btn = `
            <div class="text-center mt-3">
                <button type="button" class="btn btn-primary" data-order-id="${orderId}" data-product-id="${productId}" data-lineitem-id="${lineItemId}" id="approve">Approve</button>
                <button type="button" class="btn btn-danger" data-order-id="${orderId}" data-product-id="${productId}" data-lineitem-id="${lineItemId}" id="reject">Reject</button>
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;
            modalBody.append(btn);
        }

        $('#linkDesModal').modal('show');
    }

    function fetchImageInfo(link, product_type, successCallback, errorCallback) {
        $.ajax({
            url: '/api/get_image_info',
            type: 'POST',
            data: JSON.stringify({ link: link, product_type: product_type }),
            success: successCallback,
            error: errorCallback
        });
    };

    function updateURLParameters(newParams) {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        // Xóa tất cả các tham số lọc hiện tại
        for (const param of searchParams.keys()) {
            searchParams.delete(param);
        }

        // Thêm các tham số lọc mới
        for (const [key, value] of Object.entries(newParams)) {
            if (value !== null && value !== undefined) {
                searchParams.set(key, value);
            }
        }

        return url.href;
    }

    $('[data-toggle="tooltip"]').tooltip();
    // truncateAndCopyText();

    var table = $('#table_products').DataTable({
        select: {
            style: 'multi', // Cho phép chọn nhiều hàng
            selector: 'td:first-child input[type="checkbox"]', // Chỉ định chọn checkbox
        },
        "aLengthMenu": [
            [25, 50, 100, 200, -1],
            [25, 50, 100, 200, "All"]
        ],
        "paging": false,
        "iDisplayLength": -1,
        "fixedHeader": true,
        columnDefs: [
            { targets: '_all', width: '50px' } // Đặt độ rộng tối đa của mỗi cột là 50px
        ],
        autoWidth: true
    });
    // Loop through each checkbox
    $('.column-toggle').each(function () {
        let column = table.column($(this).data('column'));
        // Check the initial state of the checkbox
        if (!$(this).is(':checked')) {
            column.visible(false);
        }
    });

    $('.column-toggle').on('change', function () {
        let columnChanged = table.column($(this).data('column'));
        let user = $(".column-filters").data('user');
        // list check box checked
        let listColumnVisible = [];
        $('.column-toggle').each(function () {
            if ($(this).is(':checked')) {
                listColumnVisible.push($(this).data('column'));
            }
        });

        columnChanged.visible(!columnChanged.visible());
        $.ajax({
            url: '/api/table_column',
            type: 'POST',
            data: JSON.stringify({
                column: listColumnVisible,
                user: user,
            }),
            success: function (response) {
            },
            error: function (error) {
            }
        })
    });

    $('.popup_img').magnificPopup({
        type: 'image'
    });

    $('#table_products').on('change', '.status-select', function () {
        const newValue = $(this).val();
        const orderId = $(this).data('order-id');
        const productId = $(this).data('product-id');
        const linkDes = $(this).data('link-des');
        const productType = $(this).data('product-type');
        const sku = $(this).data('sku');
        const row = $(this).closest('.order-row');
        if (confirm('Are you sure?')) {
            if (newValue === 'Sai design') {
                // Show modal to input note
                $('#noteModal').modal('show');

                // Handle note submission
                $('#noteModal').one('click', '#submitNote', function () {
                    const note = $('#noteInput').val();
                    updateOrderStatus(orderId, productId, newValue, note, row);

                    // set note to empty
                    $('#noteInput').val('');
                    // Close the modal
                    $('#noteModal').modal('hide');
                });
            }
            else if (newValue === 'Ready' && (linkDes === undefined || linkDes === null || linkDes === '')) {
                // request to server to get link des
                console.log('request to server to get link des')
                $.ajax({
                    url: '/api/get_link_des',
                    type: 'POST',
                    data: JSON.stringify({ sku: sku }),
                    success: function (response) {
                        if (response.status === 200) {
                            if (response.link_des === null) {
                                // Show modal to upload design reuse
                                $('#uploadOrderDesignReuse').modal('show');
                            } else {
                                // change status to ready
                                updateOrderStatus(orderId, productId, newValue, null, row);

                                const link_des = JSON.stringify(response.link_des).replace(/"/g, "'").replace(/','/g, "', '");

                                html = `
                                    <button type="button"
                                        class="btn btn-sm rounded-pill btn-label-primary download-btn"
                                        data-order-id="${orderId}" data-product-id="${productId}" data-link="${link_des}"
                                        data-product-type="${productType}">
                                        <i class="tf-icons bx bx-download"></i>
                                    </button>
                                `;

                                row.find('.link-des').html(html);
                            }
                        }
                        else {
                            uploadOrderDesignReuse(orderId, productId, sku)
                        }
                    },
                    error: function (error) {
                        console.log('error', error)
                        updateOrderStatus(orderId, productId, newValue, null, row);
                    }
                });
            }
            else {
                updateOrderStatus(orderId, productId, newValue, null, row);
            }
        }
    });

    function updateOrderStatus(orderId, productId, status, note, row) {
        const requestData = {
            orderId: orderId,
            productId: productId,
            status: status,
            note: note
        };

        $.ajax({
            url: '/api/change_order_status',
            type: 'POST',
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            success: function (response) {
                alert(response.message);
                if (response.status === 200) {
                    updateRowProperties(row, status);
                }
            },
            error: function (error) {
                console.log(error);
                alert(error);
            }
        });
    }

    function updateRowProperties(row, status) {
        row.attr('data-status', status);

        const colorMap = {
            'Ready': '#ecc3fc',
            'Done': '#c5ffd8',
            'Done recently': '#a3ff96',
            'In': '#b3d0ff',
            'Out': '#f8fca3',
            'Cancel': '#ff8c8c',
            'Doing': '#ffdc97',
            'FF Ngoai': '#d6d6d6',
            'Sai design': '#ffbd38',
            'Rejected': '#ffbd38',
            'Design uploaded': '#ffa6e0'
        };

        row.css('background-color', colorMap[status] || 'transparent');
    }


    $('#table_products').on('change', '.factory-select', function () {
        // if are you sure

        var newValue = $(this).val();
        var orderId = $(this).attr('data-order-id');
        var productId = $(this).attr('data-product-id');
        if (confirm('Are you sure?')) {
            $.ajax({
                url: '/api/change_order_factory',
                type: 'POST',
                data: JSON.stringify({
                    orderId: orderId,
                    productId: productId,
                    factory: newValue
                }),
                success: function (response) {
                    alert(response.message)
                },
                error: function (error) {
                    alert("Error: ", error);
                }
            })
        }
    });

    $('#table_products').on('click', '.delete-product', function () {
        var id = $(this).data('id');
        if (confirm('Are you sure?')) {
            $.ajax({
                url: '/api/delete_product',
                type: 'POST',
                data: JSON.stringify({ id: id, type: "fulfillment" }),
                success: function (result) {
                    alert('Product deleted successfully');
                    window.location.reload();
                },
                error: function (err) {
                    alert('Error deleting product');
                }
            });
        }
    });

    $('#table_products').on('click', '#check-all', function () {
        // Get the checked status of the "Check All" checkbox
        var isChecked = $(this).prop("checked");

        // Set the checked status of all other checkboxes based on the "Check All" checkbox
        $(".order-row input[type='checkbox']").prop("checked", isChecked);
    });



    $('#table_products').on('click', '.check-btn', function () {
        const button = $(this);
        const productId = button.data('product-id');
        const orderId = button.data('order-id');
        const lineItemId = button.data('lineitem-id');
        const link = button.data('link');
        const product_type = button.data('product-type');

        fetchImageInfo(
            link,
            product_type,
            function (response) {
                const images = response.images;
                
                const template = response.template;
                showModalWithImages(images, template, orderId, productId, lineItemId, true, orderId);
            },
            function (error) {
                console.error(error);
            }
        );
    });

    $('#table_products').on('click', '.download-btn', function () {
        const button = $(this);
        const link = button.data('link');
        const product_type = button.data('product-type');
        const orderId = button.data('order-id');

        fetchImageInfo(
            link,
            product_type,
            function (response) {
                
                const images = response.images;
                console.log(images)
                const template = response.template;
                showModalWithImages(images, template, null, null, null, false, orderId);
            },
            function (error) {
                console.error(error);
            }
        );
    });

    $('#table_products').on('click', '#archive', function () {
        let selectedCheckboxes = $('#table_products').find('td:first-child input[type="checkbox"]:checked');
        if (selectedCheckboxes.length < 1) {
            selectedCheckboxes = $('#table_products_api').find('td:first-child input[type="checkbox"]:checked');
        }

        let selectedValues = [];
        selectedCheckboxes.each(function () {
            const lineItemId = $(this).data('lineitem-id');
            selectedValues.push({ lineItemId: lineItemId });
            // if selectedCheckboxes not [] and not have orderId in selectedValues
        });
        $.ajax({
            url: '/api/archive_order',
            type: 'POST',
            data: JSON.stringify({ selectedValues: selectedValues }),
            success: function (response) {
                alert('Order archived successfully');
                window.location.reload();
            },
            error: function (error) {
                console.log('error', error)
            }
        });
    });

    $('#assignDes').on('click', function () {
        // search in db and return list of name
        $.ajax({
            url: '/api/search_designer',
            type: 'POST',
            success: function (response) {
                const designers = response.designers;
                $('#assignDesInput').typeahead(
                    {
                        hint: true,
                        highlight: true,
                        minLength: 1
                    },
                    {
                        name: 'designers',
                        source: substringMatcher(designers)
                    }
                );
            },
            error: function (error) {
                console.log('error', error)
            }
        });
    });

    $('#assignBtn').on('click', function () {
        // get value from assignDesInput
        let designer = $('#assignDesInput').val();
        let selectedCheckboxes = $('#table_products').find('td:first-child input[type="checkbox"]:checked');
        if (selectedCheckboxes.length < 1) {
            selectedCheckboxes = $('#table_products_api').find('td:first-child input[type="checkbox"]:checked');
        }

        let listDesigner = $('#assignDesInput').data('designer');

        // check designer is in listDesigner
        if (!listDesigner.includes(designer)) {
            alert('Please enter designer name in list');
            return false;
        }

        // check designer is empty
        if (designer === '') {
            alert('Please enter designer name');
            return false;
        }

        // check selectedCheckboxes is empty
        if (selectedCheckboxes.length < 1) {
            alert('Please select at least 1 order');
            return false;
        }

        let selectedValues = [];
        selectedCheckboxes.each(function () {
            const orderId = $(this).data('order-id');
            const productId = $(this).data('product-id');
            const lineItemId = $(this).data('lineitem-id');
            selectedValues.push({ orderId: orderId, productId: productId, lineItemId: lineItemId });
            // if selectedCheckboxes not [] and not have orderId in selectedValues
        });

        // Gửi AJAX lên server
        $.ajax({
            url: '/api/assign_designer',
            type: 'POST',
            data: JSON.stringify({ selectedValues: selectedValues, designer: designer }),
            success: function (response) {
                if (response.status !== 200) {
                    alert(response.message);
                    return false;
                } else {
                    alert('Order assigned successfully');
                    // change status of order
                    selectedCheckboxes.each(function () {
                        const row = $(this).closest('.order-row');
                        row.find('.status-select').val('Designing');
                        row.attr('data-status', 'Designing');
                        row.css('background-color', '#95c3c7');
                    });
                    // Ẩn modal
                    $('#assignDesModal').modal('hide');
                }
            },
            error: function (error) {
                console.log('error', error)
            }
        });
    });

    // Lắng nghe sự kiện click trên nút "Approve"
    $('#linkDesModal').on('click', '#approve', function () {
        const button = $(this); // Nút được bấm
        const productId = button.data('product-id'); // Lấy thông tin từ thuộc tính data-product-id
        const orderId = button.data('order-id'); // Lấy thông tin từ thuộc tính data-order-id
        const lineItemId = button.data('lineitem-id'); // Lấy thông tin từ thuộc tính data-lineitem-id
        // Gọi hàm API để lấy thông tin
        $.ajax({
            url: '/api/approve_designer', // Đường dẫn API
            type: 'POST',
            data: JSON.stringify({
                product_id: productId,
                order_id: orderId,
                line_item_id: lineItemId
            }),
            success: function (response) {
                // Cập nhật trạng thái của hàng
                const row = $(`.order-row[data-order-id="${orderId}"][data-product-id="${productId}"][data-lineitem-id="${lineItemId}"]`);
                row.find('.status-select').val('Ready');
                row.attr('data-status', 'Ready');
                alert("Approved successfully");
                // Ẩn modal
                $('#linkDesModal').modal('hide');
            },
            error: function (error) {
                console.error(error);
            }
        });
    });

    // Lắng nghe sự kiện click trên nút "reject"
    $('#linkDesModal').on('click', '#reject', function () {
        const button = $(this); // Nút được bấm
        const productId = button.data('product-id'); // Lấy thông tin từ thuộc tính data-product-id
        const orderId = button.data('order-id'); // Lấy thông tin từ thuộc tính data-order-id
        const lineItemId = button.data('lineitem-id'); // Lấy thông tin từ thuộc tính data-lineitem-id

        // show modal to input note
        $('#linkDesModal').modal('hide');
        $('#noteModal').modal('show');

        // Handle note submission
        $('#noteModal').one('click', '#submitNote', function () {
            const note = $('#noteInput').val();

            // Gọi hàm API để lấy thông tin
            $.ajax({
                url: '/api/reject_designer', // Đường dẫn API
                type: 'POST',
                data: JSON.stringify({
                    product_id: productId,
                    order_id: orderId,
                    line_item_id: lineItemId,
                    note: note
                }),
                success: function (response) {
                    // Cập nhật trạng thái của hàng
                    const row = $(`.order-row[data-order-id="${orderId}"][data-product-id="${productId}"][data-lineitem-id="${lineItemId}"]`);
                    row.find('.status-select').val('Rejected');
                    row.attr('data-status', 'Rejected');
                    alert("Rejected successfully");
                    // Ẩn modal
                    $('#noteModal').modal('hide');
                },
                error: function (error) {
                    console.error(error);
                }
            });
        });
    });

    $('#filter-order').on("submit", function (e) {
        e.preventDefault();
        // get value from filter
        const date = $('#date-range-picker-2').val();
        const status = $('#filter_status').val();
        const factory = $('#filter_factory').val();
        const designer = $('#filter_designer').val();
        const shop = $('#filter_shop').val();
        const team = $('#filter_team').val();
        const type = $('#filter_type').val();
        const seller = $('#filter_seller').val();
        const orderId = $('#filter_order_id').val();
        const trackingSynced = $('#filter_tracking_synced').val();
        const haveTracking = $('#filter_have_tracking').val();

        const shippingDay = $('#filter_shipping_day').length > 0 ? $('#filter_shipping_day').val() : null;
        const ffProvider = $('#filter_ff_provider').length > 0 ? $('#filter_ff_provider').val() : null;



        const page = 1;


        $('.loading_spinner').show();
        $('.render-results').hide();

        const scriptElements = document.getElementsByTagName('script');
        let newOrdersScriptLoaded = false;

        for (let i = 0; i < scriptElements.length; i++) {
            const src = scriptElements[i].getAttribute('src');
            if (src && src.includes('new_orders.min.js')) {
                newOrdersScriptLoaded = true;
                break;
            }
        }

        const route = window.location.pathname;
        const updatedParameters = {
                        date: date,
                        status: status,
                        factory: factory,
                        designer: designer,
                        shop: shop,
                        team: team,
                        type: type,
                        seller: seller,
                        order_id: orderId,
                        shipping_day: shippingDay,
                        tracking_synced: trackingSynced,
                        have_tracking: haveTracking,
                    };
    
        const newUrl = updateURLParameters(updatedParameters);
                    // if (Object.values(updatedParameters).some(val => val !== "" && val !== undefined)) {
                        
                    //     window.history.pushState({ path: newUrl }, '', newUrl);
                    // }
        window.location = newUrl;

        // send ajax to server
        // $.ajax({
        //     url: '/api/filter_order',
        //     type: 'POST',
        //     data: JSON.stringify({
        //         date: date,
        //         status: status,
        //         factory: factory,
        //         designer: designer,
        //         shop: shop,
        //         team: team,
        //         type: type,
        //         seller: seller,
        //         order_id: orderId,
        //         shipping_day: shippingDay,
        //         ff_provider_status: ffProvider,
        //         tracking_synced: trackingSynced,
        //         have_tracking: haveTracking,
        //         page: page,
        //         route: route
        //     }),
        //     success: function (response) {
        //         $('.render-results').html(response);
        //         $('.loading_spinner').hide();
        //         $('.render-results').show();

        //         // if (!newOrdersScriptLoaded) {
        //         //     $.getScript('/assets/js/new_orders.min.js');
        //         // };

        //         const updatedParameters = {
        //             date: date,
        //             status: status,
        //             factory: factory,
        //             designer: designer,
        //             shop: shop,
        //             team: team,
        //             type: type,
        //             seller: seller,
        //             order_id: orderId,
        //             shipping_day: shippingDay,
        //             tracking_synced: trackingSynced,
        //             have_tracking: haveTracking,
        //         };

        //         const newUrl = updateURLParameters(updatedParameters);
        //         if (Object.values(updatedParameters).some(val => val !== "" && val !== undefined)) {
        //             window.history.pushState({ path: newUrl }, '', newUrl);
        //         }
        //     },
        //     error: function (error) {
        //         $('.loading_spinner').hide();
        //         $('.render-results').html(error.message);
        //         $('.render-results').show();
        //     }
        // });
    });

    // When the "Import" button is clicked
    $('#importTracking').on('click', function () {
        // Get the selected file from the input field
        var selectedFile = $('#file')[0].files[0];

        // Create a FormData object to send the file
        var formData = new FormData();
        formData.append('file', selectedFile);

        // Perform an AJAX request to submit the form data
        $.ajax({
            url: '/api/import_trackings', // Change to the correct API URL
            method: 'POST', // Change to the correct method (POST/GET)
            data: formData, // Use the FormData object with the selected file
            contentType: false, // Set content type to false for file upload
            processData: false, // Set processData to false for file upload
            success: function (response) {
                // Process the response here
                // For example, if the response indicates success
                if (response.status === 'success') {
                    alert('Import tracking successfully');
                    // close modal
                    $('#importTrackingModal').modal('hide');
                } else {
                    alert('Import tracking failed');
                    $('#importTrackingModal').modal('hide');
                }
            },
            error: function () {
                alert('An error occurred while processing the request');
                $('#importTrackingModal').modal('hide');
            }
        });
    });

    $('#submitBulkEdit').on('click', function () {
        // get value from checkbox checked
        let selectedCheckboxes = $('#table_products').find('td:first-child input[type="checkbox"]:checked');
        if (selectedCheckboxes.length < 1) {
            selectedCheckboxes = $('#table_products_api').find('td:first-child input[type="checkbox"]:checked');
        }
        let selectedValues = [];
        selectedCheckboxes.each(function () {
            const orderId = $(this).data('order-id');
            const productId = $(this).data('product-id');
            selectedValues.push({ orderId: orderId, productId: productId });
        });
        // check selectedCheckboxes is empty
        if (selectedCheckboxes.length < 1) {
            alert('Please select at least 1 order');
            return false;
        }

        // Determine which tab is active
        const activeTab = $('.nav-link-2.active').data('bs-target'); // Get the active tab's target

        // Get the value based on the active tab
        let valueToSend;
        if (activeTab === "#navs-top-xuong") {
            valueToSend = $('#bulk_factory').val();
        } else if (activeTab === "#navs-top-status") {
            valueToSend = $('#bulk_status').val();
        } else if (activeTab === "#navs-top-type") {
            valueToSend = $('#bulk_type').val();
        }
            


        if (valueToSend === '') {
            alert('Please select value');
            return false;
        }

        // send ajax to server
        $.ajax({
            url: '/api/bulk_edit',
            type: 'POST',
            data: JSON.stringify({
                selectedValues: selectedValues,
                [activeTab.substring(1)]: valueToSend, // Use the valueToSend for the active tab
            }),
            success: function (response) {
                alert(response.message);

                // close modal
                $('#bulkEditModal').modal('hide');
                window.location.reload();
            },
            error: function (error) {
                console.log('error', error)
            }
        });
    });

    $('#submitReplace').on('click', function () {
        // get value from checkbox checked
        let selectedCheckboxes = $('#table_products').find('td:first-child input[type="checkbox"]:checked');
        if (selectedCheckboxes.length < 1) {
            selectedCheckboxes = $('#table_products_api').find('td:first-child input[type="checkbox"]:checked');
        }
        let selectedValues = [];
        selectedCheckboxes.each(function () {
            const orderId = $(this).data('order-id');
            const lineItemId = $(this).data('lineitem-id');
            selectedValues.push({ orderId: orderId, lineItemId: lineItemId });
        });
        // check selectedCheckboxes is empty
        if (selectedCheckboxes.length < 1) {
            alert('Please select at least 1 order');
            return false;
        }

        // get value from replaceInput
        const replaceInput = $('#replaceInput').val();

        // send ajax to server
        $.ajax({
            url: '/api/replace_items',
            type: 'POST',
            data: JSON.stringify({
                selectedValues: selectedValues,
                reason: replaceInput
            }),
            success: function (response) {
                alert(response.message);
                window.location.reload();
            },
            error: function (error) {
                console.log('error', error)
            }
        });
    });

    $('.copy-id').click(function () {
        var orderId = $(this).data('order-id');
        var name = $(this).data('name');

        // Sao chép dữ liệu vào clipboard
        var textToCopy = orderId + " - " + name;
        var tempInput = $('<input>');
        $('body').append(tempInput);
        tempInput.val(textToCopy).select();
        document.execCommand('copy');
        tempInput.remove();

        // Hiển thị thông báo "Copied!"
        var element = this;
        $(element).after('<span class="text-danger" style="margin-left: 5px; font-size: 10px;">Copied!</span>');
        setTimeout(function () {
            $(element).next('span').remove();
        }, 1500);
    });

    function exportData(endpoint, filename) {
        let selectedCheckboxes = $('#table_products').find('td:first-child input[type="checkbox"]:checked');
        if (selectedCheckboxes.length < 1) {
            selectedCheckboxes = $('#table_products_api').find('td:first-child input[type="checkbox"]:checked');
        }
        let selectedValues = [];
        selectedCheckboxes.each(function () {
            const orderId = $(this).data('order-id');
            const productId = $(this).data('product-id');
            selectedValues.push({ orderId: orderId, productId: productId });
        });

        if (selectedCheckboxes.length < 1) {
            alert('Please select at least 1 order');
            return false;
        }

        $.ajax({
            url: endpoint,
            type: 'POST',
            data: JSON.stringify({
                selectedValues: selectedValues,
            }),
            xhrFields: {
                responseType: 'blob'
            },
            success: function (response) {
                const blobURL = URL.createObjectURL(response);

                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobURL;
                a.download = filename;
                document.body.appendChild(a);

                a.click();

                document.body.removeChild(a);
            },
            error: function (error) {
                console.log('error', error);
            }
        });
    }

    

    $('#kiotviet').on('click', function () {
        exportData('/api/kiotviet', 'kiotviet.xlsx');
    });

    $('#export_xuong').on('click', function () {
        exportData('/api/export_xuong', 'export_xuong.xlsx');
    });
    

    $('#export_ship').on('click', function () {
        exportData('/api/export_ship', 'export_ship.xlsx');
    });

    $('#sync_tracking').on('click', function () {
        // get value from checkbox checked
        let selectedCheckboxes = $('#table_products').find('td:first-child input[type="checkbox"]:checked');
        if (selectedCheckboxes.length < 1) {
            selectedCheckboxes = $('#table_products_api').find('td:first-child input[type="checkbox"]:checked');
        }
        let selectedValues = [];
        selectedCheckboxes.each(function () {
            const orderId = $(this).data('order-id');
            const lineItemId = $(this).data('lineitem-id');
            selectedValues.push({ orderId: orderId, lineItemId: lineItemId });
        });
        // check selectedCheckboxes is empty
        if (selectedCheckboxes.length < 1) {
            alert('Please select at least 1 order');
            return false;   
        }

        // send ajax to server
        $.ajax({
            url: '/api/sync_tracking',
            type: 'POST',
            data: JSON.stringify({
                selectedValues: selectedValues,
            }),
            success: function (response) {
                alert(response.message);
                window.location.reload();
            },
            error: function (error) {
                alert('Error: ', error);
                console.log('error', error)
            }
        });
    });

    $('#export_flast_ship').on('click', function () {
        exportData('/api/export_flast_ship', 'export_flast_ship.csv');
    });

    $('#table_products').on('click', '.editable', function () {
        $(this).attr('contentEditable', true);
        $(this).find('.limited-text').removeClass('limited-text');
    });

    $('#table_products').on('click', '.editable-select', function () {
        // Allow selecting the option
        $(this).find('select').prop('disabled', false);
    });

    $('#table_products').on('blur', '.editable', async function () {
        const newValue = $(this).text();
        const orderId = $(this).data('order-id');
        const lineItemId = $(this).data('lineitem-id');
        const field = $(this).attr('data-field');
        const dataToSend = {
            orderId: orderId,
            lineItemId: lineItemId,
            field: field,
            value: newValue,
        };

        try {
            const response = await $.ajax({
                url: '/api/change_product_field',
                type: 'POST',
                data: JSON.stringify(dataToSend),
            });
            console.log(response.message);
        } catch (error) {
            console.log(error);
        }
    });


    $('#table_products').on('change', '.editable-select select', function () {
        const newValue = $(this).val();
        const orderId = $(this).closest('.editable-select').data('order-id');
        const lineItemId = $(this).closest('.editable-select').data('lineitem-id');
        const field = $(this).parent().attr('data-field');
        const dataToSend = {
            orderId: orderId,
            lineItemId: lineItemId,
            field: field,
            value: newValue,
        };

        $.ajax({
            url: '/api/change_product_field',
            type: 'POST',
            data: JSON.stringify(dataToSend),
            success: function (response) {
                // if field is product_type change xuong = response.xuong
                if (field === 'product_type') {
                    const row = $(`.order-row[data-order-id="${orderId}"][data-lineitem-id="${lineItemId}"]`);
                    row.find('.factory-select').val(response.xuong);
                    if (response.ff_status !== null) {
                        row.find('.status-select').val(response.ff_status);
                        row.attr('data-status', response.ff_status);
                    }
                }
                console.log(response.message);
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    $('.bs-rangepicker-single').each(function () {
        const value = $(this).data('value');

        const daterangepickerOptions = {
            singleDatePicker: true,
            opens: 'left',
            autoUpdateInput: false, // Prevent the input value from being automatically updated
            locale: {
                format: 'DD/MM/YYYY' // Set the desired date format
            }
        };

        if (value !== undefined && value !== "") {
            daterangepickerOptions.startDate = moment(value, 'DD/MM/YYYY');
            $(this).val(daterangepickerOptions.startDate.format('DD/MM/YYYY'));
        }

        $(this).daterangepicker(daterangepickerOptions);

        // Handle the apply event to update the input value
        $(this).on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('DD/MM/YYYY'));
            const newValue = $(this).val();
            const orderId = $(this).closest('.editable-date').data('order-id');
            const lineItemId = $(this).closest('.editable-date').data('lineitem-id');
            const field = $(this).closest('.editable-date').data('field');
            const dataToSend = {
                orderId: orderId,
                lineItemId: lineItemId,
                field: field,
                value: newValue,
            };

            $.ajax({
                url: '/api/change_product_field',
                type: 'POST',
                data: JSON.stringify(dataToSend),
                success: function (response) {
                    console.log(response.message);
                },
                error: function (error) {
                    console.log(error);
                }
            });
        });

        // Handle the cancel event to clear the input value
        $(this).on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
        });
    });

    $('#table_products').on('click', '.order-history', function (e) {
        e.preventDefault();
        var orderId = $(this).data('order-id');
        var lineItemId = $(this).data('lineitem-id');

        $.ajax({
            url: '/api/get_order_history',
            type: 'POST',
            data: JSON.stringify({ orderId: orderId, lineItemId: lineItemId }),
            contentType: 'application/json',
            success: function (response) {
                var html = '';
                console.log(response.result.length);
                for (var i = 0; i < response.result.length; i++) {
                    console.log(response.result[i]);
                    html += `
                    <li class="timeline-item timeline-item-transparent">
                        <span class="timeline-point-wrapper"><span class="timeline-point timeline-point-primary"></span></span>
                        <div class="timeline-event">
                            <div class="timeline-header border-bottom mb-3">
                                <h6 class="mb-0">${response.result[i]}</h6>
                            </div>
                        </div>
                    </li>
                    `;
                }
                console.log(html);
                $('#historyModal .timeline').html(html);
                $('#historyModal').modal('show');
            },
            error: function (error) {
                console.log('error', error)
            }
        });
    });

    setInterval(() => {
        $.ajax({
            url: '/api/set_statistics',
            type: 'POST',
            success: function (response) {
                try {
                    $('#total_ready').text(response.data.total_ready);
                    $('#total_confirming').text(response.data.total_confirming);
                    $('#total_pending').text(response.data.total_pending);
                    $('#total_doing').text(response.data.total_doing);
                    $('#total_sai_des').text(response.data.total_sai_design);
                    $('#total_design_uploaded').text(response.data.total_design_uploaded);
                    $('#total_in').text(response.data.total_in);
                    $('#total_out').text(response.data.total_out);
                    $('#total_half_done').text(response.data.total_half_done);
                    $('#total_designing').text(response.data.total_designing);
                    $('#total_ready_7').text(response.data.total_ready_7);
                    $('#total_none').text(response.data.total_none);
                } catch (error) {
                    console.log(error);
                }
            },
            error: function (error) {
                console.log('error', error)
            }
        });
    }, 5000);
});




