if (typeof table_2 === 'undefined') {
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
    function truncateText(element) {
       
        var text =  element.data('bs-original-title')
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
    
    $(document).ready(function () {
        var table_2 = $('#table_products_api').DataTable({
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
            let column = table_2.column($(this).data('column'));
            // Check the initial state of the checkbox
            if (!$(this).is(':checked')) {
                column.visible(false);
            }
        });

        $('.column-toggle').on('change', function () {
            let columnChanged = table_2.column($(this).data('column'));
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


        $('#table_products_api').on('change', '.factory-select', function () {
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

        $('#table_products_api').on('click', '.delete-product', function () {
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


        $('#table_products_api').on('change', '.status-select', function () {
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
                            console.error(error);
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

        $('#table_products_api').on('click', '.check-btn', function () {
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

        $('#table_products_api').on('click', '.download-btn', function () {
            const button = $(this);
            const link = button.data('link');
            const product_type = button.data('product-type');
            const orderId = button.data('order-id');

            fetchImageInfo(
                link,
                product_type,
                function (response) {
                    const images = response.images;
                    const template = response.template;
                    showModalWithImages(images, template, null, null, null, false, orderId);
                },
                function (error) {
                    console.error(error);
                }
            );
        });

        $('#table_products_api').on('click', '#archive', function () {
            let selectedCheckboxes = $('#table_products_api').find('td:first-child input[type="checkbox"]:checked');

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

        $('#table_products_api').on('click', '#check-all', function () {
            // Get the checked status of the "Check All" checkbox
            var isChecked = $(this).prop("checked");
            
            // Set the checked status of all other checkboxes based on the "Check All" checkbox
            $(".order-row input[type='checkbox']").prop("checked", isChecked);
        });
    
        $('#table_products_api').on('click', '.editable', function () {
            $(this).attr('contentEditable', true);
        });
        
        $('#table_products_api').on('click', '.editable-select', function () {
            // Allow selecting the option
            $(this).find('select').prop('disabled', false);
        });
        
        $('#table_products_api').on('blur', '.editable', function () {
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
        
        $('#table_products_api').on('change', '.editable-select select', function () {
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

    $('#table_products_api').on('click', '.order-history', function (e) {
        e.preventDefault();
        var orderId = $(this).data('order-id');
        var lineItemId = $(this).data('lineitem-id');
    
        $.ajax({
            url: '/api/get_order_history',
            type: 'POST',
            data: JSON.stringify({ orderId: orderId, lineItemId: lineItemId }),
            contentType: 'application/json', // Thêm header để cho server biết dữ liệu là JSON
            success: function (response) {
                var html = '';
                for (var i = 0; i < response.result.length; i++) { // Sử dụng response.length thay vì response.result
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
    
};




